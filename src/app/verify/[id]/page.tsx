'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  School,
  User,
  Users,
  Lightbulb,
  ExternalLink,
  Search,
  Trophy,
  Medal,
} from 'lucide-react';
import { CertificateVerificationData } from '@/lib/types';

export default function VerifyPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<CertificateVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lookupId, setLookupId] = useState(params.id || '');

  const verifyCertificate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(id)}`);
      if (!res.ok) {
        throw new Error('This certificate could not be verified in the Aveeranex registry.');
      }
      const certData = await res.json();
      setData(certData);
    } catch (err: any) {
      setError(err.message || 'Verification lookup failed.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      verifyCertificate(params.id);
    }
  }, [params.id]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupId.trim()) {
      verifyCertificate(lookupId.trim());
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Official Credential Verification Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verify AVEERANEX Certificate
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Authenticating certificates issued across the AVEERANEX HACKATHON PLATFORM.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleManualSearch} className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g. AVX-2026-NOV-9841, AVX-MJ-2026-..., AVX-WIN1-...)"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm outline-none focus:border-aveeranex-cyan"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-aveeranex-teal hover:bg-cyan-600 text-white text-sm font-semibold transition-all shadow-md"
          >
            Verify
          </button>
        </form>

        {loading ? (
          <div className="p-12 text-center bg-aveeranex-card/50 border border-aveeranex-border/60 rounded-3xl">
            <div className="w-10 h-10 border-4 border-aveeranex-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">Verifying cryptographic signature on registry...</p>
          </div>
        ) : error || !data ? (
          <div className="p-8 sm:p-12 text-center bg-rose-950/20 border border-rose-500/40 rounded-3xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Verification Unsuccessful</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              No approved certificate was found matching identifier <span className="font-mono text-rose-300 font-bold">&quot;{lookupId}&quot;</span>. Please check the ID or contact the Super Admin.
            </p>
          </div>
        ) : (
          /* Verified Certificate Record */
          <div className="bg-aveeranex-card/80 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Top Verified Ribbon */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-aveeranex-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    OFFICIALLY VERIFIED & ACTIVE
                  </span>
                  <h3 className="text-lg font-extrabold text-white">
                    {data.category === 'MENTOR_JURY'
                      ? 'Certificate of Appreciation & Recognition'
                      : data.category === 'TECHNICAL_COORDINATOR'
                      ? 'Certificate of Technical Coordination'
                      : data.category === 'EVENT_COORDINATOR'
                      ? 'Certificate of Event Coordination'
                      : data.awardLevel === 'WINNER_1ST'
                      ? '1st Prize - Grand Winner Certificate'
                      : data.awardLevel === 'WINNER_2ND'
                      ? '2nd Prize - 1st Runner-Up Certificate'
                      : data.awardLevel === 'WINNER_3RD'
                      ? '3rd Prize - 2nd Runner-Up Certificate'
                      : data.awardLevel === 'RUNNER_4TH'
                      ? '4th Level Runner-Up Certificate'
                      : data.awardLevel === 'RUNNER_5TH'
                      ? '5th Level Runner-Up Certificate'
                      : 'Certificate of Participation'}
                  </h3>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 font-mono block">CERTIFICATE ID</span>
                <span className="text-sm font-mono font-bold text-cyan-300">{data.certificateId}</span>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="py-8 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs uppercase font-mono text-slate-400">Awarded & Issued To</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {data.participantName}
                </h2>
                {data.teamName && (
                  <div className="text-base font-semibold text-aveeranex-cyan">
                    Team: {data.teamName}
                  </div>
                )}
                {data.category === 'MENTOR_JURY' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold mt-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Distinguished Mentor / Jury Member</span>
                  </div>
                )}
                {data.awardLevel && data.awardLevel !== 'PARTICIPATION' && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mt-1">
                    <Medal className="w-3.5 h-3.5" />
                    <span>
                      {data.awardLevel === 'WINNER_1ST' && '🥇 Grand Winner (1st Level)'}
                      {data.awardLevel === 'WINNER_2ND' && '🥈 1st Runner-Up (2nd Level)'}
                      {data.awardLevel === 'WINNER_3RD' && '🥉 2nd Runner-Up (3rd Level)'}
                      {data.awardLevel === 'RUNNER_4TH' && '🏅 4th Level Runner-Up'}
                      {data.awardLevel === 'RUNNER_5TH' && '🎖️ 5th Level Runner-Up'}
                    </span>
                  </div>
                )}
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-mono uppercase flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-aveeranex-cyan" />
                    Hackathon Event
                  </span>
                  <div className="text-white font-semibold text-sm">{data.presentedOn}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-mono uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Date of Issue
                  </span>
                  <div className="text-white font-semibold text-sm">{data.issueDate}</div>
                </div>

                {data.topicTitle && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 sm:col-span-2">
                    <span className="text-slate-400 font-mono uppercase flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      Presented Project Topic
                    </span>
                    <div className="text-white font-semibold text-sm">{data.topicTitle}</div>
                    {data.topicDomain && (
                      <div className="text-slate-400 text-[11px]">Domain: {data.topicDomain}</div>
                    )}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 sm:col-span-2">
                  <span className="text-slate-400 font-mono uppercase flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-cyan-400" />
                    Institution / Organization
                  </span>
                  <div className="text-white font-semibold text-sm">
                    {data.college || data.organization || 'Aveeranex Partner Institution'}
                  </div>
                  {data.designation && (
                    <div className="text-slate-400 text-[11px]">Role: {data.designation}</div>
                  )}
                  {data.specialization && (
                    <div className="text-amber-400 text-[11px]">Specialization: {data.specialization}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Sign-off */}
            <div className="pt-6 border-t border-aveeranex-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-aveeranex-border flex-shrink-0">
                  <Image
                    src="/assets/seal.png"
                    alt="Aveeranex Seal"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <div className="text-slate-200 font-bold">{data.organizationName || 'AVEERANEX (OPC) PRIVATE LIMITED'}</div>
                  <div className="text-slate-400 text-[11px]">Authorized Director: {data.directorName}</div>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-500">
                Security Hash: <span className="text-slate-400">{data.verificationHash}</span>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="text-xs text-aveeranex-cyan hover:underline inline-flex items-center gap-1"
          >
            &larr; Back to Aveeranex Hackathon Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
