import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { connectToDatabase, dbOperations } from './src/lib/db';
import { Product, BusinessAccount, Order } from './src/types';
import { verifyPassword, validatePasswordStrength, bruteForceSentinel } from './src/lib/security';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Body parsing middlewares
app.use(express.json());

// ==========================================
// 📨 SECURE MAIL TRANSPORTER UTILITIES
// ==========================================
console.log("smtp host:", process.env.SMTP_HOST);
console.log("mongodb uri configured:", !!process.env.MONGODB_URI);
let cachedTransporter: nodemailer.Transporter | null = null;

const getMailTransporter = async (): Promise<nodemailer.Transporter> => {
  if (cachedTransporter) return cachedTransporter;

  // Custom SMTP setup if supplied in environmental parameters
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`✨ Initializing production SMTP transporter for host: ${process.env.SMTP_HOST}`);
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  // Fallback testing SMTP account for visual inspection in preview container environment
  console.log('📬 No SMTP settings found. Generating volatile testing Ethereal SMTP transporter...');
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`✅ Transient sandbox SMTP client generated successfully! User: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err: any) {
    console.error('❌ Ethereal SMTP account generation failed. Initializing minimal mock transporter.', err.message);
    // Minimal pass-through mocked transporter
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }
};

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
    const fromAddress = process.env.SMTP_FROM || '"Pacific Smoke Wholesale" <no-reply@pacificsmokewholesale.local>';

    const info = await transporter.sendMail({
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

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`✉️ Email dispatched to: ${email}`);
    if (previewUrl) {
      console.log(`🔗 Sandbox Mailbox URL: ${previewUrl}`);
    }

    res.json({
      success: true,
      message: 'OTP verification key successfully processed.',
      previewUrl: previewUrl || null,
      sentTo: email
    });
  } catch (err: any) {
    console.error('❌ Failed to dispatch OTP email:', err);
    res.status(500).json({ error: 'Mail delivery service stalled.', details: err.message });
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
    if (!productData.id || !productData.name || !productData.price) {
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
    if (!account.businessName || !account.email || !account.licenseNumber || !account.password) {
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

    const expectedPassword = matched.password || matched.licenseNumber;
    
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
      licenseNumber: orderData.businessAccount.licenseNumber
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
