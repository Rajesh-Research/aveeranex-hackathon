'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Search,
  X,
  Phone,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Modal for Quick Account Finder
  const [showFindModal, setShowFindModal] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [foundAccounts, setFoundAccounts] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setFormData((prev) => ({
        ...prev,
        email: emailParam,
      }));
    }
  }, [emailParam]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const isSuperAdminEmail = [
    'rajeshkumar.agile@gmail.com',
    'info@aveeranex.com',
    'kvrkkumarphd@gmail.com',
  ].includes(formData.email.trim().toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      setSuccess('Signed in successfully! Redirecting...');
      setTimeout(() => {
        if (data.user.role === 'admin' || data.user.role === 'super_admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setFoundAccounts([]);
    setHasSearched(true);

    try {
      const res = await fetch('/api/auth/find-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: lookupQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to search account.');
      setFoundAccounts(data.accounts || []);
      if (!data.accounts || data.accounts.length === 0) {
        setLookupError(data.message || 'No registered accounts found matching that query.');
      }
    } catch (err: any) {
      setLookupError(err.message || 'Search failed. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const selectFoundEmail = (email: string) => {
    setFormData((prev) => ({ ...prev, email }));
    setShowFindModal(false);
    setError(null);
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative bg-black">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aveeranex-teal/20 border border-aveeranex-teal/40 text-aveeranex-cyan text-xs font-semibold uppercase tracking-wider mb-3">
            <KeyRound className="w-3.5 h-3.5" />
            SECURE ACCESS
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Sign In to Portal
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Access your hackathon presentation dashboard &amp; verified certificates.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
              {isSuperAdminEmail && (
                <div className="mt-2 pt-2 border-t border-rose-500/20 text-xs text-rose-200 space-y-1.5">
                  <p className="font-semibold text-rose-100">Super Admin Account Detected</p>
                  <p className="text-slate-300">
                    If you are using initial platform credentials, the default password is{' '}
                    <code className="text-cyan-300 bg-black/60 px-1.5 py-0.5 rounded font-mono font-bold">
                      aveeranex@123
                    </code>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, password: 'aveeranex@123' }));
                        setError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-aveeranex-teal text-slate-950 font-bold hover:brightness-110 transition-all text-[11px]"
                    >
                      Autofill aveeranex@123
                    </button>
                    <Link
                      href="/forgot-password"
                      className="text-aveeranex-cyan underline hover:text-cyan-300 text-[11px]"
                    >
                      Reset Password
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                E-mail Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com (or info@aveeranex.com)"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-aveeranex-cyan hover:underline transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-aveeranex-teal to-aveeranex-cyan hover:brightness-110 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Helper for forgotten email - OUTSIDE form to prevent submit bubbling */}
          <div className="pt-4 text-center border-t border-zinc-800/80 mt-5 space-y-2">
            <button
              type="button"
              onClick={() => {
                setShowFindModal(true);
                setLookupQuery('');
                setLookupError(null);
                setFoundAccounts([]);
                setHasSearched(false);
              }}
              className="text-xs text-zinc-300 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer font-medium py-1 px-3 rounded-lg hover:bg-zinc-900"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Forgot your registered email? Find Account</span>
            </button>
            <div>
              <Link
                href="/forgot-password?tab=find-email"
                className="text-[11px] text-zinc-500 hover:text-zinc-400 underline"
              >
                Go to Dedicated Account Recovery Page →
              </Link>
            </div>
          </div>

          {/* Switch to Signup */}
          <div className="mt-4 text-center text-xs text-slate-400 border-t border-zinc-800 pt-4">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-aveeranex-cyan font-semibold hover:underline">
              Register as Participant or Host
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK ACCOUNT FINDER MODAL */}
      {showFindModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-aveeranex-cyan" />
                <h3 className="text-sm font-bold text-white">Find Your Registered Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFindModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter your mobile number, full name, or certificate ID to instantly retrieve your registered email address.
            </p>

            <form onSubmit={handleQuickLookup} className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or Rahul Sharma or AVX-..."
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:border-aveeranex-cyan outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-aveeranex-teal to-aveeranex-cyan text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {lookupLoading ? (
                  <span>Searching database...</span>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Registered Accounts</span>
                  </>
                )}
              </button>
            </form>

            {lookupError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {hasSearched && foundAccounts.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Matching Registered Accounts ({foundAccounts.length})
                </p>
                {foundAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{acc.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-cyan-300">
                          {acc.category || acc.role}
                        </span>
                      </div>
                      <div className="text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{acc.email}</span>
                      </div>
                      {acc.contact && (
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{acc.contact}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      <button
                        type="button"
                        onClick={() => selectFoundEmail(acc.email)}
                        className="px-3 py-1.5 rounded-lg bg-aveeranex-cyan text-slate-950 font-bold text-[11px] hover:brightness-110 transition-all"
                      >
                        Use this Email
                      </button>
                      {acc.directResetUrl && (
                        <Link
                          href={acc.directResetUrl}
                          className="text-[10px] text-amber-300 hover:underline"
                        >
                          Reset Password →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
          Loading sign in...
        </div>
      }
    >
      <SigninForm />
    </Suspense>
  );
}
