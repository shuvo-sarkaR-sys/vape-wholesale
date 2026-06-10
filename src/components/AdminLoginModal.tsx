import React, { useEffect, useState} from 'react';
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
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
      setIsOtpSent(false);
      setIsResetMode(false);
      setErrorMessage('');
      setSuccessMessage('');
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both admin email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator credentials.');
      }

      onLoginSuccess();
      onClose();
       
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetOtp = async () => {
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Please enter the admin email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Unable to send admin reset OTP.');
      }

      setIsOtpSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send admin reset OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !otp || !newPassword || !confirmPassword) {
      setErrorMessage('Please furnish your email, OTP code, and new password twice.');
      return;
    }

    if (!email) {
      setErrorMessage('Please enter the admin email address.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('The new password and confirmation do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, newPassword })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Unable to reset administrator password.');
      }

      setSuccessMessage(data.message || 'Administrator password updated.');
      setIsOtpSent(false);
      setOtp('');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsResetMode(false);
        setSuccessMessage('');
      }, 1400);
      setOtp('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to reset administrator password.');
    } finally {
      setIsLoading(false);
    }
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
              <Key size={11} /> ADMIN OTP ENTRY
            </span>
            <h3 className="text-xl font-light tracking-tight text-white mt-2">
              Administrator <span className="font-semibold text-amber-400">Login Terminal</span>
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Sign in with email and password, or use OTP to recover access if needed.
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
            LOGIN + RECOVERY
          </div>
          <span className="text-[9px] font-mono tracking-wider text-amber-400 uppercase font-bold flex items-center gap-1 mb-1.5">
            <Sparkles size={10} /> SYSTEM TEST ADMIN EMAIL:
          </span>
          <div className="space-y-1 text-xs text-neutral-300 font-mono">
            <div className="flex justify-between border-b border-neutral-900 pb-1">
              <span className="text-neutral-500">EMAIL:</span>
              <span className="text-white select-all">Use your configured admin email</span>
            </div>
            <div className="text-[10px] text-neutral-500 pt-1 leading-relaxed">
              Password sign-in is primary. OTP is used only for password recovery.
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isResetMode ? (
            <motion.form
              key="login"
              onSubmit={handleLogin}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
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
                    placeholder="admin@yourdomain.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder-neutral-700"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setIsOtpSent(false);
                      setErrorMessage('');
                      setSuccessMessage('');
                      setOtp('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-[10px] font-mono text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder-neutral-700"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
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

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-400 flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-850 text-neutral-950 disabled:text-neutral-600 font-mono tracking-widest uppercase text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:translate-y-[1px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>VERIFYING PASSWORD...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    <span>ADMIN SIGN IN</span>
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="reset"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Enter your admin email, request an OTP, then set a new password.
              </p>

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
                    placeholder="admin@yourdomain.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder-neutral-700"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                </div>
              </div>

              {isOtpSent && (
                <>
                  <div>
                    <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                      One-Time Passcode
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        disabled={isLoading}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder-neutral-700 tracking-[0.45em]"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder-neutral-700"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
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

                  <div>
                    <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder-neutral-700"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                    </div>
                  </div>
                </>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-400 flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-mono text-emerald-400 flex items-center gap-2">
                  <ShieldCheck size={14} className="flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSendResetOtp}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-850 text-neutral-200 disabled:text-neutral-600 font-mono tracking-widest uppercase text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-800"
                >
                  {isLoading && !isOtpSent ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>SENDING OTP...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={14} />
                      <span>{isOtpSent ? 'RESEND OTP' : 'SEND OTP'}</span>
                    </>
                  )}
                </button>

                {isOtpSent && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleResetPassword({ preventDefault: () => {} } as React.FormEvent)}
                    className="w-full mt-2 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-850 text-neutral-950 disabled:text-neutral-600 font-mono tracking-widest uppercase text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:translate-y-[1px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>UPDATING PASSWORD...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} />
                        <span>RESET PASSWORD</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setIsOtpSent(false);
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="w-full text-[10px] font-mono text-neutral-500 hover:text-white transition-colors cursor-pointer uppercase tracking-widest"
                  disabled={isLoading}
                >
                  Back to password login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[9px] text-neutral-500 font-mono text-center mt-6 uppercase leading-snug">
          Unauthorized electronic access triggers cryptographic tracking protocol.
        </p>
      </motion.div>
    </div>
  );
}
