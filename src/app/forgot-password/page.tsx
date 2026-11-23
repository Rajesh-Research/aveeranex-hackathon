'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  ArrowRight,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Search,
  User,
  Phone,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface FoundAccount {
  id: string;
  name: string;
  email: string;
  contact?: string;
  role: string;
  category: string;
  certificateId?: string;
  directResetUrl?: string | null;
}

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'find-email' ? 'find-email' : 'reset-password';

  const [activeTab, setActiveTab] = useState<'reset-password' | 'find-email'>(initialTab);

  // Tab 1: Reset Password by Email
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugLink, setDebugLink] = useState<string | null>(null);

  // Tab 2: Find My Account / Email Lookup
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [foundAccounts, setFoundAccounts] = useState<FoundAccount[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab') === 'find-email') {
      setActiveTab('find-email');
    }
  }, [searchParams]);

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDebugLink(null);
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

      setSuccess(data.message || 'Password reset link generated successfully.');
      if (data.debugResetLink) {
        setDebugLink(data.debugResetLink);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setFoundAccounts([]);
    setLookupLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/auth/find-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: lookupQuery }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to search for account.');
      }

      setFoundAccounts(data.accounts || []);
      if (!data.accounts || data.accounts.length === 0) {
        setLookupError(data.message || 'No registered account found matching that detail.');
      }
    } catch (err: any) {
      setLookupError(err.message || 'An error occurred during account search.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative bg-black">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aveeranex-teal/20 border border-aveeranex-teal/40 text-aveeranex-cyan text-xs font-semibold uppercase tracking-wider mb-3">
            <KeyRound className="w-3.5 h-3.5" />
            ACCOUNT ACCESS & RECOVERY
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Account Recovery Portal
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Reset your password or retrieve your registered email address with 1 click.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-xl mb-6 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('reset-password');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'reset-password'
                ? 'bg-gradient-to-r from-aveeranex-teal to-aveeranex-cyan text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Reset Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('find-email');
              setLookupError(null);
            }}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'find-email'
                ? 'bg-gradient-to-r from-aveeranex-teal to-aveeranex-cyan text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Forgot Email? Find Account</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* ========================================================================= */}
          {/* TAB 1: RESET PASSWORD BY EMAIL                                            */}
          {/* ========================================================================= */}
          {activeTab === 'reset-password' && (
            <div className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('find-email')}
                    className="text-xs text-aveeranex-cyan underline block font-semibold hover:text-cyan-300 ml-7"
                  >
                    Click here to find your registered email using phone or name →
                  </button>
                </div>
              )}

              {success && (
                <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold">{success}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click the direct button below to immediately set a new password for your account.
                  </p>
                  {debugLink && (
                    <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-700 space-y-3">
                      <div className="font-mono text-xs text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Direct One-Click Password Reset:
                      </div>
                      <Link
                        href={debugLink}
                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-sm shadow-lg text-center"
                      >
                        <span>Set New Password Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {!success && (
                <form onSubmit={handlePasswordResetSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Registered E-mail Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com (or info@aveeranex.com)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[11px] text-zinc-500">
                        Admin emails: info@aveeranex.com or kvrkkumarphd@gmail.com
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('find-email')}
                        className="text-[11px] text-aveeranex-cyan hover:underline"
                      >
                        Don&apos;t remember email?
                      </button>
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
                        <span>Verifying Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Password Reset Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: FORGOT EMAIL / FIND MY ACCOUNT                                     */}
          {/* ========================================================================= */}
          {activeTab === 'find-email' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                Enter your <strong>Phone Number</strong>, <strong>Full Name</strong>, or{' '}
                <strong>Certificate ID</strong> to look up your registered account email and reset credentials.
              </div>

              {lookupError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{lookupError}</span>
                </div>
              )}

              <form onSubmit={handleAccountLookupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Search by Phone, Name, or Certificate ID
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210 or Dr. Rajesh Kumar or AVX-2026..."
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110 active:scale-[0.99] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {lookupLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching Database...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Find My Registered Email</span>
                    </>
                  )}
                </button>
              </form>

              {/* Found Accounts Result List */}
              {hasSearched && foundAccounts.length > 0 && (
                <div className="mt-6 space-y-4 pt-4 border-t border-zinc-800">
                  <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Matching Registered Accounts ({foundAccounts.length})
                  </div>

                  <div className="space-y-3">
                    {foundAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-700 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white text-sm flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-cyan-400" />
                            {acc.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono uppercase">
                            {acc.category} ({acc.role})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="font-mono text-cyan-300 select-all font-bold">
                              {acc.email}
                            </span>
                          </div>
                          {acc.contact && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="font-mono text-zinc-300">{acc.contact}</span>
                            </div>
                          )}
                        </div>

                        {acc.certificateId && (
                          <div className="text-[11px] text-zinc-400 font-mono">
                            Certificate ID: <span className="text-zinc-200">{acc.certificateId}</span>
                          </div>
                        )}

                        <div className="pt-2 flex flex-wrap gap-2">
                          {acc.directResetUrl && (
                            <Link
                              href={acc.directResetUrl}
                              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-semibold text-xs shadow"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Reset Password Now</span>
                            </Link>
                          )}
                          <Link
                            href={`/signin?email=${encodeURIComponent(acc.email)}`}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-600"
                          >
                            <span>Go to Sign In</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Back Link */}
          <div className="mt-6 text-center text-xs text-slate-400 border-t border-zinc-800 pt-5 flex items-center justify-between">
            <Link
              href="/signin"
              className="text-slate-300 hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>

            <Link
              href="/signup"
              className="text-aveeranex-cyan hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Register New Account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
