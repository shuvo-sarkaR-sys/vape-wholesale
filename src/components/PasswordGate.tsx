import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';
import SmokeEffect from './SmokeEffect';

interface PasswordGateProps {
  onSuccess: () => void;
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorInput, setErrorInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'wholesale' ) {
      setIsSubmitting(true);
      setErrorInput(false);
      setTimeout(() => {
        onSuccess();
      }, 800);
    } else {
      setErrorInput(true);
      // Trigger subtle shake animation
      setTimeout(() => setErrorInput(false), 500);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 flex flex-col justify-between items-center px-4 overflow-hidden text-neutral-100 selection:bg-neutral-800">
      {/* Interactive Luxury Smoke Overlay */}
      <SmokeEffect density={2} colorType="mixed" />

      {/* Background Radial Ambiance */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/30 via-neutral-950 to-transparent pointer-events-none z-0" />

      {/* Top Header Grid Accent */}
      <div className="w-full flex justify-between items-center pt-8 max-w-7xl z-20">
        <div className="flex items-center gap-2">
          <span className="text-xs tracking-[0.25em] font-light text-neutral-400 uppercase">
           PUFFMANIA DISTRO.
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#62cdd9]/80 animate-pulse" />
        </div>
       
      </div>

      {/* Main Entry Shield Center Screen */}
      <div className="w-full max-w-md my-auto py-12 flex flex-col items-center relative z-20">
        {/* Animated Brand Shield Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div className="h-14 w-14 rounded-full border border-neutral-800 bg-neutral-900/80 flex items-center justify-center mb-6 shadow-inner relative group">
            <div className="absolute inset-0 rounded-full bg-[#62cdd9]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Lock className="text-[#62cdd9] group-hover:rotate-6 transition-transform duration-300" size={20} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-sans tracking-tight font-light text-neutral-100">
            PUFFMANIA DISTRO.
          </h1>
          <p className="text-xs tracking-[0.4em] text-neutral-400 font-light mt-2 uppercase">
            PRIVATE WHOLESALE INGRESS
          </p>
        </motion.div>

        {/* Input Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full bg-neutral-900/60 backdrop-blur-md border border-neutral-900 rounded-2xl p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2 font-light">
                Credentials Access Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter private passkey"
                  className={`w-full bg-neutral-950/80 text-white rounded-lg pl-4 pr-12 py-3 border.5 focus:outline-none transition-all duration-300 placeholder-neutral-600 font-mono tracking-widest ${
                    errorInput 
                      ? 'border-red-500 animate-shake focus:ring-1 focus:ring-red-500' 
                      : 'border-neutral-800 focus:border-[#62cdd9]/50 focus:ring-1 focus:ring-[#62cdd9]/20'
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              <AnimatePresence>
                {errorInput && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs mt-2 font-mono"
                  >
                    Authentication failed. Invalid passkey.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#62cdd9] text-neutral-950 hover:bg-[#62cdd9]/80 font-sans tracking-widest uppercase text-xs font-semibold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>DECRYPTING VAULT...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>ENTER CATALOG PORTAL</span>
                  <ArrowRight size={14} />
                </div>
              )}
            </button>
          </form>

         
        </motion.div>

        {/* Brand Authenticity Notice */}
        <p className="text-[10px] text-neutral-600 tracking-widest text-center mt-6 uppercase leading-relaxed max-w-sm font-light font-mono">
          Strictly for authorized distributors. Verified corporate credentials and tobacco license required post-authentication.
        </p>
      </div>

      {/* Footer Design Line */}
      <div className="w-full py-8 text-center border-t border-neutral-900/40">
        <p className="text-[10px] font-mono tracking-widest text-neutral-600">
          © PUFFMANIA DISTRO LUXURY DISTRIBUTION PRESETS • ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}
