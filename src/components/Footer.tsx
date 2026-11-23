'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Instagram,
  Youtube,
  Linkedin,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative h-12 w-52">
              <Image
                src="/assets/logo.png"
                alt="AVEERANEX"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-zinc-500 max-w-md text-sm leading-relaxed">
              AVEERANEX (OPC) PRIVATE LIMITED — Official portal for participants, corporates, colleges, and universities to host hackathons and competitions.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.linkedin.com/company/aveeranex"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-aveeranex-cyan hover:text-white transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/aveeranex"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-rose-500 hover:text-rose-400 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@aveeranex"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-red-500 hover:text-red-400 transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">
              Hackathon Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-aveeranex-cyan transition-colors">
                  Official Portal Home
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-aveeranex-cyan transition-colors">
                  Registration
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-aveeranex-cyan transition-colors">
                  Dashboard & Submissions
                </Link>
              </li>
              <li>
                <Link href="/verify/AVX-2026-NOV-9841" className="hover:text-aveeranex-cyan transition-colors">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-cyan-300 text-zinc-300 transition-colors">
                  Admin Console
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
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
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
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-aveeranex-teal" />
            <span>
              Official AVEERANEX Certificate Issuance & Security Verification Engine
            </span>
          </div>
          <p>
            &copy; {new Date().getFullYear()} AVEERANEX (OPC) PVT. LTD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
