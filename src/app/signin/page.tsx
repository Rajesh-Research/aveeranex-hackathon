'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
            Access your hackathon presentation dashboard & verified certificates.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
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
                  Forgot password or email?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Helper for forgotten email */}
            <div className="pt-2 text-center">
              <Link
                href="/forgot-password?tab=find-email"
                className="text-xs text-zinc-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>Forgot your registered email? Find Account</span>
              </Link>
            </div>
          </form>

          {/* Switch to Signup */}
          <div className="mt-6 text-center text-xs text-slate-400 border-t border-zinc-800 pt-4">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-aveeranex-cyan font-semibold hover:underline">
              Register as Participant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
