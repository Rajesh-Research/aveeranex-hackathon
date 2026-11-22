import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Award,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  Code,
  GraduationCap,
  ExternalLink,
  Cpu,
  Layers,
  FileCheck,
  Share2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-cyan-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aveeranex-card border border-aveeranex-cyan/30 text-aveeranex-cyan text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg shadow-cyan-950/40">
            <Sparkles className="w-4 h-4 text-aveeranex-cyan animate-spin" style={{ animationDuration: '6s' }} />
            <span>Official Finale Round Issuance & Verification</span>
          </div>

          {/* Heading with slim geometric font matching logo */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-[0.22em] text-white leading-[1.25] uppercase">
            AVEERANEX <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-aveeranex-teal via-cyan-400 to-emerald-400">INNOVATE</span>
            <br />
            <span className="text-2xl sm:text-4xl lg:text-4xl font-extralight tracking-[0.3em] text-slate-300">ONLINE HACKATHON</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Welcome to the official portal for participants of the <span className="text-white font-medium">Nov&apos;26 Hackathon Edition</span>. Complete your project registration, request super admin verification, and generate your verified certificate of participation.
          </p>

          {/* Primary CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-aveeranex-teal via-cyan-500 to-emerald-500 text-white font-bold text-base shadow-xl shadow-cyan-900/40 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <span>Register for Certificate</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/signin"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 hover:border-aveeranex-cyan/50 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Participant Login</span>
            </Link>

            <Link
              href="/verify/AVX-2026-NOV-9841"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-950/60 hover:bg-slate-900 text-emerald-400 font-semibold text-base border border-emerald-500/30 hover:border-emerald-500/60 transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Verify Certificate</span>
            </Link>
          </div>

          {/* Event Metadata Banner */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">EDITION</div>
              <div className="text-sm font-bold text-white mt-1">Nov&apos;26 Finale</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">STATUS</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Certificates Active
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">VERIFICATION</div>
              <div className="text-sm font-bold text-aveeranex-cyan mt-1">Admin Approved</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">DIRECTOR</div>
              <div className="text-sm font-bold text-white mt-1">Dr Rajesh Kumar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-aveeranex-border/40">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How the Certificate Issuance Works
          </h2>
          <p className="text-slate-400 text-base mt-2">
            A seamless four-step pipeline with multi-tier cryptographic verification and super admin review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-aveeranex-card/50 border border-aveeranex-border/50 relative group hover:border-aveeranex-cyan/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-aveeranex-teal/20 text-aveeranex-cyan flex items-center justify-center font-bold text-xl mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Participant Registration</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sign up with your Name, Team Name, College, Topic Title, Domain, and Presentation details.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-aveeranex-card/50 border border-aveeranex-border/50 relative group hover:border-aveeranex-cyan/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Request Generation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Click &quot;Generate Certificate&quot; on your dashboard to submit your presentation details for review.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-aveeranex-card/50 border border-aveeranex-border/50 relative group hover:border-aveeranex-cyan/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Super Admin Review</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Super Admin verifies your presentation attendance and project submission criteria before approval.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-aveeranex-card/50 border border-aveeranex-border/50 relative group hover:border-aveeranex-cyan/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl mb-4">
              4
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Download & Share</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Download your official 300 DPI PDF certificate and share directly to LinkedIn, Instagram, and YouTube.
            </p>
          </div>
        </div>
      </section>

      {/* Community Links Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-aveeranex-border/40">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Connect with the AVEERANEX Community
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Follow our official handles, join upcoming innovation challenges, and register for AVEERANEX LEARN courses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="https://www.linkedin.com/company/aveeranex"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-aveeranex-card/50 border border-aveeranex-border/50 hover:border-[#0a66c2]/50 hover:bg-[#0a66c2]/10 transition-all group"
          >
            <div className="text-slate-400 group-hover:text-[#0a66c2] font-semibold text-sm mb-1">
              LinkedIn
            </div>
            <div className="text-white font-bold text-base">@aveeranex</div>
            <p className="text-slate-400 text-xs mt-2">
              Tag our corporate page on your feed to celebrate your achievement with recruiters!
            </p>
          </a>

          <a
            href="https://www.instagram.com/aveeranex"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-aveeranex-card/50 border border-aveeranex-border/50 hover:border-[#E4405F]/50 hover:bg-[#E4405F]/10 transition-all group"
          >
            <div className="text-slate-400 group-hover:text-[#E4405F] font-semibold text-sm mb-1">
              Instagram
            </div>
            <div className="text-white font-bold text-base">@aveeranex</div>
            <p className="text-slate-400 text-xs mt-2">
              Share your certificate in your stories and tag @aveeranex to get re-posted!
            </p>
          </a>

          <a
            href="https://www.youtube.com/@aveeranex"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-aveeranex-card/50 border border-aveeranex-border/50 hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10 transition-all group"
          >
            <div className="text-slate-400 group-hover:text-[#FF0000] font-semibold text-sm mb-1">
              YouTube
            </div>
            <div className="text-white font-bold text-base">@aveeranex</div>
            <p className="text-slate-400 text-xs mt-2">
              Watch hackathon project highlights, keynotes, and technical webinars.
            </p>
          </a>

          <a
            href="https://www.aveeranex.com/products/learn"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-aveeranex-card/50 border border-aveeranex-border/50 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all group"
          >
            <div className="text-slate-400 group-hover:text-emerald-400 font-semibold text-sm mb-1">
              AVEERANEX LEARN
            </div>
            <div className="text-white font-bold text-base">Explore Programs</div>
            <p className="text-slate-400 text-xs mt-2">
              Advance your career with industry-oriented research and technology bootcamps.
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}
