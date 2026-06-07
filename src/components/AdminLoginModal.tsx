import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, X, AlertCircle, Loader2, Key, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Default secure credentials to act as fallback and sandbox unlock
  const ADMIN_EMAIL = 'admin@pacificsmoke.com';
  const ADMIN_PASSWORD = 'pacific-secure-admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please furnish complete administrative audit keys.');
      return;
    }

    // High fidelity email validator
    if (!email.includes('@') || email.toLowerCase() !== ADMIN_EMAIL) {
      setErrorMessage('Access Denied: Unregistered Administrator Identity.');
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      setErrorMessage('Access Denied: Invalid Security Passcode.');
      return;
    }

    setIsLoading(true);

    // Simulate cryptographic challenge verification
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
      onClose();
      // Clean form buffer
      setEmail('');
      setPassword('');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Black backdrop block */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 sm:p-8 text-neutral-100 z-10 shadow-2xl overflow-hidden"
      >
        {/* Red/Amber security visual accents */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
        <div className="absolute top-0 right-0 h-28 w-28 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] tracking-[0.3em] font-mono text-amber-500 uppercase flex items-center gap-1.5 mb-1 bg-amber-500/10 px-2 py-0.5 rounded-full w-fit font-bold">
              <Key size={11} /> SECURE CRYPTOGRAPHIC ENTRY
            </span>
            <h3 className="text-xl font-light tracking-tight text-white mt-2">
              Administrator <span className="font-semibold text-amber-400">Desk Terminal</span>
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Input secure credentials to grant executive consignment controls.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-950/40 hover:bg-neutral-950/90 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Authorized sandbox note for easy validation */}
        <div className="bg-neutral-950 border border-neutral-850/80 rounded-xl p-4 text-left mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500/10 text-[8px] font-mono font-bold text-amber-400 uppercase px-2 py-0.5 rounded-bl">
            SANDBOX KEYS
          </div>
          <span className="text-[9px] font-mono tracking-wider text-amber-400 uppercase font-bold flex items-center gap-1 mb-1.5">
            <Sparkles size={10} /> SYSTEM TEST CREDENTIALS:
          </span>
          <div className="space-y-1 text-xs text-neutral-300 font-mono">
            <div className="flex justify-between border-b border-neutral-900 pb-1">
              <span className="text-neutral-500">EMAIL:</span>
              <span className="text-white select-all">{ADMIN_EMAIL}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-neutral-500">PASSWORD:</span>
              <span className="text-white select-all">{ADMIN_PASSWORD}</span>
            </div>
          </div>
        </div>

        {/* Entry Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input field */}
          <div>
            <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
              Secure Admin Mail Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ADMIN_EMAIL}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder-neutral-700"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            </div>
          </div>

          {/* Password secure key input field */}
          <div>
            <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
              Cryptographic Passcode Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder-neutral-700"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
              
              {/* Toggle visibility */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Validation challenges errors warning */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-400 flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Trigger validation button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-850 text-neutral-950 disabled:text-neutral-600 font-mono tracking-widest uppercase text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:translate-y-[1px]"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>DECRYPTING VAULT KEY...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>UNPASS SECURED DESK</span>
              </>
            )}
          </button>

        </form>

        <p className="text-[9px] text-neutral-500 font-mono text-center mt-6 uppercase leading-snug">
          Unauthorized electronic access triggers cryptographic tracking protocol.
        </p>
      </motion.div>
    </div>
  );
}
