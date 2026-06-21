import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { connectToDatabase, dbOperations } from './src/lib/db';
import { Product, BusinessAccount, Order } from './src/types';
import { hashPassword, verifyPassword, validatePasswordStrength, bruteForceSentinel } from './src/lib/security';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Body parsing middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
    limit: '50mb',
    extended: true
}));

// ==========================================
// 📨 SECURE MAIL TRANSPORTER UTILITIES
// ==========================================
console.log("resend api key configured:", !!process.env.RESEND_API_KEY);
console.log("mongodb uri configured:", !!process.env.MONGODB_URI);

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || '"Pacific Smoke Wholesale" <no-reply@pacificsmokewholesale.local>';

const getMailTransporter = async () => {
  return { send: async (mailOptions: any) => {
    const result = await resend.emails.send({
      from: mailOptions.from,
      to: mailOptions.to,
      ...(mailOptions.replyTo && { replyTo: mailOptions.replyTo }),
      subject: mailOptions.subject,
      html: mailOptions.html,
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    return {
      messageId: result.data?.id,
      response: result.data?.id
    };
  }};
};

type OtpPurpose = 'buyer-reset' | 'admin-login';

interface OtpRecord {
  code: string;
  email: string;
  purpose: OtpPurpose;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpRecord>();
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const ADMIN_LOGIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();
let adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function getOtpKey(purpose: OtpPurpose, email: string): string {
  return `${purpose}:${normalizeEmail(email)}`;
}

function createOtpCode(): string {
  return String(crypto.randomInt(100000, 1000000));
}

function storeOtpCode(purpose: OtpPurpose, email: string, code: string) {
  otpStore.set(getOtpKey(purpose, email), {
    code,
    email: normalizeEmail(email),
    purpose,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
}

function verifyOtpCode(purpose: OtpPurpose, email: string, code: string): { valid: boolean; expired?: boolean; attemptsLeft?: number } {
  const key = getOtpKey(purpose, email);
  const record = otpStore.get(key);

  if (!record) {
    return { valid: false, expired: true };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, expired: true };
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    const attemptsLeft = Math.max(0, OTP_MAX_ATTEMPTS - record.attempts);
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(key);
    } else {
      otpStore.set(key, record);
    }
    return { valid: false, attemptsLeft };
  }

  otpStore.delete(key);
  return { valid: true };
}

async function sendOtpEmail(params: {
  to: string;
  subject: string;
  title: string;
  code: string;
  intro: string;
  actionLabel: string;
}) {
  const transporter = await getMailTransporter();
  const fromAddress = SENDER_EMAIL;

  const info = await transporter.send({
    from: fromAddress,
    to: params.to,
    subject: params.subject,
    text: `${params.intro}\n\nYour one-time code is: ${params.code}\n\n${params.actionLabel}\n`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; background: #111; color: #f5f5f5; border: 1px solid #222; border-radius: 14px; overflow: hidden;">
        <div style="height: 4px; background: linear-gradient(90deg, #d97706, #f59e0b, #d97706);"></div>
        <div style="padding: 28px;">
          <div style="font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: #f59e0b; margin-bottom: 12px; font-weight: 700;">Pacific Smoke Wholesale</div>
          <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600;">${params.title}</h2>
          <p style="margin: 0 0 22px 0; color: #cfcfcf; line-height: 1.6; font-size: 14px;">${params.intro}</p>
          <div style="display: inline-block; background: #0b0b0b; border: 1px solid #2a2a2a; border-radius: 10px; padding: 14px 20px; margin-bottom: 22px;">
            <span style="font-size: 28px; letter-spacing: 0.28em; font-family: monospace; color: #f59e0b; font-weight: 700;">${params.code}</span>
          </div>
          <p style="margin: 0; color: #8f8f8f; font-size: 12px; line-height: 1.6;">${params.actionLabel}</p>
        </div>
      </div>
    `,
  });

  return null;
}


app.post('/api/contact/send', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const phone = String(req.body?.phone || '').trim();
    const topic = String(req.body?.topic || 'General Inquiry').trim();
    const message = String(req.body?.message || '').trim();

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Name, email, phone, and message are required.' });
    }

    const transporter = await getMailTransporter();
    const recipient =  process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL ;
    const fromAddress = SENDER_EMAIL;

    const info = await transporter.send({
      from: fromAddress,
      to: recipient,
      replyTo: email,
      subject: `[Contact Us] ${topic} - ${name}`,
      text: [
        `New contact request received from the website.`,
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Topic: ${topic}`,
        '',
        `Message:`,
        message,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 640px; margin: 0 auto; background: #111; color: #f5f5f5; border: 1px solid #222; border-radius: 14px; overflow: hidden;">
          <div style="height: 4px; background: linear-gradient(90deg, #d97706, #f59e0b, #d97706);"></div>
          <div style="padding: 28px;">
            <div style="font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: #f59e0b; margin-bottom: 12px; font-weight: 700;">Pacific Smoke Wholesale</div>
            <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700;">New Contact Submission</h2>
            <p style="margin: 0 0 22px 0; color: #cfcfcf; line-height: 1.6; font-size: 14px;">${topic}</p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #8f8f8f; width: 120px;">Name</td><td style="padding: 8px 0; color: #fff;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #8f8f8f;">Email</td><td style="padding: 8px 0; color: #fff;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #8f8f8f;">Phone</td><td style="padding: 8px 0; color: #fff;">${phone}</td></tr>
              <tr><td style="padding: 8px 0; color: #8f8f8f;">Topic</td><td style="padding: 8px 0; color: #fff;">${topic}</td></tr>
            </table>

            <div style="background: #0b0b0b; border: 1px solid #2a2a2a; border-radius: 10px; padding: 16px; white-space: pre-wrap; line-height: 1.6; color: #e5e5e5;">${message}</div>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'Contact message sent successfully.', previewUrl: null, sentTo: recipient });
  } catch (err: any) {
    console.error('❌ Failed to send contact message:', err);
    res.status(500).json({ error: 'Unable to send contact message.', details: err.message });
  }
});

// ==========================================
// ⚡ FULL-STACK REST API ENDPOINTS
// ==========================================

// 📨 Secure OTP Verification Dispatcher
app.post('/api/otp/send', async (req, res) => {
  try {
    const { email, code, businessName } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Required security keys and destination is undefined.' });
    }

    const transporter = await getMailTransporter();
    const fromAddress = SENDER_EMAIL;

    const info = await transporter.send({
      from: fromAddress,
      to: email,
      subject: `[Pacific Smoke Wholesale] OTP Security Verification Code: ${code}`,
      text: `Hello ${businessName || 'Business Owner'},\n\nYour 6-digit security verification code is: ${code}\n\nThis code is valid for registration and login purposes, and protects your corporate dispatch profile. Please enter this code in the compliance portal to verify your account.\n\nBest regards,\nPacific Smoke Wholesaler Portal Admin Team`,
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #121212; border: 1px solid #1f1f1f; border-radius: 12px; overflow: hidden; color: #e5e5e5; box-shadow: 0 4px 20px rgba(0,0,0,0.65);">
          <!-- Top Accent Bar -->
          <div style="height: 4px; background: linear-gradient(90deg, #d97706, #f59e0b, #d97706);"></div>
          
          <div style="padding: 30px; text-align: center;">
            <div style="font-size: 10px; letter-spacing: 0.25em; color: #f59e0b; font-family: monospace; text-transform: uppercase; font-weight: bold; margin-bottom: 12px;">
              SECURE COMPLIANCE TRANSCRIPTION
            </div>
            
            <h2 style="font-weight: 300; font-size: 20px; color: #ffffff; margin: 0 0 12px 0;">
              Verify Your <span style="font-weight: 600; color: #f59e0b;">Merchant Identity</span>
            </h2>
            
            <p style="font-size: 13px; color: #a3a3a3; line-height: 1.6; margin: 0 0 24px 0; font-weight: 300; padding: 0 10px;">
              A register request has been made for your retail storefront <strong style="color: #ffffff; font-weight: 500;">${businessName || 'Pacific Boutique Shop'}</strong> (${email}). Enter the following regulatory verification key:
            </p>
            
            <!-- Code Block display -->
            <div style="background-color: #0b0b0b; border: 1px solid #262626; padding: 16px; border-radius: 8px; margin-bottom: 24px; display: inline-block; width: 75%;">
              <span style="font-family: monospace; font-size: 26px; font-weight: bold; letter-spacing: 0.3em; color: #f59e0b; display: block; line-height: 1; padding-left: 0.35em;">
                ${code}
              </span>
            </div>
            
            <p style="font-size: 11px; color: #737373; line-height: 1.5; margin: 0 0 24px 0; padding: 0 5px;">
              If you did not initiate this request, you can safely ignore this correspondence. Your registry will remain locked until this token is processed.
            </p>
            
            <div style="border-top: 1px solid #1f1f1f; padding-top: 20px; font-size: 9px; font-family: monospace; color: #525252; text-transform: uppercase; letter-spacing: 0.15em;">
              Authorized by Secur-Key Portal Server • Vancouver, BC
            </div>
          </div>
        </div>
      `,
    });

    console.log(`✉️ Email dispatched to: ${email}`);

    res.json({
      success: true,
      message: 'OTP verification key successfully processed.',
      previewUrl: null,
      sentTo: email
    });
  } catch (err: any) {
    console.error('❌ Failed to dispatch OTP email:', err);
    res.status(500).json({ error: 'Mail delivery service stalled.', details: err.message });
  }
});

app.post('/api/auth/buyer/password-reset/request', async (req, res) => {
  try {
    const email = normalizeEmail(String(req.body?.email || ''));
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const buyers = await dbOperations.getBuyers();
    const buyer = buyers.find((item) => item.email.toLowerCase() === email);
    if (!buyer) {
      return res.status(404).json({ error: 'No buyer account found for that email.' });
    }

    const code = createOtpCode();
    storeOtpCode('buyer-reset', email, code);

    const previewUrl = await sendOtpEmail({
      to: email,
      subject: '[Pacific Smoke Wholesale] Password Reset Verification Code',
      title: 'Buyer Password Reset',
      code,
      intro: `A password reset was requested for ${buyer.businessName}. Use the code below to create a new password.`,
      actionLabel: 'This code expires in 10 minutes and can only be used once.',
    });

    res.json({ success: true, message: 'Reset code sent.', previewUrl, sentTo: email });
  } catch (err: any) {
    console.error('❌ Failed to send buyer reset OTP:', err);
    res.status(500).json({ error: 'Reset code delivery failed.', details: err.message });
  }
});

app.post('/api/auth/buyer/password-reset/confirm', async (req, res) => {
  try {
    const email = normalizeEmail(String(req.body?.email || ''));
    const code = String(req.body?.code || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required.' });
    }

    const strengthResult = validatePasswordStrength(newPassword);
    if (!strengthResult.isValid) {
      return res.status(400).json({ error: strengthResult.feedback || 'The new password does not meet security standards.' });
    }

    const otpResult = verifyOtpCode('buyer-reset', email, code);
    if (!otpResult.valid) {
      return res.status(401).json({
        error: otpResult.expired ? 'Reset code expired or missing. Request a new code.' : `Invalid reset code. ${otpResult.attemptsLeft ?? 0} attempts remaining.`,
      });
    }

    const updated = await dbOperations.updateBuyerPassword(email, newPassword);
    if (!updated) {
      return res.status(404).json({ error: 'Buyer account not found.' });
    }

    const buyers = await dbOperations.getBuyers();
    const account = buyers.find((item) => item.email.toLowerCase() === email);
    if (!account) {
      return res.status(404).json({ error: 'Buyer account not found.' });
    }

    const { password, ...scrubbed } = account;
    res.json({ success: true, account: scrubbed, message: 'Password updated successfully.' });
  } catch (err: any) {
    console.error('❌ Failed to confirm buyer password reset:', err);
    res.status(500).json({ error: 'Password reset failed.', details: err.message });
  }
});

app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const email = normalizeEmail(String(req.body?.email || ''));
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password are required.' });
    }

    if (email !== ADMIN_LOGIN_EMAIL) {
      return res.status(403).json({ error: 'This email is not authorized for admin access.' });
    }

    if (!verifyPassword(password, adminPasswordHash)) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    res.json({ success: true, message: 'Administrator authenticated.' });
  } catch (err: any) {
    console.error('❌ Failed to verify admin password login:', err);
    res.status(500).json({ error: 'Admin login failed.', details: err.message });
  }
});

app.post('/api/auth/admin/password-reset/request', async (req, res) => {
  try {
    const email = normalizeEmail(String(req.body?.email || ''));
    if (!email) {
      return res.status(400).json({ error: 'Admin email is required.' });
    }

    if (email !== ADMIN_LOGIN_EMAIL) {
      return res.status(403).json({ error: 'This email is not authorized for admin access.' });
    }

    const code = createOtpCode();
    storeOtpCode('admin-login', email, code);

    const previewUrl = await sendOtpEmail({
      to: email,
      subject: '[Pacific Smoke Wholesale] Admin Password Reset OTP',
      title: 'Admin Password Reset',
      code,
      intro: 'Use the one-time code below to reset your administrator password.',
      actionLabel: 'This code expires in 10 minutes and can only be used once.',
    });

    res.json({ success: true, message: 'Admin reset OTP sent.', previewUrl, sentTo: email });
  } catch (err: any) {
    console.error('❌ Failed to send admin password reset OTP:', err);
    res.status(500).json({ error: 'Admin reset OTP delivery failed.', details: err.message });
  }
});

app.post('/api/auth/admin/password-reset/confirm', async (req, res) => {
  try {
    const email = normalizeEmail(String(req.body?.email || ''));
    const code = String(req.body?.code || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Admin email, OTP code, and new password are required.' });
    }

    if (email !== ADMIN_LOGIN_EMAIL) {
      return res.status(403).json({ error: 'This email is not authorized for admin access.' });
    }

    const strengthResult = validatePasswordStrength(newPassword);
    if (!strengthResult.isValid) {
      return res.status(400).json({ error: strengthResult.feedback || 'The new password does not meet security standards.' });
    }

    const otpResult = verifyOtpCode('admin-login', email, code);
    if (!otpResult.valid) {
      return res.status(401).json({
        error: otpResult.expired ? 'Admin reset OTP expired or missing. Request a new code.' : `Invalid admin reset OTP. ${otpResult.attemptsLeft ?? 0} attempts remaining.`,
      });
    }

    adminPasswordHash = hashPassword(newPassword);
    res.json({ success: true, message: 'Administrator password updated.' });
  } catch (err: any) {
    console.error('❌ Failed to confirm admin password reset:', err);
    res.status(500).json({ error: 'Admin password reset failed.', details: err.message });
  }
});

app.post('/api/auth/admin/otp/request', async (req, res) => {
  try {
    const email = normalizeEmail(String(req.body?.email || ''));
    if (!email) {
      return res.status(400).json({ error: 'Admin email is required.' });
    }

    if (email !== ADMIN_LOGIN_EMAIL) {
      return res.status(403).json({ error: 'This email is not authorized for admin access.' });
    }

    const code = createOtpCode();
    storeOtpCode('admin-login', email, code);

    const previewUrl = await sendOtpEmail({
      to: email,
      subject: '[ PUFFMANIA DISTRO] Admin Login OTP',
      title: 'Admin OTP Login',
      code,
      intro: 'Use the one-time code below to complete administrator sign in.',
      actionLabel: 'This code expires in 10 minutes and can only be used once.',
    });

    res.json({ success: true, message: 'Admin OTP sent.', previewUrl, sentTo: email });
  } catch (err: any) {
    console.error('❌ Failed to send admin OTP:', err);
    res.status(500).json({ error: 'Admin OTP delivery failed.', details: err.message });
  }
});

app.post('/api/auth/admin/otp/verify', async (req, res) => {
  try {
    const email = normalizeEmail(String(req.body?.email || ''));
    const code = String(req.body?.code || '').trim();

    if (!email || !code) {
      return res.status(400).json({ error: 'Admin email and OTP code are required.' });
    }

    if (email !== ADMIN_LOGIN_EMAIL) {
      return res.status(403).json({ error: 'This email is not authorized for admin access.' });
    }

    const otpResult = verifyOtpCode('admin-login', email, code);
    if (!otpResult.valid) {
      return res.status(401).json({
        error: otpResult.expired ? 'Admin OTP expired or missing. Request a new code.' : `Invalid admin OTP. ${otpResult.attemptsLeft ?? 0} attempts remaining.`,
      });
    }

    res.json({ success: true, message: 'Administrator verified.' });
  } catch (err: any) {
    console.error('❌ Failed to verify admin OTP:', err);
    res.status(500).json({ error: 'Admin OTP verification failed.', details: err.message });
  }
});

// 🟢 Connection Status & Telemetry
app.get('/api/system/status', async (req, res) => {
  const isConnected = dbOperations.getIsConnected();
  const dbType = dbOperations.getDbType();
  res.json({
    status: 'ONLINE',
    dbType,
    clientConnected: isConnected,
    environment: process.env.NODE_ENV || 'development',
    mongoUriConfigured: !!process.env.MONGODB_URI,
    activeTime: new Date().toISOString()
  });
});

// 📦 Products Catalogue Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await dbOperations.getProducts();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to query product stream.', details: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const productData: Product = req.body;
    if (!productData.id || !productData.name) {
      return res.status(400).json({ error: 'Missing core catalog attributes.' });
    }
    await dbOperations.addProduct(productData);
    res.status(201).json({ success: true, message: 'Registry updated.', product: productData });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to write custom item.', details: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patchData = req.body;
    const success = await dbOperations.updateProduct(id, patchData);
    if (!success) {
      return res.status(404).json({ error: 'Target product not found.' });
    }
    res.json({ success: true, message: 'Product specifications updated.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to patch product details.', details: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await dbOperations.deleteProduct(id);
    if (!success) {
      return res.status(404).json({ error: 'Target product not found in ledger.' });
    }
    res.json({ success: true, message: 'Product decommissioned.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to remove target item.', details: error.message });
  }
});

// 🤝 B2B Merchant Accounts & State Licences Registry
app.get('/api/buyers', async (req, res) => {
  try {
    const buyers = await dbOperations.getBuyers();
    // Scrub passwords for transport security
    const sanitised = buyers.map(({ password, ...rest }) => rest);
    res.json(sanitised);
  } catch (error: any) {
    res.status(500).json({ error: 'Database catalog unavailable.' });
  }
});

app.post('/api/buyers/register', async (req, res) => {
  try {
    const account: BusinessAccount = req.body;
    if (!account.businessName || !account.email  || !account.password) {
      return res.status(400).json({ error: 'Required registration metrics not provided.' });
    }
    
    // Check password complexity strength rules
    const strengthResult = validatePasswordStrength(account.password);
    if (!strengthResult.isValid) {
      return res.status(400).json({ error: strengthResult.feedback || 'The chosen password does not meet corporate security standards.' });
    }
    
    const success = await dbOperations.registerBuyer(account);
    if (!success) {
      return res.status(409).json({ error: 'A merchant profile with this email already exists.' });
    }
    
    const { password, ...scrubbed } = account;
    res.status(201).json({ success: true, account: scrubbed });
  } catch (error: any) {
    res.status(500).json({ error: 'Registration pipeline failed.', details: error.message });
  }
});

app.post('/api/buyers/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Invalid login metrics.' });
    }

    const lookupEmail = email.toLowerCase().trim();
    
    // 1. Check brute force security lockout state
    const lockoutState = bruteForceSentinel.isLocked(lookupEmail);
    if (lockoutState.locked) {
      return res.status(423).json({ 
        error: `Security lock active. Too many unsuccessful validation requests. Retry in ${lockoutState.remainingSeconds} seconds.` 
      });
    }

    const buyers = await dbOperations.getBuyers();
    const matched = buyers.find((b) => b.email.toLowerCase() === lookupEmail);
    
    if (!matched) {
      bruteForceSentinel.registerFailure(lookupEmail);
      return res.status(404).json({ error: 'Corporate account does not exist or has expired.' });
    }

    const expectedPassword = matched.password ;
    
    // 2. Perform Timing-Safe Cryptographic Scrypt verification
    const isMatched = verifyPassword(password, expectedPassword);
    
    if (!isMatched) {
      const failureState = bruteForceSentinel.registerFailure(lookupEmail);
      let errMsg = 'Invalid credentials. Please verify security key.';
      if (failureState.locked) {
        errMsg = 'Security lock active: Too many consecutive invalid requests. This account is locked for 5 minutes.';
      } else {
        errMsg += ` (${failureState.attemptsLeft} login attempts remaining before temporary lock)`;
      }
      return res.status(401).json({ error: errMsg });
    }

    // 3. Authenticated - Clear attempts metric
    bruteForceSentinel.registerSuccess(lookupEmail);

    const { password: _, ...scrubbed } = matched;
    res.json({ success: true, account: scrubbed });
  } catch (error: any) {
    res.status(500).json({ error: 'Authentication engine handshake failed.' });
  }
});

// 📝 Orders Ledger / Invoices
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await dbOperations.getOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load system invoice listings.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData: Order = req.body;
    if (!orderData.id || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Empty wholesale payload transmission.' });
    }

    // Format for DB operations
    const formattedOrder: any = {
      id: orderData.id,
      buyerEmail: orderData.businessAccount.email,
      businessName: orderData.businessAccount.businessName,
      items: orderData.items,
      totalAmount: orderData.total,
      status: orderData.status === 'Pending Verification' ? 'Pending' : 'Approved',
      createdAt: orderData.orderDate,
      
    };

    await dbOperations.createOrder(formattedOrder);
    res.status(201).json({ success: true, message: 'Commercial invoice recorded.', order: orderData });
  } catch (error: any) {
    res.status(500).json({ error: 'Order processing pipeline stalled.', details: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Proposed status not received.' });
    }
    const success = await dbOperations.updateOrderStatus(id, status);
    if (!success) {
      return res.status(404).json({ error: 'Order identifier not found.' });
    }
    res.json({ success: true, message: 'Shipping ledger status updated.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update order state.' });
  }
});

// ==========================================
// 🚀 VITE INTEGRATION MIDDLEWARE LAYER
// ==========================================

async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const connectionStatus = await connectToDatabase();
  console.log(`🗄️ Database mode: ${connectionStatus.dbType}`);

  const startListening = (port: number) => {
    const server = app.listen(port, HOST, () => {
      console.log(`📡 Full-Stack Pacific B2B Server active at http://localhost:${port}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' && port < PORT + 10) {
        console.warn(`⚠️ Port ${port} is busy, trying ${port + 1}...`);
        startListening(port + 1);
        return;
      }

      throw error;
    });

    return server;
  };

  startListening(PORT);
}

initializeServer();