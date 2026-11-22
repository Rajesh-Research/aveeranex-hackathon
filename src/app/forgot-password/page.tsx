'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugLink, setDebugLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset.');
      }

      setSuccess(data.message || 'Password reset link sent to your email.');
      if (data.debugResetLink) {
        setDebugLink(data.debugResetLink);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aveeranex-teal/20 border border-aveeranex-teal/40 text-aveeranex-cyan text-xs font-semibold uppercase tracking-wider mb-3">
            <KeyRound className="w-3.5 h-3.5" />
            PASSWORD RECOVERY
          </div>
          <h1 className="text-3xl font-light tracking-[0.18em] text-white uppercase">
            Reset Password
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Enter your registered email address to receive a secure password reset link.
          </p>
        </div>

        <div className="bg-aveeranex-card/80 border border-aveeranex-border/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold">{success}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Please check your inbox and click the reset link to create a new password. The link expires in 1 hour.
              </p>
              {debugLink && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-xs text-slate-300 space-y-1">
                  <div className="font-mono text-[11px] text-cyan-400 font-bold uppercase">Direct Reset Link:</div>
                  <Link href={debugLink} className="text-aveeranex-cyan underline break-all">
                    Click here to reset your password now
                  </Link>
                </div>
              )}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Registered E-mail Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-aveeranex-teal to-aveeranex-cyan hover:brightness-110 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-5">
            <Link
              href="/signin"
              className="text-slate-300 hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
