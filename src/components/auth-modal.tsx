'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User as UserIcon, X, ArrowRight, RefreshCw, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithPassword,
    signInWithOtp,
    signUp,
    isMockUser,
    toggleMockAuthMode
  } = useAuth();
  const router = useRouter();

  const performRedirect = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        router.push(redirect);
      }
    }
  };

  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');

  useEffect(() => {
    if (isMockUser) {
      setAuthTab('signin');
    }
  }, [isMockUser]);
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Statuses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setName('');
    setEmail('');
    setPassword('');
    closeAuthModal();
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email) {
      setError('Please enter your email.');
      setLoading(false);
      return;
    }

    if (authTab === 'signup' && !name) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    if (activeTab === 'password' && !password) {
      setError('Please enter your password.');
      setLoading(false);
      return;
    }

    try {
      const enrichRateLimitError = (msg: string) => {
        const lower = msg.toLowerCase();
        if (lower.includes('rate limit') || lower.includes('limit exceeded') || lower.includes('too many requests')) {
          return `${msg} Tip: To fix this, turn OFF "Confirm email" under Authentication -> Providers -> Email in your Supabase Dashboard, or configure custom SMTP settings.`;
        }
        return msg;
      };

      if (authTab === 'signin') {
        if (activeTab === 'password') {
          const res = await signInWithPassword(email, password);
          if (res.success) {
            setSuccess('Welcome back! Successfully logged in.');
            setTimeout(() => {
              handleClose();
              performRedirect();
            }, 1200);
          } else {
            setError(enrichRateLimitError(res.error || 'Failed to sign in. Check details.'));
          }
        } else {
          const res = await signInWithOtp(email);
          if (res.success) {
            setSuccess(isMockUser ? 'Logged in (Mock Mode).' : 'Magic Link sent! Please verify your inbox.');
            if (isMockUser) {
              setTimeout(() => {
                handleClose();
                performRedirect();
              }, 1200);
            }
          } else {
            setError(enrichRateLimitError(res.error || 'Failed to send OTP.'));
          }
        }
      } else {
        // Sign Up Flow
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const res = await signUp(email, password, name);
        if (res.success) {
          setSuccess('Account created successfully! Logging in...');
          setTimeout(() => {
            handleClose();
            performRedirect();
          }, 1200);
        } else {
          setError(enrichRateLimitError(res.error || 'Registration failed.'));
        }
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred.';
      const lower = msg.toLowerCase();
      if (lower.includes('rate limit') || lower.includes('limit exceeded') || lower.includes('too many requests')) {
        setError(`${msg} Tip: To fix this, turn OFF "Confirm email" under Authentication -> Providers -> Email in your Supabase Dashboard, or configure custom SMTP settings.`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#FFFDF8]/95 backdrop-blur-md border border-emerald-100/50 rounded-[32px] p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border-0 cursor-pointer bg-transparent"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <span className="text-3xl inline-block mb-2 animate-bounce">🥘</span>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {authTab === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {authTab === 'signin' 
              ? 'Dine in or take away, flavor is always one click away.' 
              : 'Join Flavor Haven and unlock 100 bonus reward points!'}
          </p>
        </div>

        {/* Mode Toggle Selector: Sign In / Sign Up */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5 text-xs font-bold text-slate-500">
          <button
            type="button"
            onClick={() => {
              setAuthTab('signin');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer border-0 ${
              authTab === 'signin' ? 'bg-white text-slate-850 shadow-sm font-extrabold' : 'hover:text-slate-800 bg-transparent'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('signup');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer border-0 ${
              authTab === 'signup' ? 'bg-white text-slate-850 shadow-sm font-extrabold' : 'hover:text-slate-800 bg-transparent'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Subtabs for Sign In (Password / OTP) */}
        {authTab === 'signin' && (
          <div className="flex bg-slate-50/60 p-1 border border-slate-100 rounded-xl mb-5 text-[10px] font-bold text-slate-400">
            <button
              type="button"
              onClick={() => {
                setActiveTab('password');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'password' ? 'bg-white text-slate-700 shadow-sm font-bold' : 'hover:text-slate-600 bg-transparent'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('otp');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'otp' ? 'bg-white text-slate-700 shadow-sm font-bold' : 'hover:text-slate-600 bg-transparent'
              }`}
            >
              Magic Link (OTP)
            </button>
          </div>
        )}

        {/* Alert blocks */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2 text-emerald-700 text-xs animate-pulse">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-brand-medium" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        <form onSubmit={handleAuthAction} className="space-y-4">
          {/* Sign Up Name Field */}
          {authTab === 'signup' && (
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-medium/20 focus:border-brand-medium text-xs bg-slate-50/50"
                  required={authTab === 'signup'}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-medium/20 focus:border-brand-medium text-xs bg-slate-50/50"
                required
              />
            </div>
            {isMockUser && authTab === 'signin' && (
              <p className="text-[9px] text-slate-400 mt-1 ml-0.5">
                Tip: Enter <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-705 font-bold">admin@flavorhaven.com</code> for admin roles.
              </p>
            )}
          </div>

          {/* Password field */}
          {(authTab === 'signup' || (authTab === 'signin' && activeTab === 'password')) && (
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-medium/20 focus:border-brand-medium text-xs bg-slate-50/50"
                  required={authTab === 'signup' || activeTab === 'password'}
                />
              </div>
              {authTab === 'signup' && (
                <p className="text-[9px] text-slate-400 mt-1 ml-0.5">At least 6 characters.</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-medium hover:bg-emerald-700 disabled:bg-emerald-600 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all select-none cursor-pointer border-0 active:scale-[0.98] mt-6"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {authTab === 'signin'
                    ? activeTab === 'password'
                      ? 'Sign In'
                      : 'Send Magic Link'
                    : 'Create Account'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="text-center mt-5 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
          {authTab === 'signin' ? (
            <p>
              New to Flavor Haven?{' '}
              <button
                onClick={() => {
                  setAuthTab('signup');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-brand-medium hover:underline font-bold border-0 bg-transparent cursor-pointer p-0"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setAuthTab('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-brand-medium hover:underline font-bold border-0 bg-transparent cursor-pointer p-0"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
