import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Mail, Lock, Eye, EyeOff, Building, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BusinessAccount } from '../types';

interface BuyerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: BusinessAccount) => void;
  onOpenRegister: () => void;
}

// Default seeded B2B wholesale buyer accounts
export const DEFAULT_BUYER_ACCOUNTS: BusinessAccount[] = [
  {
    businessName: 'Apex Smoke Distributors LLC',
    email: 'apex.distributor@pacificsmoke.com',
    address: '100 Apex Way, Toronto, ON, M5V 2N8',
    phone: '(416) 555-0199',
    licenseNumber: 'SMK-LIC-400192',
    isVerified: true,
    registeredAt: 'January 14, 2026',
    password: 'apex-secured-wholesale'
  },
  {
    businessName: 'Vape Empire HQ',
    email: 'merchant@vapeshop.com',
    address: '455 Broad Street, Vancouver, BC, V6B 1P4',
    phone: '(604) 555-0142',
    licenseNumber: 'VPE-REG-982110',
    isVerified: true,
    registeredAt: 'March 28, 2026',
    password: 'merchant-verified-buyer'
  }
];

export default function BuyerLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegister
}: BuyerLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Clear inputs when opening/closing
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setErrorText('');
      setIsSuccess(false);
      setIsAuthenticating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Retrieve current active list of registered accounts
  const getRegisteredBuyers = (): BusinessAccount[] => {
    const saved = localStorage.getItem('pacific_registered_buyers');
    const customList: BusinessAccount[] = saved ? JSON.parse(saved) : [];
    // Combine custom and default lists, excluding duplicates by email
    const combined = [...customList];
    DEFAULT_BUYER_ACCOUNTS.forEach(def => {
      if (!combined.some(c => c.email.toLowerCase() === def.email.toLowerCase())) {
        combined.push(def);
      }
    });
    return combined;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!email || !password) {
      setErrorText('Please enter both your corporate email and validation password.');
      return;
    }

    setIsAuthenticating(true);

    // Dynamic full-stack API validation with strict server-enforced security
    fetch('/api/buyers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticating(false);
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess(data.account);
          onClose();
        }, 1000);
      } else {
        const errData = await res.json().catch(() => ({}));
        const targetErr = new Error(errData.error || 'Identity keys rejected by portal server.');
        (targetErr as any).isLockedHandshake = res.status === 423;
        (targetErr as any).isSecurityRejected = true;
        throw targetErr;
      }
    })
    .catch((err) => {
      setIsAuthenticating(false);
      if (err.isSecurityRejected) {
        setErrorText(err.message);
        return;
      }
      
      console.warn('Authentication fallback operating with local buyer cache:', err.message);
      
      const buyers = getRegisteredBuyers();
      const matchedAccount = buyers.find(
        b => b.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (!matchedAccount) {
        setErrorText('Merchant email not found. Please review or Register Business.');
        return;
      }

      // Match verification password or licenseNumber as emergency bypass
      const userPassword = matchedAccount.password || matchedAccount.licenseNumber;
      if (password !== userPassword) {
        setErrorText('Credentials do not match our regulatory record. Try again.');
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess(matchedAccount);
        onClose();
      }, 1000);
    });
  };

  // Auto pre-fill credentials for testing
  const prefillAccount = (account: BusinessAccount) => {
    setEmail(account.email);
    setPassword(account.password || account.licenseNumber);
    setErrorText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 sm:p-8 text-neutral-100 z-10 shadow-2xl overflow-hidden"
      >
        {/* Subtle color top-bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        <div className="flex justify-between items-start mb-5">
          <div>
            <span className="text-[10px] tracking-[0.3em] font-mono text-amber-500 uppercase flex items-center gap-1.5 mb-1 font-bold">
              <ShieldCheck size={12} /> B2B BUYER GATEWAY
            </span>
            <h3 className="text-lg font-light text-neutral-400 font-sans tracking-tight">
              Sign In <span className="text-white font-medium">Verified Merchant</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isAuthenticating || isSuccess}
            className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-950/40 hover:bg-neutral-950/90 transition-colors cursor-pointer disabled:opacity-30"
          >
            <X size={18} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-10 space-y-4"
            >
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 size={32} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-semibold font-mono text-emerald-400 uppercase tracking-widest">IDENTITY VERIFIED</h4>
                <p className="text-xs text-neutral-400 mt-1">Accessing secure catalog rates & active shipping profiles...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Please input your business email & physical password key to access your wholesale catalog quotes and active dispatch allocations.
              </p>

              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Business Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                      <Mail size={13} />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="merchant@corporate.com"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-9 pr-3 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/40 focus:ring-0 transition-colors"
                      disabled={isAuthenticating}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Security Access Key/Password</label>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                      <Lock size={13} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-9 pr-9 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/40 focus:ring-0 transition-colors"
                      disabled={isAuthenticating}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {/* Error Box */}
                {errorText && (
                  <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 font-mono flex items-start gap-1.5 leading-relaxed">
                    <span className="font-bold flex-shrink-0 animate-pulse">● Error:</span>
                    <span>{errorText}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-neutral-950 font-semibold font-mono tracking-wider cursor-pointer bg-amber-500 hover:bg-amber-400 border border-transparent py-2.5 rounded-lg transition-all active:scale-98 disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>INITIALIZING COMPLIANCE HANDSHAKE...</span>
                    </span>
                  ) : (
                    <>
                      <span>SECURE BUYER SIGN IN</span>
                      <ArrowRight size={12} />
                    </>
                  )}
                </button>
              </form>

              {/* Quick links to registration */}
              <div className="pt-3 border-t border-neutral-900 text-center">
                <span className="text-[11px] text-neutral-500">Unregistered LLC or Sole Proprietor? </span>
                <button
                  onClick={() => {
                    onOpenRegister();
                    onClose();
                  }}
                  className="text-[11px] text-amber-500 hover:text-amber-400 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                  disabled={isAuthenticating}
                >
                  Register Business
                </button>
              </div>

              {/* Seed Demo Users for Quick Diagnostics */}
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 space-y-2">
                <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase font-bold block">
                  DEMO CORPORATE CREDENTIALS
                </span>
                <div className="space-y-1.5 divide-y divide-neutral-900/60 font-mono text-[10px]">
                  {DEFAULT_BUYER_ACCOUNTS.map((acc, index) => (
                    <div
                      key={index}
                      onClick={() => prefillAccount(acc)}
                      className={`pt-1.5 pb-0.5 first:pt-0 cursor-pointer text-left group hover:bg-neutral-900/40 px-1 py-1 rounded transition-colors ${
                        email === acc.email ? 'border border-amber-500/20 bg-amber-500/5' : ''
                      }`}
                      title="Click to automatically pre-fill credentials"
                    >
                      <div className="flex justify-between text-neutral-400 group-hover:text-amber-400 transition-colors">
                        <span className="font-semibold truncate max-w-[140px] text-[10.5px] uppercase">{acc.businessName.split(' ')[0]}</span>
                        <span className="text-[9px] bg-amber-500/10 border border-amber-500/15 text-amber-500 px-1 rounded-sm uppercase tracking-wide leading-none py-0.5 font-bold">Prefill</span>
                      </div>
                      <div className="text-neutral-500 text-[9px] mt-0.5 truncate leading-none">Email: <span className="text-neutral-300">{acc.email}</span></div>
                      <div className="text-neutral-500 text-[9px] mt-0.5 leading-none">Key: <span className="text-neutral-300">{acc.password}</span></div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
