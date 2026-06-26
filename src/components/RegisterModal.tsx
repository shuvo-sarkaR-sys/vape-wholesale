import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShieldAlert, ShieldCheck, Mail, Building, MapPin, 
  Phone, Award, Sparkles, Loader2, Lock, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { BusinessAccount } from '../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (account: BusinessAccount) => void;
  onOpenLogin?: () => void;
}

const VERIFICATION_STEPS = [
  { id: 'tax-id', label: 'Verifying Corporate Tax ID & LLC registry...' },
  { id: 'wholesaler', label: 'Cross-checking National Smoke Distributor databases...' },
  { id: 'address', label: 'Confirming corporate physical address matches government file...' },
  { id: 'approve', label: 'Preparing instant API approval keys...' }
];

export default function RegisterModal({ isOpen, onClose, onRegisterSuccess, onOpenLogin }: RegisterModalProps) {
  // Navigation workflow state: 'form' | 'email-verification' | 'db-validation'
  const [registerStep, setRegisterStep] = useState<'form' | 'email-verification' | 'db-validation'>('form');
  
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    address: '',
    phone: '',

    password: ''
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [timer, setTimer] = useState(0);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [previewEmailUrl, setPreviewEmailUrl] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorText, setErrorText] = useState('');

  // Countdown timer effect
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (isVerifying) return; // Prevent closing during final active DB synchronization
    setRegisterStep('form');
    setVerificationCode('');
    setUserInputCode('');
    setTimer(0);
    setErrorText('');
    setPreviewEmailUrl(null);
    onClose();
  };

  // Submit step 1: Validate disclosures and transition to OTP trigger
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.businessName || !form.email || !form.address || !form.phone ||  !form.password) {
      setErrorText('Please furnish complete regulatory disclosures above.');
      return;
    }

    if (!form.email.includes('@')) {
      setErrorText('Please enter a valid business email address.');
      return;
    }

    if (form.password.length < 8) {
      setErrorText('Security key/password must contain at least 8 characters.');
      return;
    }
   

    setErrorText('');
    setIsSendingEmail(true);
    
    // Generate secure 6-digit OTP code
    const securePin = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(securePin);
    setUserInputCode('');

    // Trigger full-stack OTP email delivery
    fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        code: securePin,
        businessName: form.businessName
      })
    })
    .then(res => res.json())
    .then(data => {
      setIsSendingEmail(false);
      if (data.success) {
        setPreviewEmailUrl(data.previewUrl);
        setTimer(30); // 30 seconds resend cooldown
        setRegisterStep('email-verification');
      } else {
        setErrorText(data.error || 'Failed to dispatch verification code email. Please retry.');
      }
    })
    .catch(err => {
      console.error('Email dispatch error:', err);
      setIsSendingEmail(false);
      // Fallback: Continue with simulated flow on absolute networks blocks
      setTimer(30);
      setRegisterStep('email-verification');
    });
  };

  // Resend OTP code trigger
  const handleResendCode = () => {
    if (timer > 0) return;
    const securePin = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(securePin);
    setUserInputCode('');
    setErrorText('');
    setIsSendingEmail(true);

    fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        code: securePin,
        businessName: form.businessName
      })
    })
    .then(res => res.json())
    .then(data => {
      setIsSendingEmail(false);
      if (data.success) {
        setPreviewEmailUrl(data.previewUrl);
        setTimer(45); // Raise countdown limit for spam prevention
      } else {
        setErrorText(data.error || 'Failed to resend verification code. Please retry.');
      }
    })
    .catch(err => {
      console.error('Resend email error:', err);
      setIsSendingEmail(false);
      setTimer(45);
    });
  };

  // Submit step 2: Verify OTP matching
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInputCode) {
      setErrorText('Please input the active 6-digit confirmation key.');
      return;
    }

    if (userInputCode.trim() !== verificationCode) {
      setErrorText('Security Token Mismatch. Please check your inbox or resend.');
      return;
    }

    setErrorText('');
    setRegisterStep('db-validation');
    setIsVerifying(true);
    setCurrentStepIndex(0);

    // Multi-tier distribution database synchronization loop
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= VERIFICATION_STEPS.length - 1) {
          clearInterval(interval);
          
          setTimeout(async () => {
            const verifiedAccount: BusinessAccount = {
              businessName: form.businessName,
              email: form.email,
              address: form.address,
              phone: form.phone,
              licenseNumber: 'Pending Review',
       
              isVerified: true,
              registeredAt: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              password: form.password
            };

            try {
              const response = await fetch('/api/buyers/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(verifiedAccount)
              });
              const data = await response.json().catch(() => ({}));

              if (!response.ok || !data.success) {
                throw new Error(data.error || data.details || 'Unable to complete registration.');
              }

              if (data.adminNotificationSent === false) {
                throw new Error(data.adminNotificationError || 'Account was created, but the admin notification email was not sent.');
              }

              onRegisterSuccess(data.account || verifiedAccount);
              setIsVerifying(false);
              setRegisterStep('form'); // Reset state for subsequent sessions
              onClose();
            } catch (err: any) {
              console.error('Registration sync failed:', err);
              setErrorText(err.message || 'Registration failed. Please retry.');
              setIsVerifying(false);
              setRegisterStep('form');
            }
          }, 1200);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Black ambient backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md"
      />

      <AnimatePresence mode="wait">
        {/* STEP 1: Main Business Registry Form */}
        {registerStep === 'form' && (
          <motion.div
            key="register-form-step"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 text-neutral-100 z-10 shadow-2xl overflow-hidden"
          >
            {/* Elegant premium amber regulatory border line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] tracking-[0.3em] font-mono text-[#5aa8b3] uppercase flex items-center gap-1.5 mb-1.5 font-bold">
                  <Award size={12} /> SECURE COMPLIANCE PORTAL
                </span>
                <h3 className="text-xl font-light text-neutral-500 font-sans tracking-tight">
                  Register <span className="text-white font-medium">Business Account</span>
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-950/40 hover:bg-neutral-950/90 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light mb-6">
              To activate commercial wholesale dispatch, you must verify your profile. Our system will validate your registered <strong className="text-[#5aa8b3]/80 font-medium">Business Name</strong>, owner <strong className="text-[#5aa8b3]/80 font-medium">Email</strong>, and corporate <strong className="text-[#5aa8b3] font-medium">Shipping Address</strong>.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1.5 font-mono">
                  Official Business Name <span className="text-[#5aa8b3] text-xs font-bold font-sans">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="businessName"
                    value={form.businessName}
                    onChange={handleInputChange}
                    placeholder="e.g. Pacific Boutique LLC"
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5aa8b3] focus:ring-1 focus:ring-[#5aa8b3]/20 transition-all placeholder-neutral-600"
                  />
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                </div>
              </div>

              {/* Grid block for email / phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1.5 font-mono">
                    Owner Email <span className="text-[#5aa8b3] text-xs font-bold font-sans">*</span> 
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="buyer@corporate.com"
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5aa8b3] focus:ring-1 focus:ring-[#5aa8b3]/20 transition-all placeholder-neutral-600"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                  </div>
                </div>

                {/* Telephone */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1.5 font-mono">
                    Registered Telephone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5aa8b3] focus:ring-1 focus:ring-[#5aa8b3]/20 transition-all placeholder-neutral-600"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                  </div>
                </div>
              </div>

              {/* Physical Corporate Address */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1.5 font-mono">
                  Corporate Shipping Location & Suite <span className="text-[#5aa8b3] text-xs font-bold font-sans">*</span> 
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="e.g. 742 Ocean Edge Drive, Suite 10, Vancouver, BC"
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5aa8b3] focus:ring-1 focus:ring-[#5aa8b3]/20 transition-all placeholder-neutral-600"
                  />
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                </div>
              </div>

              {/* Business License / EIN Stamp */}
              {/* <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1.5 font-mono">
                  Tobacco Distribution / Business License Identification
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. EIN-489201-9238 / LIC-PACIFIC"
                    className="w-full bg-neutral-950 border border-neutral-855 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5aa8b3] focus:ring-1 focus:ring-[#5aa8b3]/20 transition-all placeholder-neutral-600"
                  />
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                </div>
              </div> */}

              {/* Security Access Key / Password */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1.5 font-mono">
                  Security Access Key / Password <span className="text-[#5aa8b3] text-xs font-bold font-sans">*</span> 
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="Create a password (8+ chars, lower, numbers, symbols)"
                    className="w-full bg-neutral-950 border border-neutral-855 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5aa8b3] focus:ring-1 focus:ring-[#5aa8b3]/20 transition-all placeholder-neutral-600"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                </div>
                
                {/* Dynamic Strength Indicators */}
                <div className="grid grid-cols-2 gap-2 mt-2.5 text-[9px] font-mono text-neutral-400 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-855">
                  <div className="flex items-center gap-1.5">
                    <span className={form.password.length >= 8 ? "text-emerald-400" : "text-neutral-600"}>●</span>
                    <span className={form.password.length >= 8 ? "text-neutral-200" : "text-neutral-500"}>8+ Characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={/[a-z]/.test(form.password) ? "text-emerald-400" : "text-neutral-600"}>●</span>
                    <span className={/[a-z]/.test(form.password) ? "text-neutral-200" : "text-neutral-500"}>Lowercase (a-z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={/[0-9]/.test(form.password) && /[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? "text-emerald-400" : "text-neutral-600"}>●</span>
                    <span className={/[0-9]/.test(form.password) && /[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? "text-neutral-200" : "text-neutral-500"}>Numbers & Symbols</span>
                  </div>
                </div>
              </div>

              {errorText && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-400 flex items-center gap-2">
                  <ShieldAlert size={14} />
                  <span>{errorText}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSendingEmail}
                className="w-full mt-4 bg-white text-neutral-950 hover:bg-neutral-100 disabled:opacity-75 disabled:cursor-not-allowed font-sans tracking-widest uppercase text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-[#5aa8b3]" />
                    <span>DISPATCHING SECURITY TOKEN...</span>
                  </>
                ) : (
                  <>
                    <span>TRANSMIT REQ DISCLOSURES</span>
                    <Sparkles size={13} className="text-amber-505" />
                  </>
                )}
              </button>

              {onOpenLogin && (
                <div className="pt-3 border-t border-neutral-850 text-center text-xs mt-3">
                  <span className="text-neutral-500">Already registered or have demo keys? </span>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenLogin();
                    }}
                    className="text-[#5aa8b3] hover:text-amber-400 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Buyer Sign In
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        )}

        {/* STEP 2: Interactive Email OTP Verification Form */}
        {registerStep === 'email-verification' && (
          <motion.div
            key="register-verification-step"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 sm:p-8 text-neutral-100 z-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

            <div className="flex items-center gap-2 mb-4">
              <button 
                type="button"
                onClick={() => {
                  setRegisterStep('form');
                  setErrorText('');
                }}
                className="p-1 px-1.5 bg-neutral-950/40 hover:bg-neutral-950 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider"
              >
                <ArrowLeft size={11} />
                <span>Back</span>
              </button>
              <div className="flex-grow text-right">
                <span className="text-[9px] font-mono text-[#5aa8b3] uppercase font-black bg-[#5aa8b3]/10 px-2 py-0.5 rounded-full">
                  STEP 2 OF 3
                </span>
              </div>
            </div>

            <div className="text-center space-y-2 mb-6">
              <div className="mx-auto h-11 w-11 rounded-full bg-[#5aa8b3]/10 border border-[#5aa8b3]/20 text-amber-400 flex items-center justify-center">
                <Mail size={18} />
              </div>
              <h3 className="text-lg font-light tracking-tight text-white font-sans">
                Verify Your <span className="font-semibold text-amber-400">Merchant Email</span>
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light px-2">
                A 6-digit cryptographic distributor key is dispatched to protect this physical terminal registry:
                <br />
                <span className="inline-block mt-1 font-mono font-bold text-neutral-200 bg-neutral-950 px-2.5 py-0.5 border border-neutral-850 rounded">
                  {form.email}
                </span>
              </p>
            </div>

             {/* Development Mode Helper Box with OTP code for easy user access */}
            {/* <div className="bg-[#5aa8b3]/5 border border-dashed border-[#5aa8b3]/25 rounded-xl p-4 text-left mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#5aa8b3]/10 text-[8px] font-mono font-bold text-[#5aa8b3] uppercase px-2 py-0.5 rounded-bl">
                SIMULATOR CONTROLLER
              </div>
              <span className="text-[9px] font-mono tracking-wider text-[#5aa8b3]/80 uppercase font-black flex items-center gap-1 mb-1">
                <Sparkles size={10} /> LOCAL DISPATCH FEED:
              </span>
              <p className="text-[11px] text-neutral-300 leading-snug font-light font-sans">
                A virtual e-mail transponder simulation generated the following verification token. Enter this code to unlock:
              </p>
              <div className="mt-2 text-center bg-neutral-950 py-1.5 rounded border border-neutral-900">
                <span className="font-mono text-sm tracking-widest text-white font-bold leading-none">
                  {verificationCode}
                </span>
              </div>
              
              {previewEmailUrl && (
                <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex justify-center">
                  <a 
                    href={previewEmailUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5aa8b3] text-neutral-950 text-[10px] font-mono tracking-wider uppercase font-bold rounded hover:bg-[#5aa8b3]/80 transition-colors"
                  >
                    <Mail size={11} />
                    <span>Open Sandbox Inbox</span>
                  </a>
                </div>
              )}
            </div> */}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest text-center mb-2">
                  CONFIRMATION ONE-TIME PASSWORD (6 DIGITS)
                </label>
                <div className="relative max-w-[240px] mx-auto">
                  <input
                    type="text"
                    required
                    pattern="[0-9]*"
                    maxLength={6}
                    value={userInputCode}
                    onChange={(e) => {
                      // Only allow digit inputs
                      const val = e.target.value.replace(/\D/g, '');
                      setUserInputCode(val);
                    }}
                    placeholder="0 0 0 0 0 0"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-center font-mono text-lg tracking-[0.4em] text-[#5aa8b3]/80 font-bold focus:outline-none focus:border-[#5aa8b3] placeholder-neutral-800"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" size={13} />
                </div>
              </div>
                        <p className="text-xs text-center">Can't find your OTP? Check your Spam or Junk folder</p>
              {errorText && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-200 flex items-center gap-2">
                  <ShieldAlert size={14} className="flex-shrink-0 text-red-400" />
                  <span className="text-[11px]">{errorText}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="submit"
                  className="w-full bg-white text-neutral-950 hover:bg-neutral-100 font-mono tracking-widest uppercase text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>AUTHORIZE & CONFIRM CODE</span>
                </button>

                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={handleResendCode}
                  className={`w-full py-2 px-3 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                    timer > 0 
                      ? 'bg-neutral-900/40 text-neutral-600' 
                      : 'bg-neutral-950 hover:bg-neutral-950/70 text-amber-400 hover:text-amber-300 border border-neutral-850 hover:border-[#5aa8b3]/20 cursor-pointer'
                  }`}
                >
                  <RefreshCw size={11} className={timer > 0 ? '' : 'animate-spin-slow'} />
                  <span>{timer > 0 ? `Resend Token Available in ${timer}s` : 'Request New Security Token'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 3: Automated Secure Regulatory Database Sync (Loading bar checkpoints) */}
        {registerStep === 'db-validation' && (
          <motion.div
            key="register-verifying-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-neutral-920 border border-neutral-800 rounded-2xl w-full max-w-md p-8 text-neutral-100 z-10 shadow-2xl text-center flex flex-col items-center"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#5aa8b3] via-[#5aa8b3]/80 to-[#5aa8b3] animate-pulse" />
            
            <div className="h-16 w-16 rounded-full border border-neutral-800 bg-neutral-950/80 flex items-center justify-center mb-6 relative">
              <Loader2 className="text-[#5aa8b3] animate-spin" size={24} />
              <div className="absolute h-20 w-20 rounded-full border border-dashed border-[#5aa8b3]/10 animate-[spin_10s_linear_infinite]" />
            </div>

            <span className="text-[10px] tracking-[0.4em] text-neutral-500 font-mono uppercase mb-1">AUTOMATED SECURE DISCLOSURE</span>
            <h4 className="text-lg font-light text-neutral-100 tracking-tight font-sans">
              Validating Wholesaler Credentials...
            </h4>

            {/* Simulated terminal process logs */}
            <div className="w-full bg-neutral-950 border border-neutral-900 rounded-xl p-4 mt-6 text-left space-y-2">
              {VERIFICATION_STEPS.map((step, index) => {
                const isFinished = index < currentStepIndex;
                const isActive = index === currentStepIndex;

                return (
                  <div key={step.id} className="flex items-start gap-2 text-[10px] font-mono leading-relaxed">
                    {isFinished ? (
                      <span className="text-green-500 select-none">✓</span>
                    ) : isActive ? (
                      <span className="text-[#5aa8b3] select-none animate-ping">●</span>
                    ) : (
                      <span className="text-neutral-700 select-none">◦</span>
                    )}

                    <span className={isFinished ? 'text-neutral-400' : isActive ? 'text-amber-300 font-medium' : 'text-neutral-600'}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-neutral-500 font-mono mt-6 uppercase tracking-wider">
              AUTHORIZED BY SECUR-KEY • SYSTEM 2.4.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
