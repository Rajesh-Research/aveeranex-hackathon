'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowRight,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [certId, setCertId] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) {
      router.push(`/verify/${encodeURIComponent(certId.trim())}`);
    } else {
      router.push('/verify/AVX-2026-NOV-9841');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[480px] bg-gradient-to-b from-orange-500/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 md:pt-24 md:pb-18 text-center relative z-10">
        {/* Brand Eyebrow Tag in Aveeranex Logo Typography */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-950/90 border border-zinc-800 text-[11px] font-mono tracking-[0.28em] text-zinc-300 uppercase mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AVEERANEX ECOSYSTEM</span>
        </div>

        {/* RISEUP Display Emblem (Matching Image with Aveeranex Font Style) */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative inline-block">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-[0.16em] uppercase font-display select-none flex items-center justify-center">
              <span className="text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
                RISE
              </span>
              <span className="text-[#FF5722] bg-gradient-to-r from-[#FF5722] via-[#FF6D00] to-[#FFA000] bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(255,87,34,0.4)]">
                UP
              </span>
            </h1>

            {/* Upward Rising Arrow (Matching Image 2 Angle & Color) */}
            <div className="flex justify-center -mt-1 sm:-mt-2 mb-2">
              <svg
                className="w-8 h-8 sm:w-11 sm:h-11 text-[#FF5722] stroke-[#FF5722] drop-shadow-[0_0_12px_rgba(255,87,34,0.6)] transform hover:translate-x-1 hover:-translate-y-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </div>
          </div>

          {/* Caption 1: Compete. Achieve. Rise. (In Aveeranex Logo Font Style) */}
          <div className="mt-1 text-lg sm:text-2xl lg:text-3xl font-semibold tracking-[0.18em] text-white font-display">
            <span>Compete</span>
            <span className="text-cyan-400 mx-1">.</span>
            <span>Achieve</span>
            <span className="text-emerald-400 mx-1">.</span>
            <span>Rise</span>
            <span className="text-[#FF5722] mx-1">.</span>
          </div>

          {/* Caption 2: Powered by AVEERANEX (Aveeranex Logo Font Tracking) */}
          <p className="mt-2.5 text-xs sm:text-sm font-light tracking-[0.32em] text-zinc-400 uppercase font-sans">
            Powered by{' '}
            <span className="font-bold text-white tracking-[0.25em]">
              AVEERANEX
            </span>
          </p>
        </div>

        {/* Clean, Grammar-Checked Subtitle */}
        <p className="mt-8 text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Welcome to <span className="text-white font-semibold">AVEERANEX RISEUP</span> — the premier platform for hosting events, competitions, and hackathons for corporates, colleges, and universities.
        </p>

        {/* Primary Action Row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-aveeranex-teal via-cyan-500 to-emerald-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-cyan-950/40 transition-all"
          >
            <span>Register Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 active:scale-[0.98] text-zinc-200 font-semibold text-sm border border-zinc-800 transition-all"
          >
            <span>Sign In</span>
          </Link>

          <Link
            href="/verify/AVX-2026-NOV-9841"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-zinc-950 hover:border-emerald-500/50 text-emerald-400 font-semibold text-sm border border-zinc-800 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verify Certificate</span>
          </Link>
        </div>

        {/* Completed Edition Badge */}
        <div className="mt-14 max-w-2xl mx-auto p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                COMPLETED EDITION
              </div>
              <div className="text-base font-bold text-white">
                AVEERANEX INNOVATE - NOV&apos;26
              </div>
            </div>
          </div>
          <Link
            href="/verify/AVX-2026-NOV-9841"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-emerald-400 transition-colors shrink-0"
          >
            Verify Certificates &rarr;
          </Link>
        </div>
      </section>

      {/* INSTANT CERTIFICATE VERIFICATION BAR */}
      <section className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 text-center relative z-10">
        <form
          onSubmit={handleVerify}
          className="flex items-center gap-2 p-2 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-lg focus-within:border-aveeranex-cyan transition-colors"
        >
          <Search className="w-4 h-4 text-zinc-500 ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Verify Certificate ID (e.g. AVX-2026-NOV-9841)"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            className="flex-1 bg-transparent py-2.5 px-2 text-sm text-white placeholder-zinc-500 outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-aveeranex-teal hover:bg-cyan-600 text-white text-xs font-bold transition-colors"
          >
            Verify ID
          </button>
        </form>
      </section>
    </div>
  );
}
