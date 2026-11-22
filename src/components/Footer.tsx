import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  GraduationCap,
  ShieldCheck,
  Heart,
  ExternalLink,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-aveeranex-border/40 bg-aveeranex-dark/95 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative h-12 w-52">
              <Image
                src="/assets/logo.png"
                alt="AVEERANEX"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed">
              AVEERANEX (OPC) PRIVATE LIMITED — Empowering the next generation of engineers, researchers, and innovators through national hackathons, advanced technology incubation, and industry-aligned experiential learning.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.linkedin.com/company/aveeranex"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-aveeranex-cyan hover:text-white transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/aveeranex"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500 hover:text-rose-400 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@aveeranex"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500 hover:text-red-400 transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://www.aveeranex.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                title="AVEERANEX Website"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://www.aveeranex.com/products/learn"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-400 hover:text-emerald-400 transition-colors"
                title="AVEERANEX LEARN"
              >
                <GraduationCap className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">
              Hackathon Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/signup" className="hover:text-aveeranex-cyan transition-colors">
                  Participant Registration
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-aveeranex-cyan transition-colors">
                  Participant Login
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-aveeranex-cyan transition-colors">
                  Certificate Dashboard
                </Link>
              </li>
              <li>
                <Link href="/verify/AVX-2026-NOV-9841" className="hover:text-aveeranex-cyan transition-colors">
                  Instant Certificate Verification
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-cyan-300 text-slate-300 transition-colors">
                  Super Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">
              Aveeranex Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.aveeranex.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-aveeranex-cyan flex items-center gap-1 transition-colors"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.aveeranex.com/products/learn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>AVEERANEX LEARN</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/aveeranex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-aveeranex-cyan flex items-center gap-1 transition-colors"
                >
                  <span>LinkedIn Network</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/aveeranex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <span>Instagram Community</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-aveeranex-teal" />
            <span>
              Official AVEERANEX Certificate Issuance & Security Verification Engine
            </span>
          </div>
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} AVEERANEX (OPC) PVT. LTD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
