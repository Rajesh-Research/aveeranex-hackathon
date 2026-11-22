'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Award,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Users,
  School,
  MapPin,
  Lightbulb,
  Layers,
  Calendar,
  ExternalLink,
  RefreshCw,
  Check,
  Send,
} from 'lucide-react';
import { PublicParticipantInfo } from '@/lib/types';
import CertificateCanvas from '@/components/CertificateCanvas';
import SocialShareCard from '@/components/SocialShareCard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicParticipantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/signin');
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      console.error(e);
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleRequestCertificate = async () => {
    setRequesting(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/certificate/request', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setUser(data.user);
      setActionMessage('Certificate generation request submitted successfully for Super Admin Approval!');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setActionMessage(err.message || 'Error requesting certificate');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-aveeranex-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">Loading your hackathon profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-aveeranex-card via-slate-900 to-aveeranex-card border border-aveeranex-border/80 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aveeranex-teal/20 border border-aveeranex-teal/40 text-aveeranex-cyan text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            PARTICIPANT DASHBOARD
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user.name}!
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Team <span className="text-white font-semibold">{user.teamName}</span> • {user.college}
          </p>
        </div>

        {/* Certificate Status Badge */}
        <div className="flex flex-col items-start md:items-end gap-2 relative z-10">
          <div className="text-xs text-slate-400 font-mono">CERTIFICATE STATUS</div>
          {user.certificateStatus === 'APPROVED' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Approved & Issued</span>
            </div>
          )}

          {user.certificateStatus === 'PENDING_APPROVAL' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold text-sm animate-pulse">
              <Clock className="w-4 h-4" />
              <span>Pending Super Admin Approval</span>
            </div>
          )}

          {user.certificateStatus === 'NOT_REQUESTED' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Ready to Generate</span>
            </div>
          )}

          {user.certificateStatus === 'REJECTED' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Verification Unsuccessful</span>
            </div>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800 text-cyan-300 text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Status / Certificate Generation Flow */}
      <div className="space-y-8">
        {/* CASE 1: NOT_REQUESTED - Big Generate Certificate Card */}
        {user.certificateStatus === 'NOT_REQUESTED' && (
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-aveeranex-card to-slate-900 border-2 border-dashed border-aveeranex-cyan/40 text-center space-y-6 max-w-3xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-aveeranex-teal to-cyan-400 flex items-center justify-center mx-auto text-white shadow-lg shadow-cyan-950">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Generate Your Certificate of Participation
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
                Ready to obtain your official certificate for <span className="text-aveeranex-cyan font-semibold">{user.presentedOn}</span>? Clicking below will submit your presentation details directly to the Super Admin review portal for formal verification.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRequestCertificate}
                disabled={requesting}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-aveeranex-teal via-cyan-500 to-emerald-500 hover:brightness-110 active:scale-[0.98] text-white font-bold text-base shadow-xl shadow-cyan-900/40 transition-all disabled:opacity-50"
              >
                {requesting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting to Super Admin...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    <span>Generate Certificate</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Director Authorized
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-cyan-400" />
                Instant Super Admin Notification
              </span>
            </div>
          </div>
        )}

        {/* CASE 2: PENDING_APPROVAL - Review Card */}
        {user.certificateStatus === 'PENDING_APPROVAL' && (
          <div className="p-8 sm:p-10 rounded-3xl bg-amber-950/20 border border-amber-500/40 text-center space-y-6 max-w-3xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold uppercase">
                Under Review
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Super Admin Verification in Progress
              </h2>
              <p className="text-slate-300 text-sm max-w-lg mx-auto">
                Your certificate request for presentation topic <span className="text-white font-medium">&quot;{user.topicTitle}&quot;</span> is currently with the Super Admin for authorization. Once approved, your certificate will appear right here ready for download and sharing.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-4">
              <button
                onClick={fetchUserData}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check Approval Status</span>
              </button>

              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
              >
                <span>Admin Login Portal &rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* CASE 3: APPROVED - Live Certificate Viewer & Social Tagging Card */}
        {user.certificateStatus === 'APPROVED' && user.certificateId && (
          <div className="space-y-10">
            {/* Live Interactive Certificate Canvas */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Award className="w-6 h-6 text-aveeranex-cyan" />
                    <span>Your Official Verified Certificate</span>
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Verified and signed by Dr. Rajesh Kumar, Director, AVEERANEX (OPC) PVT. LTD.
                  </p>
                </div>

                <Link
                  href={`/verify/${user.certificateId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/80"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Public Verification Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <CertificateCanvas
                participantName={user.name}
                teamName={user.teamName}
                certificateId={user.certificateId}
                topicTitle={user.topicTitle}
                college={user.college}
                onDownloadSuccess={() => {
                  confetti({
                    particleCount: 70,
                    spread: 80,
                    origin: { y: 0.6 },
                  });
                }}
              />
            </div>

            {/* Social Share & Tagging Section */}
            <SocialShareCard
              participantName={user.name}
              teamName={user.teamName}
              topicTitle={user.topicTitle}
              certificateId={user.certificateId}
            />
          </div>
        )}

        {/* CASE 4: REJECTED */}
        {user.certificateStatus === 'REJECTED' && (
          <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-500/40 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Certificate Request Not Approved</h2>
            <p className="text-slate-300 text-sm">
              Reason provided: {user.rejectionReason || 'Details did not match hackathon submission criteria.'}
            </p>
            <button
              onClick={handleRequestCertificate}
              className="px-6 py-2.5 rounded-xl bg-aveeranex-teal text-white font-semibold text-sm"
            >
              Re-submit Request
            </button>
          </div>
        )}

        {/* Participant Registration Details Card */}
        <div className="bg-aveeranex-card/50 border border-aveeranex-border/60 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-aveeranex-border/40">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-aveeranex-cyan" />
              <span>Registered Participant & Presentation Record</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              ID: {user.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">Participant Name</span>
              <div className="font-semibold text-white">{user.name}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">Team Name</span>
              <div className="font-semibold text-white">{user.teamName}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">E-mail ID</span>
              <div className="font-mono text-slate-300">{user.email}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">Contact Number</span>
              <div className="font-mono text-slate-300">{user.contact}</div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <span className="text-xs text-slate-400 uppercase font-mono">College / University</span>
              <div className="font-medium text-white">{user.college}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">Location & State</span>
              <div className="text-slate-300">
                {user.location}, {user.state} - {user.pincode} ({user.country})
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <span className="text-xs text-slate-400 uppercase font-mono">Presentation Topic Title</span>
              <div className="font-medium text-aveeranex-cyan">{user.topicTitle}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">Topic Domain</span>
              <div className="text-slate-300">{user.topicDomain}</div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <span className="text-xs text-slate-400 uppercase font-mono">Presented On</span>
              <div className="font-medium text-emerald-400">{user.presentedOn}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
