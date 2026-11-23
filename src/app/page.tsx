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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-gradient-to-b from-cyan-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-20 text-center relative z-10">
        {/* Stylish Display Headline - Logo Model Font Style */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-[0.22em] text-white leading-[1.25] uppercase">
          AVEERANEX{' '}
          <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400">
            HACKATHON
          </span>
          <br />
          <span className="font-extralight tracking-[0.3em] text-zinc-400 text-2xl sm:text-4xl lg:text-4xl">
            PLATFORM
          </span>
        </h1>

        {/* Clean Concise Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Welcome to the official portal for{' '}
          <span className="text-white font-semibold">
            participants / corporates / colleges / universities
          </span>{' '}
          to host their hackathons and competitions.
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
