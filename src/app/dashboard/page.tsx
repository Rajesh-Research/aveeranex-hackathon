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
  ExternalLink,
  RefreshCw,
  Check,
  Send,
  Upload,
  FileText,
  Briefcase,
  Trophy,
  Github,
} from 'lucide-react';
import { PublicParticipantInfo, UserCategory, AwardLevel } from '@/lib/types';
import CertificateCanvas, { CertificateTemplateConfig } from '@/components/CertificateCanvas';
import SocialShareCard from '@/components/SocialShareCard';
import EventSubplatformWorkspace from '@/components/EventSubplatformWorkspace';

const ONGOING_EVENTS = [
  "AVEERANEX INNOVATE - NOV'26",
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicParticipantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Project Submission states
  const [ongoingEvents, setOngoingEvents] = useState<string[]>(ONGOING_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(ONGOING_EVENTS[0]);
  const [selectedRound, setSelectedRound] = useState('Round 1: Abstract & PPT');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Event Hosting Proposal states (for Event Coordinator & Host Admin)
  const [eventName, setEventName] = useState('');
  const [eventRounds, setEventRounds] = useState('');
  const [eventDates, setEventDates] = useState('');
  const [eventPrizes, setEventPrizes] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventMsg, setEventMsg] = useState<string | null>(null);

  // Super Admin Preview Mode
  const [previewCategory, setPreviewCategory] = useState<UserCategory | null>(null);
  const [previewAward, setPreviewAward] = useState<AwardLevel>('PARTICIPATION');
  const [previewOrientation, setPreviewOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [previewRunnerTheme, setPreviewRunnerTheme] = useState<'white' | 'black'>('white');
  const [certTab, setCertTab] = useState<'AWARD' | 'PARTICIPATION'>('AWARD');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('preview') as UserCategory | null;
      if (p && ['PARTICIPANT', 'MENTOR_JURY', 'TECHNICAL_COORDINATOR', 'EVENT_COORDINATOR', 'ADMIN'].includes(p)) {
        setPreviewCategory(p);
      }
      const aw = params.get('award') as AwardLevel | null;
      if (aw) setPreviewAward(aw);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const [meRes, evRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/public/events'),
      ]);

      if (evRes.ok) {
        const evData = await evRes.json();
        if (evData.events && evData.events.length > 0) {
          setOngoingEvents(evData.events);
          setSelectedEvent(evData.events[0]);
        }
      }

      if (!meRes.ok) {
        router.push('/signin');
        return;
      }
      const data = await meRes.json();
      setUser(data.user);
      if (data.user.assignedEvent) {
        setSelectedEvent(data.user.assignedEvent);
        setEventName(data.user.assignedEvent);
      }
      if (data.user.eventRounds) setEventRounds(data.user.eventRounds);
      if (data.user.eventDates) setEventDates(data.user.eventDates);
      if (data.user.eventPrizes) setEventPrizes(data.user.eventPrizes);
      if (data.user.eventDescription) setEventDescription(data.user.eventDescription);
      if (data.user.submissionGithubUrl) {
        setGithubUrl(data.user.submissionGithubUrl);
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
        return;
      }
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'ppt', 'pptx'].includes(ext || '')) {
        setUploadError('Only PDF or PPT/PPTX formats are accepted for project evaluation.');
        return;
      }
      setSubmissionFile(file);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionFile && !user?.submissionFileName) {
      setUploadError('Please select a PDF or PPT presentation file (max 10 MB) to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      if (submissionFile) {
        formData.append('file', submissionFile);
      }
      formData.append('assignedEvent', selectedEvent);
      formData.append('round', selectedRound);
      formData.append('githubUrl', githubUrl);
      formData.append('notes', submissionNotes);

      const res = await fetch('/api/submission/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload project submission.');
      }

      setUser(data.user);
      setUploadSuccess('Your project presentation was submitted successfully! Event host admins have been notified for evaluation.');
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch (err: any) {
      setUploadError(err.message || 'Error submitting project.');
    } finally {
      setUploading(false);
    }
  };

  const handleEventUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEvent(true);
    setEventMsg(null);
    try {
      const formData = new FormData();
      formData.append('assignedEvent', eventName);
      formData.append('eventRounds', eventRounds);
      formData.append('eventDates', eventDates);
      formData.append('eventPrizes', eventPrizes);
      formData.append('eventDescription', eventDescription);
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      const res = await fetch('/api/event/update', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save event details.');
      }

      setUser(data.user);
      setEventMsg('Event details saved and sent to Super Admin for approval!');
    } catch (err: any) {
      setEventMsg(err.message || 'Error saving event details.');
    } finally {
      setSavingEvent(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-aveeranex-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">Loading your portal profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const isSuperAdmin = user.role === 'super_admin' || user.email.toLowerCase() === 'info@aveeranex.com';

  // Construct preview user if Super Admin has a preview category active
  const getDisplayUser = (): PublicParticipantInfo => {
    if (!isSuperAdmin || !previewCategory) return user;

    if (previewCategory === 'MENTOR_JURY') {
      return {
        ...user,
        name: 'Dr. Anand Sharma',
        category: 'MENTOR_JURY',
        organization: 'Microsoft Research India',
        designation: 'Principal AI Scientist & Jury Chair',
        specialization: 'Generative AI & Distributed Cloud',
        assignedEvent: "AVEERANEX INNOVATE - NOV'26",
        presentedOn: "AVEERANEX INNOVATE - NOV'26",
        certificateStatus: 'APPROVED',
        certificateId: 'AVX-MJ-2026-8821',
        teamName: undefined,
      };
    }
    if (previewCategory === 'TECHNICAL_COORDINATOR') {
      return {
        ...user,
        name: 'Prof. Rajesh Mehra',
        category: 'TECHNICAL_COORDINATOR',
        college: 'Chennai Institute of Technology',
        technicalResponsibility: 'Cloud Infrastructure & Evaluation Platform Lead',
        assignedEvent: "AVEERANEX INNOVATE - NOV'26",
        presentedOn: "AVEERANEX INNOVATE - NOV'26",
        certificateStatus: 'APPROVED',
        certificateId: 'AVX-TC-2026-4410',
        teamName: undefined,
      };
    }
    if (previewCategory === 'EVENT_COORDINATOR') {
      return {
        ...user,
        name: 'Priya Venkatesh',
        category: 'EVENT_COORDINATOR',
        college: 'Andhra University',
        committeeRole: 'Organizing Committee & Jury Hospitality Lead',
        assignedEvent: "National Tech Innovation Challenge 2026",
        presentedOn: "National Tech Innovation Challenge 2026",
        eventRounds: '3 Rounds (Ideation, Prototype, Grand Finale)',
        eventDates: '15 Dec - 17 Dec 2026',
        eventPrizes: '1st: ₹50,000 | 2nd: ₹25,000 | 3rd: ₹10,000',
        eventApproved: true,
        certificateStatus: 'APPROVED',
        certificateId: 'AVX-EC-2026-3109',
        teamName: undefined,
      };
    }
    if (previewCategory === 'ADMIN') {
      return {
        ...user,
        name: 'Dr. K. S. Raman',
        category: 'ADMIN',
        organization: 'Vel Tech University',
        designation: 'Dean of Academics & Event Host',
        assignedEvent: 'Vel Tech National AI Hackathon 2026',
        presentedOn: 'Vel Tech National AI Hackathon 2026',
        eventRounds: '2 Rounds',
        eventDates: '20 Dec - 21 Dec 2026',
        eventPrizes: '₹1,00,000 Total Prize Pool',
        eventApproved: false,
        certificateStatus: 'APPROVED',
        certificateId: 'AVX-ADM-2026-1002',
        teamName: undefined,
      };
    }
    return {
      ...user,
      name: 'Aditya Sharma',
      category: 'PARTICIPANT',
      teamName: 'Neural Nexians',
      college: 'Indian Institute of Technology Madras',
      topicTitle: 'Autonomous Edge-AI Fault Detection System',
      awardLevel: previewAward,
      awardOrientation: previewOrientation,
      runnerTheme: previewRunnerTheme,
      assignedEvent: "AVEERANEX INNOVATE - NOV'26",
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
      certificateStatus: 'APPROVED',
      certificateId: previewAward === 'WINNER_1ST' ? 'AVX-WIN1-2026-9841' : 'AVX-2026-NOV-9841',
      participationCertificateId: previewAward !== 'PARTICIPATION' ? 'AVX-2026-NOV-9841' : undefined,
    };
  };

  const activeUser = getDisplayUser();
  const category = activeUser.category || 'PARTICIPANT';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* SUPER ADMIN STAKEHOLDER PREVIEW BAR */}
      {isSuperAdmin && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin Stakeholder Dashboard &amp; Certificate Previewer</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Switch between roles to inspect their live dashboard view and tailored certificate model:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'PARTICIPANT', label: 'Participant' },
              { id: 'MENTOR_JURY', label: 'Mentor / Jury (Gold)' },
              { id: 'TECHNICAL_COORDINATOR', label: 'Tech Coordinator' },
              { id: 'EVENT_COORDINATOR', label: 'Event Coordinator' },
              { id: 'ADMIN', label: 'Host Admin' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPreviewCategory(item.id as UserCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  previewCategory === item.id
                    ? 'bg-aveeranex-cyan text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}

            {previewCategory === 'PARTICIPANT' && (
              <>
                <select
                  value={previewAward}
                  onChange={(e) => setPreviewAward(e.target.value as AwardLevel)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 text-xs font-bold outline-none"
                >
                  <option value="PARTICIPATION">Participation</option>
                  <option value="WINNER_1ST">🥇 1st Winner (Gold)</option>
                  <option value="WINNER_2ND">🥈 2nd Winner (Silver)</option>
                  <option value="WINNER_3RD">🥉 3rd Winner (Bronze)</option>
                  <option value="RUNNER_4TH">🏅 4th Runner</option>
                  <option value="RUNNER_5TH">🎖️ 5th Runner</option>
                </select>

                {previewAward !== 'PARTICIPATION' && (
                  <select
                    value={previewOrientation}
                    onChange={(e) => setPreviewOrientation(e.target.value as 'landscape' | 'portrait')}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 text-xs font-bold outline-none"
                  >
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Vertical</option>
                  </select>
                )}

                {(previewAward === 'RUNNER_4TH' || previewAward === 'RUNNER_5TH') && (
                  <select
                    value={previewRunnerTheme}
                    onChange={(e) => setPreviewRunnerTheme(e.target.value as 'white' | 'black')}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-500/40 text-white text-xs font-bold outline-none"
                  >
                    <option value="white">Pure White</option>
                    <option value="black">Pure Black</option>
                  </select>
                )}
              </>
            )}

            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-700 text-purple-300 hover:text-white text-xs font-semibold"
            >
              &larr; Back to Admin Console
            </Link>
          </div>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-aveeranex-card via-slate-900 to-aveeranex-card border border-aveeranex-border/80 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aveeranex-teal/20 border border-aveeranex-teal/40 text-aveeranex-cyan text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {category === 'MENTOR_JURY'
              ? 'DISTINGUISHED MENTOR / JURY PORTAL'
              : category === 'TECHNICAL_COORDINATOR'
              ? 'TECHNICAL COORDINATOR PORTAL'
              : category === 'EVENT_COORDINATOR'
              ? 'EVENT COORDINATOR PORTAL'
              : category === 'ADMIN'
              ? 'EVENT HOST ADMINISTRATOR'
              : 'PARTICIPANT DASHBOARD'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {activeUser.name}!
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            {category === 'PARTICIPANT' ? (
              <>
                Team <span className="text-white font-semibold">{activeUser.teamName}</span> &bull; {activeUser.college}
              </>
            ) : (
              <>
                <span className="text-white font-semibold">{activeUser.designation || activeUser.technicalResponsibility || activeUser.committeeRole || 'Stakeholder'}</span> &bull; {activeUser.organization || activeUser.college}
              </>
            )}
          </p>
        </div>

        {/* Certificate Status Badge */}
        <div className="flex flex-col items-start md:items-end gap-2 relative z-10">
          <div className="text-xs text-slate-400 font-mono">CERTIFICATE STATUS</div>
          {activeUser.certificateStatus === 'APPROVED' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Approved &amp; Issued</span>
            </div>
          )}

          {activeUser.certificateStatus === 'PENDING_APPROVAL' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold text-sm animate-pulse">
              <Clock className="w-4 h-4" />
              <span>Pending Super Admin Approval</span>
            </div>
          )}

          {activeUser.certificateStatus === 'NOT_REQUESTED' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Ready to Generate</span>
            </div>
          )}

          {activeUser.certificateStatus === 'REJECTED' && (
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

      {/* EVENT HOSTING PROPOSAL CARD (For Event Coordinator & Host Admin) */}
      {(category === 'EVENT_COORDINATOR' || category === 'ADMIN') && (
        <div className="bg-gradient-to-b from-aveeranex-card/80 to-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700 text-purple-300 text-xs font-mono font-semibold uppercase">
                <Trophy className="w-3.5 h-3.5 text-purple-400" />
                HOSTED EVENT PROPOSAL &amp; DETAILS
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Manage Your Hackathon / Competition Proposal
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Complete your event details (rounds, dates, winning prizes, sample banner in 1200 &times; 630 px, and description). Once approved by the Super Admin, your event goes live for participant registration and submissions.
              </p>
            </div>

            <div className="shrink-0">
              {user.eventApproved ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  Event Approved &amp; Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  Pending Super Admin Approval
                </span>
              )}
            </div>
          </div>

          {eventMsg && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-700 text-cyan-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{eventMsg}</span>
            </div>
          )}

          <form onSubmit={handleEventUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event / Hackathon / Competition Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Enter your Event / Hackathon Name"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Number of Rounds
                </label>
                <input
                  type="text"
                  value={eventRounds}
                  onChange={(e) => setEventRounds(e.target.value)}
                  placeholder="e.g. 3 Rounds (Screening, Prototype, Finale)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Dates
                </label>
                <input
                  type="text"
                  value={eventDates}
                  onChange={(e) => setEventDates(e.target.value)}
                  placeholder="e.g. 15 Dec 2026 - 17 Dec 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-purple-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Winning Prizes
                </label>
                <input
                  type="text"
                  value={eventPrizes}
                  onChange={(e) => setEventPrizes(e.target.value)}
                  placeholder="e.g. 1st Prize: ₹50,000 | 2nd Prize: ₹25,000 | 3rd Prize: ₹10,000"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-purple-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sample Banner Image <span className="text-slate-400">(Recommended dimensions: 1200 &times; 630 px, PNG/JPG)</span>
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-950 file:text-purple-300 hover:file:bg-purple-900 cursor-pointer"
                />
                {user.eventBannerUrl && (
                  <p className="text-[11px] text-emerald-400 mt-1">
                    Current Banner: <a href={user.eventBannerUrl} target="_blank" rel="noreferrer" className="underline">{user.eventBannerUrl}</a>
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Basic Description &amp; Rules
                </label>
                <textarea
                  rows={3}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Describe your hackathon themes, eligibility, and evaluation process..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingEvent}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
              >
                {savingEvent ? 'Saving Proposal...' : 'Save & Submit Event for Super Admin Approval'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EVENT SUB-PLATFORM WORKSPACE (Certificate Designer, Onboarding, Submissions & Jury Evaluations) */}
      {(category === 'EVENT_COORDINATOR' || category === 'ADMIN' || category === 'MENTOR_JURY' || category === 'TECHNICAL_COORDINATOR') && (
        <EventSubplatformWorkspace
          hostUser={activeUser}
          onTemplateSaved={(u) => setUser(u)}
        />
      )}

      {/* PHASE 1: PROJECT SUBMISSION PORTAL (For Participants) */}
      {category === 'PARTICIPANT' && (
        <div className="bg-gradient-to-b from-aveeranex-card/80 to-slate-900 border border-aveeranex-cyan/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs font-mono font-semibold uppercase">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                PHASE 1 EVALUATION SUBMISSION
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Submit Project Presentation for Evaluation
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Select your hackathon event and upload your PDF / PPT slides (max 10 MB). Submissions are routed instantly to designated Event Host Admins for jury assessment.
              </p>
            </div>

            {user.submissionFileName && (
              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-right">
                <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 justify-end">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submission Received</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold truncate max-w-[200px]">
                  {user.submissionFileName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {user.submissionFileSize} &bull; {user.submittedAt ? new Date(user.submittedAt).toLocaleDateString() : 'Active'}
                </div>
              </div>
            )}
          </div>

          {uploadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* JURY & EVALUATOR FEEDBACK BANNER */}
          {user.submissionFeedback && (
            <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-700/80 text-cyan-200 text-xs flex items-start gap-3 shadow-lg">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white uppercase tracking-wider font-mono">
                  Event Evaluator Remarks &amp; Feedback:
                </span>
                <p className="text-slate-200">{user.submissionFeedback}</p>
                {user.submissionStatus && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-900 border border-cyan-700 text-cyan-300 text-[10px] font-bold">
                    Round Evaluation Status: {user.submissionStatus}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* LIVE EVENT STANDINGS & LEADERBOARD STATS */}
          {(user.leaderboardScore !== undefined || user.leaderboardRank !== undefined) && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 text-xl font-bold shadow-lg">
                  🏆
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase">Live Event Standings</div>
                  <div className="text-base font-extrabold text-white">
                    {user.leaderboardRank ? `Rank #${user.leaderboardRank}` : 'Evaluated'} &bull; Total Score: {user.leaderboardScore}/100
                  </div>
                  <div className="text-xs text-slate-400">Current Phase: {user.submissionRound || 'Round 1: Abstract & PPT'}</div>
                </div>
              </div>

              {user.isFinalist && (
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-300 font-extrabold text-xs shadow-md">
                  ⭐ Grand Finalist
                </span>
              )}
            </div>
          )}

          <form onSubmit={handleProjectSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Event Selector Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Hackathon Event <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-aveeranex-cyan"
                >
                  {ongoingEvents.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submission Round Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Submission Round <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-aveeranex-cyan"
                >
                  <option value="Round 1: Abstract &amp; PPT">Round 1: Abstract &amp; PPT</option>
                  <option value="Round 2: Prototype &amp; Code">Round 2: Prototype &amp; Code</option>
                  <option value="Round 3: Grand Finale Pitch">Round 3: Grand Finale Pitch</option>
                </select>
              </div>

              {/* GitHub / Demo URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  GitHub / Live Demo Link <span className="text-slate-500">(Optional)</span>
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/your-team/project"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-aveeranex-cyan"
                  />
                </div>
              </div>
            </div>

            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload Presentation / Documentation <span className="text-rose-400">* (PDF or PPT/PPTX within 10 MB)</span>
              </label>
              <div className="relative border-2 border-dashed border-slate-700 hover:border-aveeranex-cyan rounded-2xl p-6 text-center bg-slate-950/60 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    {submissionFile ? submissionFile.name : 'Click or drag presentation file here'}
                  </div>
                  <p className="text-xs text-slate-400">
                    {submissionFile
                      ? `${(submissionFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit`
                      : 'Accepts PDF, PPT, PPTX formats up to 10 MB'}
                  </p>
                </div>
              </div>
            </div>

            {/* Synopsis / Solution Highlights */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Executive Synopsis & Key Features <span className="text-slate-500">(Optional notes for jury)</span>
              </label>
              <textarea
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={3}
                placeholder="Briefly summarize your architecture, innovations, and problem solved..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-aveeranex-cyan"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-aveeranex-teal via-cyan-600 to-aveeranex-cyan hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-cyan-950 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading Presentation (max 10MB)...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>{user.submissionFileName ? 'Re-Submit Presentation' : 'Submit Project for Evaluation'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CERTIFICATE GENERATION & VIEWER SECTION */}
      <div className="space-y-8">
        {/* CASE 1: NOT_REQUESTED - Generate Certificate Card */}
        {activeUser.certificateStatus === 'NOT_REQUESTED' && (
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-aveeranex-card to-slate-900 border-2 border-dashed border-aveeranex-cyan/40 text-center space-y-6 max-w-3xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-aveeranex-teal to-cyan-400 flex items-center justify-center mx-auto text-white shadow-lg shadow-cyan-950">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {category === 'MENTOR_JURY'
                  ? 'Request Prestige Mentor / Jury Recognition Certificate'
                  : category === 'TECHNICAL_COORDINATOR'
                  ? 'Request Technical Coordinator Certificate'
                  : category === 'EVENT_COORDINATOR'
                  ? 'Request Event Coordinator Certificate'
                  : 'Generate Your Certificate of Participation'}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
                Ready to receive your official credentials for <span className="text-aveeranex-cyan font-semibold">{activeUser.assignedEvent || activeUser.presentedOn}</span>? Clicking below will submit your profile to the central administration for official signature and issuance.
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
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    <span>Generate Certificate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* CASE 2: PENDING_APPROVAL - Review Notice */}
        {activeUser.certificateStatus === 'PENDING_APPROVAL' && (
          <div className="p-8 sm:p-10 rounded-3xl bg-amber-950/20 border border-amber-500/40 text-center space-y-6 max-w-3xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold uppercase">
                Under Administrative Review
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Certificate Authorization in Progress
              </h2>
              <p className="text-slate-300 text-sm max-w-lg mx-auto">
                Your credential request is currently being processed by the administration for {activeUser.assignedEvent || activeUser.presentedOn}. Once approved, your verified certificate will appear here ready for high-resolution download.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center">
              <button
                onClick={fetchUserData}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check Status</span>
              </button>
            </div>
          </div>
        )}

        {/* CASE 3: APPROVED - Live Dynamic Certificate Canvas & Verification */}
        {activeUser.certificateStatus === 'APPROVED' && activeUser.certificateId && (
          <div className="space-y-10">
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
                  href={`/verify/${activeUser.certificateId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/80"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Public Verification Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Dual Certificate Switcher if recipient has BOTH Winner/Runner + Participation */}
              {activeUser.participationCertificateId && activeUser.awardLevel !== 'PARTICIPATION' && (
                <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 w-fit">
                  <button
                    type="button"
                    onClick={() => setCertTab('AWARD')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      certTab === 'AWARD'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    🏆 {activeUser.awardLevel?.replace(/_/g, ' ')} Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertTab('PARTICIPATION')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      certTab === 'PARTICIPATION'
                        ? 'bg-aveeranex-teal text-white shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    🎓 Certificate of Participation
                  </button>
                </div>
              )}

              {/* Dynamic Certificate Renderer supporting all categories & award levels */}
              <CertificateCanvas
                participantName={activeUser.name}
                teamName={activeUser.teamName}
                certificateId={
                  certTab === 'PARTICIPATION' && activeUser.participationCertificateId
                    ? activeUser.participationCertificateId
                    : activeUser.certificateId
                }
                topicTitle={activeUser.topicTitle}
                college={activeUser.college}
                category={activeUser.category}
                awardLevel={
                  certTab === 'PARTICIPATION' && activeUser.participationCertificateId
                    ? 'PARTICIPATION'
                    : activeUser.awardLevel
                }
                awardOrientation={
                  certTab === 'PARTICIPATION' && activeUser.participationCertificateId
                    ? 'landscape'
                    : activeUser.awardOrientation
                }
                runnerTheme={activeUser.runnerTheme}
                organization={activeUser.organization}
                specialization={activeUser.specialization}
                presentedOn={activeUser.assignedEvent || activeUser.presentedOn}
                onDownloadSuccess={() => {
                  confetti({
                    particleCount: 70,
                    spread: 80,
                    origin: { y: 0.6 },
                  });
                }}
              />
            </div>

            {/* Social Share & Tagging Card */}
            <SocialShareCard
              participantName={activeUser.name}
              teamName={activeUser.teamName}
              topicTitle={activeUser.topicTitle || activeUser.assignedEvent}
              certificateId={activeUser.certificateId}
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

        {/* Profile Summary Card */}
        <div className="bg-aveeranex-card/50 border border-aveeranex-border/60 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-aveeranex-border/40">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-aveeranex-cyan" />
              <span>Registered Profile & Stakeholder Record</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Role: {activeUser.category || 'PARTICIPANT'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">Full Name</span>
              <div className="font-semibold text-white">{activeUser.name}</div>
            </div>

            {activeUser.teamName && (
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-mono">Team Name</span>
                <div className="font-semibold text-white">{activeUser.teamName}</div>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">E-mail ID</span>
              <div className="font-mono text-slate-300">{activeUser.email}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">Contact Phone</span>
              <div className="font-mono text-slate-300">{activeUser.contact || 'N/A'}</div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <span className="text-xs text-slate-400 uppercase font-mono">Organization / Institution</span>
              <div className="font-medium text-white">{activeUser.college || activeUser.organization || 'Aveeranex Partner'}</div>
            </div>

            {activeUser.topicTitle && (
              <div className="space-y-1 md:col-span-2">
                <span className="text-xs text-slate-400 uppercase font-mono">Project Topic</span>
                <div className="font-medium text-aveeranex-cyan">{activeUser.topicTitle}</div>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">Event Enrolled</span>
              <div className="font-medium text-emerald-400">{activeUser.assignedEvent || activeUser.presentedOn || 'Aveeranex Innovate'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
