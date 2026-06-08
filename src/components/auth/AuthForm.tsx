'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Custom loader and accessibility states
  const [loadingMessage, setLoadingMessage] = useState('Generating secure OTP...');
  
  // Element Refs for safe keyboard focus redirects
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Rotate secure status messages every 1.2s while API request is pending
  useEffect(() => {
    if (!loading || step !== 'email') return;
    
    const messages = [
      'Generating secure OTP...',
      'Encrypting verification session...',
      'Sending verification code...',
      'Establishing secure connection...',
      'Almost there...'
    ];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingMessage(messages[currentIndex]);
    }, 1200);

    return () => clearInterval(interval);
  }, [loading, step]);

  // Restore keyboard focus on failure
  useEffect(() => {
    if (!loading && error) {
      if (type === 'signup' && !name && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }
  }, [loading, error, type, name]);

  // Focus verification entry box when step changes to code
  useEffect(() => {
    if (step === 'code' && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [step]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submissions
    
    setLoading(true);
    setError('');
    const startTime = Date.now();
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: type === 'signup' ? name : undefined }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      
      // Enforce a minimum loader display duration of 1500ms to guarantee smooth transitions
      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) {
        await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
      }
      
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }
      
      // Redirect to dashboard after successful login/signup
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[#0b0b0f]/60 border border-white/[0.08] backdrop-blur-2xl shadow-2xl relative overflow-hidden min-h-[360px]">
      
      {/* Premium secure overlay with zero layout shifts */}
      <AnimatePresence>
        {loading && step === 'email' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-[#0b0b0f]/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20"
            role="dialog"
            aria-modal="true"
            aria-label="OTP dispatch verification secure session"
          >
            {/* Glowing Secure Ring/Spinner - GPU-optimized transitions */}
            <div className="relative w-14 h-14 mb-6 shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-indigo-500/20 border-b-purple-500 border-l-purple-500/20 animate-spin" />
              <div className="absolute inset-2 bg-indigo-500/5 rounded-full animate-pulse" />
              <div className="absolute inset-3.5 rounded-full border border-white/5 bg-[#0b0b0f] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
            </div>

            {/* Dynamic Loading Message with Screen Reader Support */}
            <div className="h-6 flex items-center justify-center" aria-live="polite">
              <motion.span
                key={loadingMessage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-300 text-center bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent"
              >
                {loadingMessage}
              </motion.span>
            </div>
            
            {/* Bouncing Dot Indicators */}
            <div className="flex space-x-1.5 mt-3.5 motion-reduce:hidden">
              <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" />
            </div>

            <span className="text-[8px] text-gray-600 font-extrabold uppercase tracking-widest mt-10 select-none">
              Secured verification session
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="text-center mb-8 relative z-10 select-none">
        <h2 className="text-2xl font-black tracking-tight text-white mb-2.5">
          {type === 'login' ? 'Welcome back' : 'Create sandbox'}
        </h2>
        <p className="text-[12px] font-semibold text-gray-400 max-w-[280px] mx-auto leading-relaxed">
          {step === 'email' 
            ? 'Enter email credentials to sync authorization records' 
            : `Verification dispatch sent securely to ${email}`
          }
        </p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3.5 rounded-xl bg-red-500/5 border border-red-500/15 text-red-400 text-xs font-bold text-center"
        >
          {error}
        </motion.div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOTP} className="space-y-4.5 relative z-10">
          {type === 'signup' && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                <input
                  id="name"
                  type="text"
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-3.5 lg:py-2.5 rounded-xl bg-black/60 border border-white/[0.08] text-white text-xs font-semibold placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
              <input
                id="email"
                type="email"
                ref={emailInputRef}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-3.5 lg:py-2.5 rounded-xl bg-black/60 border border-white/[0.08] text-white text-xs font-semibold placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || !email || (type === 'signup' && !name)}
            className="w-full mt-6 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] text-xs font-black h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_8px_30px_rgb(99,102,241,0.3)] lg:h-11 lg:rounded-xl lg:bg-none lg:bg-white lg:hover:bg-slate-200 lg:text-black lg:shadow-lg lg:shadow-white/5"
          >
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Continue dispatch'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4.5 relative z-10">
          <div className="space-y-1.5">
            <label htmlFor="code" className="block text-[10px] font-black uppercase tracking-wider text-gray-400 text-center">
              Verification Code
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
              <input
                id="code"
                type="text"
                ref={codeInputRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-4 lg:py-3 rounded-xl bg-black/60 border border-white/[0.08] text-white text-sm font-black text-center tracking-[0.6em] placeholder-gray-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                required
                maxLength={6}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || code.length < 6}
            className="w-full mt-6 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] text-xs font-black h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_8px_30px_rgb(99,102,241,0.3)] lg:h-11 lg:rounded-xl lg:bg-none lg:bg-indigo-600 lg:hover:bg-indigo-700 lg:shadow-lg lg:shadow-indigo-600/10"
          >
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Verify secret key'}
          </Button>
          
          <div className="text-center mt-5 select-none">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
              }}
              className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors"
            >
              Change security target
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
