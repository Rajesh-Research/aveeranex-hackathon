'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Award,
} from 'lucide-react';
import { PublicParticipantInfo } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<PublicParticipantInfo | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/signin');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/90 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-11 w-48 md:w-56 transition-transform duration-200 group-hover:scale-[1.02]">
              <Image
                src="/assets/logo.png"
                alt="AVEERANEX"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-aveeranex-cyan font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Home
            </Link>

            {currentUser && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  pathname === '/dashboard' ? 'text-aveeranex-cyan font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4 text-aveeranex-teal" />
                <span>My Portal & Certificate</span>
              </Link>
            )}

            <Link
              href="/verify/AVX-2026-NOV-9841"
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                pathname.startsWith('/verify') ? 'text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify</span>
            </Link>

            {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
              <Link
                href="/admin"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Admin Console
                </span>
              </Link>
            )}

            <a
              href="https://www.aveeranex.com/products/learn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-400 hover:text-aveeranex-cyan flex items-center gap-1 transition-colors"
            >
              <span>AVEERANEX LEARN</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {currentUser ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-aveeranex-cyan/50 text-zinc-200 text-xs transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-aveeranex-teal to-cyan-400 flex items-center justify-center text-white font-bold text-[11px]">
                        {currentUser.name.charAt(0)}
                      </div>
                      <span className="max-w-[120px] truncate font-medium">
                        {currentUser.name}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <Link
                      href="/signin"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-aveeranex-teal to-aveeranex-cyan hover:brightness-110 shadow-md shadow-cyan-950/30 transition-all active:scale-[0.98]"
                    >
                      Register Now
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-900 bg-black/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-3 text-zinc-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-zinc-900"
          >
            Home
          </Link>
          {currentUser && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-aveeranex-cyan hover:bg-zinc-900"
            >
              My Portal & Certificate
            </Link>
          )}
          <Link
            href="/verify/AVX-2026-NOV-9841"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-zinc-900"
          >
            Verify Certificate
          </Link>
          {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-cyan-300 hover:bg-zinc-900"
            >
              Admin Console
            </Link>
          )}
          <a
            href="https://www.aveeranex.com/products/learn"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-400 hover:text-white"
          >
            Explore AVEERANEX LEARN
          </a>

          <div className="pt-4 border-t border-zinc-900 flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({currentUser.name})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-gradient-to-r from-aveeranex-teal to-aveeranex-cyan text-white text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
