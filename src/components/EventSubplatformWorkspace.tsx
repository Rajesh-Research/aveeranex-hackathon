'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Users,
  UserPlus,
  CheckCircle2,
  Award,
  Sparkles,
  Check,
  X,
  Eye,
  FileText,
  Trophy,
  RefreshCw,
  Medal,
  Sliders,
  ExternalLink,
  Download,
  Upload,
  Calendar,
  Gift,
  Search,
  Settings,
  ChevronRight,
  Send,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PublicParticipantInfo, UserCategory, AwardLevel } from '@/lib/types';
import CertificateCanvas, {
  CertificateTemplateConfig,
  CertificateSignatureItem,
} from '@/components/CertificateCanvas';

interface EventSubplatformWorkspaceProps {
  hostUser: PublicParticipantInfo;
  onTemplateSaved?: (updatedUser: PublicParticipantInfo) => void;
}

export default function EventSubplatformWorkspace({
  hostUser,
  onTemplateSaved,
}: EventSubplatformWorkspaceProps) {
  // Navigation Tabs: LEADERBOARD | SUBMISSIONS | ONBOARD | CERTIFICATES | EVENT_INFO
  const [activeTab, setActiveTab] = useState<
    'LEADERBOARD' | 'SUBMISSIONS' | 'ONBOARD' | 'CERTIFICATES' | 'EVENT_INFO'
  >('LEADERBOARD');

  const isEvaluator = hostUser.category === 'MENTOR_JURY' || hostUser.category === 'TECHNICAL_COORDINATOR';

  const [eventUsers, setEventUsers] = useState<PublicParticipantInfo[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Event Configuration State
  const [eventTitle, setEventTitle] = useState(
    hostUser.assignedEvent || hostUser.presentedOn || "AVEERANEX INNOVATE - NOV'26"
  );
  const [eventRounds, setEventRounds] = useState(
    hostUser.eventRounds || '3 Rounds (Round 1: Abstract & PPT, Round 2: Prototype, Round 3: Grand Finale)'
  );
  const [eventDates, setEventDates] = useState(hostUser.eventDates || '15 Dec 2026 - 17 Dec 2026');
  const [eventPrizes, setEventPrizes] = useState(
    hostUser.eventPrizes || '1st: ₹50,000 | 2nd: ₹25,000 | 3rd: ₹10,000'
  );
  const [eventBannerUrl, setEventBannerUrl] = useState(hostUser.eventBannerUrl || '');
  const [eventDescription, setEventDescription] = useState(hostUser.eventDescription || '');
  const [isLeaderboardPublished, setIsLeaderboardPublished] = useState(
    Boolean(hostUser.isLeaderboardPublished)
  );
  const [savingEvent, setSavingEvent] = useState(false);

  // Template Studio State
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
    hostUser.certOrientation || 'landscape'
  );
  const [bgStyle, setBgStyle] = useState<'classic' | 'gold' | 'dark' | 'white'>(
    hostUser.certBgStyle || 'classic'
  );
  const [fontStyle, setFontStyle] = useState<'royal' | 'modern' | 'classic'>(
    hostUser.certFontStyle || 'modern'
  );
  const [accentColor, setAccentColor] = useState(hostUser.certAccentColor || '#067F92');
  const [customTitle, setCustomTitle] = useState(
    hostUser.certCustomTitle || 'CERTIFICATE OF ACHIEVEMENT'
  );
  const [hostSignatory, setHostSignatory] = useState(
    hostUser.certHostSignatory || hostUser.name
  );
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(hostUser.certCustomLogoUrl || '');
  const [logoPosition, setLogoPosition] = useState<'left' | 'center' | 'right'>(
    hostUser.certLogoPosition || 'center'
  );
  const [customRibbonText, setCustomRibbonText] = useState(hostUser.certCustomRibbonText || '');
  const [customBodyText, setCustomBodyText] = useState(hostUser.certCustomBodyText || '');
  const [signatures, setSignatures] = useState<CertificateSignatureItem[]>(() => {
    if (hostUser.certSignatures) {
      try {
        return JSON.parse(hostUser.certSignatures);
      } catch {}
    }
    return [
      {
        name: hostUser.name,
        title: hostUser.designation || 'Event Host',
        imageUrl: '/assets/signature.png',
        position: 'left',
      },
    ];
  });
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Scoring & Evaluation Modal State
  const [scoringUser, setScoringUser] = useState<PublicParticipantInfo | null>(null);
  const [scoreInnovation, setScoreInnovation] = useState<number>(20);
  const [scoreTechnical, setScoreTechnical] = useState<number>(20);
  const [scorePresentation, setScorePresentation] = useState<number>(20);
  const [scoreImpact, setScoreImpact] = useState<number>(20);
  const [customRank, setCustomRank] = useState<string>('');
  const [isFinalistCheck, setIsFinalistCheck] = useState<boolean>(false);
  const [savingScore, setSavingScore] = useState(false);

  // Review & Remarks Modal
  const [reviewUser, setReviewUser] = useState<PublicParticipantInfo | null>(null);
  const [reviewRound, setReviewRound] = useState('Round 2: Prototype & Code');
  const [reviewStatus, setReviewStatus] = useState<string>('ROUND_1_APPROVED');
  const [reviewFeedback, setReviewFeedback] = useState('Excellent PPT presentation. Approved for Round 2!');
  const [savingReview, setSavingReview] = useState(false);

  // Onboard State (Single & Bulk)
  const [onboardMode, setOnboardMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
  const [onboardName, setOnboardName] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardContact, setOnboardContact] = useState('');
  const [onboardRole, setOnboardRole] = useState<UserCategory>('PARTICIPANT');
  const [onboardTeamName, setOnboardTeamName] = useState('');
  const [onboardTopic, setOnboardTopic] = useState('');
  const [onboardOrg, setOnboardOrg] = useState(hostUser.organization || hostUser.college || '');
  const [onboardSpec, setOnboardSpec] = useState('');
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [onboarding, setOnboarding] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roundFilter, setRoundFilter] = useState('ALL');

  // Approval action in progress
  const [awardingId, setAwardingId] = useState<string | null>(null);

  const fetchEventData = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/event/subplatform');
      if (res.ok) {
        const data = await res.json();
        setEventUsers(data.users || []);
        if (data.event) {
          if (data.event.name) setEventTitle(data.event.name);
          if (data.event.rounds) setEventRounds(data.event.rounds);
          if (data.event.dates) setEventDates(data.event.dates);
          if (data.event.prizes) setEventPrizes(data.event.prizes);
          if (data.event.bannerUrl) setEventBannerUrl(data.event.bannerUrl);
          if (data.event.description) setEventDescription(data.event.description);
          setIsLeaderboardPublished(Boolean(data.event.isLeaderboardPublished));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [hostUser.id]);

  // Save Event Info
  const handleSaveEventInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEvent(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/event/subplatform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_EVENT',
          name: eventTitle,
          rounds: eventRounds,
          dates: eventDates,
          prizes: eventPrizes,
          bannerUrl: eventBannerUrl,
          description: eventDescription,
          isLeaderboardPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event.');
      setStatusMsg('Event space configuration saved successfully!');
      if (onTemplateSaved && data.user) onTemplateSaved(data.user);
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setSavingEvent(false);
    }
  };

  // Toggle Publish Leaderboard
  const handleToggleLeaderboard = async () => {
    const nextState = !isLeaderboardPublished;
    try {
      const res = await fetch('/api/event/subplatform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_LEADERBOARD',
          publish: nextState,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsLeaderboardPublished(nextState);
        setStatusMsg(data.message);
        if (nextState) {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        }
      }
    } catch (e: any) {
      setStatusMsg(e.message);
    }
  };

  // Open Score Modal
  const openScoringModal = (user: PublicParticipantInfo) => {
    setScoringUser(user);
    setScoreInnovation(user.scoreInnovation || 20);
    setScoreTechnical(user.scoreTechnical || 20);
    setScorePresentation(user.scorePresentation || 20);
    setScoreImpact(user.scoreImpact || 20);
    setCustomRank(user.leaderboardRank ? String(user.leaderboardRank) : '');
    setIsFinalistCheck(Boolean(user.isFinalist));
  };

  // Save Score
  const handleSaveScore = async () => {
    if (!scoringUser) return;
    setSavingScore(true);
    try {
      const total = Number(scoreInnovation) + Number(scoreTechnical) + Number(scorePresentation) + Number(scoreImpact);
      const res = await fetch('/api/event/subplatform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SCORE_PARTICIPANT',
          userId: scoringUser.id,
          scoreInnovation,
          scoreTechnical,
          scorePresentation,
          scoreImpact,
          leaderboardScore: total,
          leaderboardRank: customRank ? Number(customRank) : undefined,
          isFinalist: isFinalistCheck,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save score.');
      setStatusMsg(data.message);
      setScoringUser(null);
      await fetchEventData();
    } catch (e: any) {
      setStatusMsg(e.message);
    } finally {
      setSavingScore(false);
    }
  };

  // Open Review Submission Modal
  const openReviewModal = (user: PublicParticipantInfo) => {
    setReviewUser(user);
    setReviewRound(user.submissionRound || 'Round 2: Prototype & Code');
    setReviewStatus(user.submissionStatus || 'ROUND_1_APPROVED');
    setReviewFeedback(user.submissionFeedback || 'PPT presentation reviewed and approved.');
  };

  // Save Review Submission
  const handleSaveReview = async () => {
    if (!reviewUser) return;
    setSavingReview(true);
    try {
      const res = await fetch('/api/event/subplatform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REVIEW_SUBMISSION',
          userId: reviewUser.id,
          submissionRound: reviewRound,
          submissionStatus: reviewStatus,
          submissionFeedback: reviewFeedback,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to review submission.');
      setStatusMsg(data.message);
      setReviewUser(null);
      await fetchEventData();
    } catch (e: any) {
      setStatusMsg(e.message);
    } finally {
      setSavingReview(false);
    }
  };

  // Onboard Submit (Single)
  const handleOnboardSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboarding(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/event/subplatform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ONBOARD',
          name: onboardName,
          email: onboardEmail,
          contact: onboardContact,
          category: onboardRole,
          teamName: onboardTeamName,
          topicTitle: onboardTopic,
          organization: onboardOrg,
          specialization: onboardSpec,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to onboard member.');
      setStatusMsg(data.message);
      setOnboardName('');
      setOnboardEmail('');
      setOnboardContact('');
      setOnboardTeamName('');
      setOnboardTopic('');
      setOnboardSpec('');
      await fetchEventData();
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setOnboarding(false);
    }
  };

  // Bulk Onboard Submit
  const handleOnboardBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsvText.trim()) return;
    setOnboarding(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/event/subplatform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_ONBOARD_PARTICIPANTS',
          rawData: bulkCsvText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed bulk onboarding.');
      setStatusMsg(data.message);
      setBulkCsvText('');
      await fetchEventData();
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setOnboarding(false);
    }
  };

  // Approve Certificate with Award Level
  const handleApproveParticipant = async (userId: string, award: AwardLevel) => {
    setAwardingId(userId);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/event/subplatform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          userId,
          awardLevel: award,
          awardOrientation: orientation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed.');
      setStatusMsg(data.message);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      await fetchEventData();
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setAwardingId(null);
    }
  };

  // Bulk Approve Certificates
  const handleBulkApprove = async () => {
    if (!confirm('Approve verified certificates for all participants in this event?')) return;
    setAwardingId('bulk');
    setStatusMsg(null);
    try {
      const res = await fetch('/api/event/subplatform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_APPROVE',
          awardLevel: 'PARTICIPATION',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk approval failed.');
      setStatusMsg(data.message);
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
      await fetchEventData();
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setAwardingId(null);
    }
  };

  // Save Certificate Template Design
  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/event/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certOrientation: orientation,
          certBgStyle: bgStyle,
          certFontStyle: fontStyle,
          certAccentColor: accentColor,
          certCustomTitle: customTitle,
          certHostSignatory: hostSignatory,
          certCustomLogoUrl: customLogoUrl,
          certLogoPosition: logoPosition,
          certCustomRibbonText: customRibbonText,
          certCustomBodyText: customBodyText,
          certSignatures: JSON.stringify(signatures),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save template.');
      setStatusMsg('Certificate template design saved for your event!');
      if (onTemplateSaved && data.user) onTemplateSaved(data.user);
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  const readFileAsDataUrl = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') cb(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const templateConfig: CertificateTemplateConfig = {
    orientation,
    bgStyle,
    fontStyle,
    accentColor,
    customTitle,
    hostSignatory,
    customLogoUrl: customLogoUrl || undefined,
    logoPosition,
    customRibbonText: customRibbonText || undefined,
    customBodyText: customBodyText || undefined,
    signatures,
  };

  // Filtered participants & submissions
  const allParticipants = eventUsers.filter((u) => (u.category || 'PARTICIPANT') === 'PARTICIPANT');
  const allTeamStaff = eventUsers.filter((u) => u.category && u.category !== 'PARTICIPANT');

  const filteredParticipants = allParticipants.filter((p) => {
    const matchQuery =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.teamName && p.teamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.topicTitle && p.topicTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRound =
      roundFilter === 'ALL' ||
      (roundFilter === 'SUBMITTED' && (p.submissionFileUrl || p.submissionGithubUrl)) ||
      (roundFilter === 'FINALIST' && p.isFinalist) ||
      (roundFilter === 'APPROVED' && p.certificateStatus === 'APPROVED');

    return matchQuery && matchRound;
  });

  // Leaderboard sorting: Rank (ascending) then Total Score (descending)
  const leaderboardUsers = [...allParticipants].sort((a, b) => {
    if (a.leaderboardRank && b.leaderboardRank) return a.leaderboardRank - b.leaderboardRank;
    if (a.leaderboardRank) return -1;
    if (b.leaderboardRank) return 1;
    return (b.leaderboardScore || 0) - (a.leaderboardScore || 0);
  });

  const podiumFirst = leaderboardUsers[0];
  const podiumSecond = leaderboardUsers[1];
  const podiumThird = leaderboardUsers[2];

  return (
    <div className="bg-slate-950 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs font-mono font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {isEvaluator ? 'AVEERANEX JURY & EVALUATOR PORTAL' : 'AVEERANEX EVENT HOST & COORDINATION PORTAL'}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>{eventTitle}</span>
            {isLeaderboardPublished && (
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                LIVE LEADERBOARD ACTIVE
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">
            Dedicated Event Space: review PPT submissions, evaluate rounds of evaluation, manage live leaderboards, onboard participants, and issue verified certificates.
          </p>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'LEADERBOARD'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg font-extrabold'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-950" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('SUBMISSIONS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'SUBMISSIONS'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PPT Submissions &amp; Rounds</span>
          </button>

          {!isEvaluator && (
            <>
              <button
                onClick={() => setActiveTab('ONBOARD')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'ONBOARD'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Onboard ({allParticipants.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('CERTIFICATES')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'CERTIFICATES'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Certificate Studio</span>
              </button>

              <button
                onClick={() => setActiveTab('EVENT_INFO')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'EVENT_INFO'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Event Space Setup</span>
              </button>
            </>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-cyan-950/70 border border-cyan-700 text-cyan-200 text-xs flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: LEADERBOARD & SCORING MATRIX                     */}
      {/* ======================================================== */}
      {activeTab === 'LEADERBOARD' && (
        <div className="space-y-6">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Live Event Leaderboard &amp; Grand Finals Standings</span>
              </h3>
              <p className="text-xs text-slate-400">
                Scores: Innovation (25) + Technical Prototype (25) + PPT / Pitch (25) + Impact (25) = Total (100).
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!isEvaluator ? (
                <>
                  <button
                    onClick={handleToggleLeaderboard}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isLeaderboardPublished
                        ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                        : 'bg-amber-500 text-slate-950 shadow-md font-extrabold hover:bg-amber-400'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>{isLeaderboardPublished ? '✓ Leaderboard Published (Live)' : 'Publish Leaderboard to Participants'}</span>
                  </button>

                  <button
                    onClick={handleBulkApprove}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>Bulk Issue Certificates</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${isLeaderboardPublished ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isLeaderboardPublished ? 'Leaderboard Live for Participants' : 'Draft Mode (Scoring in progress)'}</span>
                </div>
              )}
            </div>
          </div>

          {/* TOP 3 PODIUM DISPLAY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 2nd Place Silver */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 text-center space-y-2 relative order-2 md:order-1">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-slate-300 font-extrabold text-lg shadow-lg">
                🥈
              </div>
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                Rank 2 &bull; Silver Winner
              </span>
              <div className="font-extrabold text-white text-base truncate">
                {podiumSecond ? podiumSecond.teamName || podiumSecond.name : 'Awaiting Finalist'}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {podiumSecond ? podiumSecond.topicTitle || 'No project title' : 'Score Pending'}
              </div>
              <div className="text-xs font-mono font-bold text-cyan-300">
                Score: {podiumSecond?.leaderboardScore ? `${podiumSecond.leaderboardScore}/100` : 'Not evaluated'}
              </div>
              {podiumSecond && (
                <button
                  onClick={() => handleApproveParticipant(podiumSecond.id, 'WINNER_2ND')}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-600"
                >
                  Issue Silver Winner Certificate
                </button>
              )}
            </div>

            {/* 1st Place Gold (Center / Prominent) */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/80 text-center space-y-2 relative shadow-2xl shadow-amber-950/50 order-1 md:order-2 -translate-y-1">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-b from-amber-400 to-yellow-600 border-2 border-yellow-200 flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-xl">
                🥇
              </div>
              <span className="text-xs font-mono text-amber-400 uppercase font-extrabold tracking-wider">
                Champion &bull; 1st Place Gold Winner
              </span>
              <div className="font-black text-white text-lg truncate">
                {podiumFirst ? podiumFirst.teamName || podiumFirst.name : 'Awaiting Champion'}
              </div>
              <div className="text-xs text-slate-300 truncate">
                {podiumFirst ? podiumFirst.topicTitle || 'No project title' : 'Score Pending'}
              </div>
              <div className="text-sm font-mono font-black text-amber-400">
                Score: {podiumFirst?.leaderboardScore ? `${podiumFirst.leaderboardScore}/100` : 'Not evaluated'}
              </div>
              {podiumFirst && (
                <button
                  onClick={() => handleApproveParticipant(podiumFirst.id, 'WINNER_1ST')}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold shadow-lg"
                >
                  Issue Champion Gold Certificate
                </button>
              )}
            </div>

            {/* 3rd Place Bronze */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-800/60 text-center space-y-2 relative order-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-950/80 border-2 border-amber-700 flex items-center justify-center text-amber-400 font-extrabold text-lg shadow-lg">
                🥉
              </div>
              <span className="text-[11px] font-mono text-amber-500 uppercase font-bold tracking-wider">
                Rank 3 &bull; Bronze Winner
              </span>
              <div className="font-extrabold text-white text-base truncate">
                {podiumThird ? podiumThird.teamName || podiumThird.name : 'Awaiting Finalist'}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {podiumThird ? podiumThird.topicTitle || 'No project title' : 'Score Pending'}
              </div>
              <div className="text-xs font-mono font-bold text-amber-400">
                Score: {podiumThird?.leaderboardScore ? `${podiumThird.leaderboardScore}/100` : 'Not evaluated'}
              </div>
              {podiumThird && (
                <button
                  onClick={() => handleApproveParticipant(podiumThird.id, 'WINNER_3RD')}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold border border-amber-800/80"
                >
                  Issue Bronze Winner Certificate
                </button>
              )}
            </div>
          </div>

          {/* LEADERBOARD TABLE */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">
                Complete Leaderboard Standings ({leaderboardUsers.length} Teams)
              </span>
              <div className="text-xs text-slate-400 font-mono">
                Click &ldquo;Score / Evaluate&rdquo; to input jury marks
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Rank</th>
                    <th className="p-3.5">Team &amp; Leader</th>
                    <th className="p-3.5">Project Topic</th>
                    <th className="p-3.5">Round Reached</th>
                    <th className="p-3.5 text-center">Score (out of 100)</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboardUsers.map((p, idx) => {
                    const rankNum = p.leaderboardRank || idx + 1;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold font-mono">
                          {rankNum === 1 ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-extrabold">
                              🥇 #1
                            </span>
                          ) : rankNum === 2 ? (
                            <span className="inline-flex items-center gap-1 text-slate-300 font-extrabold">
                              🥈 #2
                            </span>
                          ) : rankNum === 3 ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-extrabold">
                              🥉 #3
                            </span>
                          ) : (
                            <span className="text-slate-400">#{rankNum}</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-white">{p.teamName || p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.name} &bull; {p.college || 'Institution'}</div>
                        </td>

                        <td className="p-3.5 max-w-xs truncate text-slate-300">
                          {p.topicTitle || 'Topic submission pending'}
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800">
                            {p.submissionRound || 'Round 1: PPT'}
                          </span>
                        </td>

                        <td className="p-3.5 text-center font-mono font-bold text-amber-300">
                          {p.leaderboardScore !== undefined ? `${p.leaderboardScore}` : '-'}
                        </td>

                        <td className="p-3.5 text-center">
                          {p.certificateStatus === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              {p.awardLevel || 'APPROVED'}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Pending Approval</span>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openScoringModal(p)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-900/60 text-cyan-300 border border-slate-700 text-[11px] font-semibold"
                          >
                            Score / Evaluate
                          </button>

                          <button
                            disabled={awardingId === p.id}
                            onClick={() => handleApproveParticipant(p.id, rankNum === 1 ? 'WINNER_1ST' : rankNum === 2 ? 'WINNER_2ND' : rankNum === 3 ? 'WINNER_3RD' : 'PARTICIPATION')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold disabled:opacity-50"
                          >
                            {awardingId === p.id ? 'Issuing...' : 'Issue Cert'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PPT SUBMISSIONS & ROUNDS REVIEW                   */}
      {/* ======================================================== */}
      {activeTab === 'SUBMISSIONS' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Participant Project &amp; PPT Submissions</span>
              </h3>
              <p className="text-xs text-slate-400">
                Review slide decks, evaluate round criteria, approve advancement to subsequent rounds or Grand Finale.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Filter:</span>
              {['ALL', 'SUBMITTED', 'FINALIST', 'APPROVED'].map((flt) => (
                <button
                  key={flt}
                  onClick={() => setRoundFilter(flt)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    roundFilter === flt
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredParticipants.map((p) => {
              const hasFile = Boolean(p.submissionFileUrl);
              const hasGithub = Boolean(p.submissionGithubUrl);

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
                        {p.submissionRound || 'Round 1: Abstract & PPT'}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">{p.teamName || p.name}</h4>
                      <p className="text-xs text-slate-400">{p.name} &bull; {p.college || 'Institution'}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      {p.submissionStatus === 'ROUND_1_APPROVED' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                          ✓ PPT Approved
                        </span>
                      ) : p.submissionStatus === 'FINALIST' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                          🏆 Grand Finalist
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold">
                          Under Evaluation
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topic Synopsis */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
                    <div className="font-semibold text-white">{p.topicTitle || 'No project title specified'}</div>
                    <div className="text-slate-400 line-clamp-2">{p.submissionNotes || 'No submission synopsis provided.'}</div>
                  </div>

                  {/* Submission Files & Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {hasFile ? (
                      <a
                        href={p.submissionFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Presentation ({p.submissionFileType || 'PPT'})</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No presentation file uploaded yet</span>
                    )}

                    {hasGithub && (
                      <a
                        href={p.submissionGithubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>GitHub / Demo</span>
                      </a>
                    )}
                  </div>

                  {p.submissionFeedback && (
                    <div className="p-2.5 rounded-lg bg-slate-950 text-[11px] text-slate-300 border-l-2 border-cyan-500">
                      <span className="font-mono text-cyan-400 font-bold">Jury Remarks: </span>
                      {p.submissionFeedback}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => openReviewModal(p)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Review / Feedback</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openScoringModal(p)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-300 text-xs font-bold"
                      >
                        Score (/100)
                      </button>

                      <button
                        onClick={() => handleApproveParticipant(p.id, 'PARTICIPATION')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Approve Cert
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PARTICIPANT & TEAM ONBOARDING                    */}
      {/* ======================================================== */}
      {activeTab === 'ONBOARD' && (
        <div className="space-y-6">
          {/* Sub Switcher */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Participant &amp; Team Onboarding Space</h3>
              <p className="text-xs text-slate-400">
                Enroll participants into &ldquo;{eventTitle}&rdquo; via single registration or bulk CSV paste.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOnboardMode('SINGLE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  onboardMode === 'SINGLE' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Single Form
              </button>
              <button
                onClick={() => setOnboardMode('BULK')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  onboardMode === 'BULK' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Bulk CSV Paste
              </button>
            </div>
          </div>

          {/* SINGLE ONBOARDING FORM */}
          {onboardMode === 'SINGLE' && (
            <form onSubmit={handleOnboardSingle} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">Single Member Onboarding</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail ID *</label>
                  <input
                    type="email"
                    required
                    value={onboardEmail}
                    onChange={(e) => setOnboardEmail(e.target.value)}
                    placeholder="anand@college.edu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role in Event *</label>
                  <select
                    value={onboardRole}
                    onChange={(e) => setOnboardRole(e.target.value as UserCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  >
                    <option value="PARTICIPANT">Participant (Contestant)</option>
                    <option value="MENTOR_JURY">Mentor / Jury Evaluator</option>
                    <option value="TECHNICAL_COORDINATOR">Technical Coordinator</option>
                    <option value="EVENT_COORDINATOR">Event Coordinator</option>
                  </select>
                </div>

                {onboardRole === 'PARTICIPANT' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Team Name</label>
                      <input
                        type="text"
                        value={onboardTeamName}
                        onChange={(e) => setOnboardTeamName(e.target.value)}
                        placeholder="e.g. Code Knights"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Project Topic</label>
                      <input
                        type="text"
                        value={onboardTopic}
                        onChange={(e) => setOnboardTopic(e.target.value)}
                        placeholder="e.g. AI Powered Energy Optimization"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={onboardContact}
                    onChange={(e) => setOnboardContact(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">College / Organization</label>
                  <input
                    type="text"
                    value={onboardOrg}
                    onChange={(e) => setOnboardOrg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Specialization / Domain</label>
                  <input
                    type="text"
                    value={onboardSpec}
                    onChange={(e) => setOnboardSpec(e.target.value)}
                    placeholder="AI / Web3 / Cloud"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={onboarding}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow disabled:opacity-50"
                >
                  {onboarding ? 'Onboarding...' : 'Onboard Member to Event'}
                </button>
              </div>
            </form>
          )}

          {/* BULK CSV ONBOARDING FORM */}
          {onboardMode === 'BULK' && (
            <form onSubmit={handleOnboardBulk} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div>
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase">Bulk Participant CSV Onboarding</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Paste multi-line participant data. Format per line: <code className="text-cyan-300">Name, Email, Contact, TeamName, ProjectTopic</code>
                </p>
              </div>

              <textarea
                rows={6}
                required
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                placeholder={`Rohan Verma, rohan@test.com, +91 9876543210, Alpha Coders, Autonomous Robotics\nPooja Sharma, pooja@test.com, +91 9123456780, Cyber Shields, Quantum Cryptography`}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none focus:border-emerald-400"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={onboarding}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs shadow-lg disabled:opacity-50"
                >
                  {onboarding ? 'Processing Bulk Import...' : 'Import & Onboard All Participants'}
                </button>
              </div>
            </form>
          )}

          {/* ENROLLED ROSTER TABLE */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white">
                Enrolled Participants &amp; Team Roster ({allParticipants.length} Participants, {allTeamStaff.length} Evaluators)
              </span>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search participants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Participant / Member</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Team Name</th>
                    <th className="p-3.5">Topic / Responsibility</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredParticipants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[11px] text-slate-400">{p.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-300">{p.teamName || 'Individual'}</td>
                      <td className="p-3.5 max-w-xs truncate text-slate-400">{p.topicTitle || 'N/A'}</td>
                      <td className="p-3.5 font-mono text-slate-400">{p.contact || 'N/A'}</td>
                      <td className="p-3.5 text-right font-mono">
                        {p.certificateStatus === 'APPROVED' ? (
                          <span className="text-emerald-400 font-bold">{p.certificateId}</span>
                        ) : (
                          <button
                            onClick={() => handleApproveParticipant(p.id, 'PARTICIPATION')}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold border border-slate-700"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CERTIFICATE STUDIO & DESIGNER                     */}
      {/* ======================================================== */}
      {activeTab === 'CERTIFICATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Event Certificate Studio</span>
            </h3>

            {/* Orientation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Certificate Layout Orientation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    orientation === 'landscape'
                      ? 'bg-purple-600/30 border-purple-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Landscape (Horizontal)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    orientation === 'portrait'
                      ? 'bg-purple-600/30 border-purple-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Portrait (Vertical)
                </button>
              </div>
            </div>

            {/* Background Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Background Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['classic', 'gold', 'dark', 'white'] as const).map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBgStyle(bg)}
                    className={`p-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                      bgStyle === bg
                        ? 'bg-purple-600/30 border-purple-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {bg} Theme
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Certificate Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-purple-400"
              />
            </div>

            {/* Host Signatory */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized Signatory Name
              </label>
              <input
                type="text"
                value={hostSignatory}
                onChange={(e) => setHostSignatory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-purple-400"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveTemplate}
              disabled={savingTemplate}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-lg disabled:opacity-50"
            >
              {savingTemplate ? 'Saving Template...' : 'Save Certificate Template'}
            </button>
          </div>

          {/* Live Preview Canvas */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-xs font-mono text-slate-400 mb-3 uppercase font-bold">
              Interactive Certificate Canvas Preview
            </span>
            <div className="w-full flex justify-center overflow-x-auto">
              <CertificateCanvas
                participantName="Pooja Sharma"
                teamName="Cyber Shields"
                certificateId="AVX-PREVIEW-2026"
                topicTitle="Quantum Cryptography in Edge Networks"
                college={hostUser.college || 'Technology Institute'}
                category="PARTICIPANT"
                awardLevel="WINNER_1ST"
                awardOrientation={orientation}
                runnerTheme="white"
                presentedOn={eventTitle}
                template={templateConfig}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: EVENT SPACE SETUP                                 */}
      {/* ======================================================== */}
      {activeTab === 'EVENT_INFO' && (
        <form onSubmit={handleSaveEventInfo} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Event Space Configuration &amp; Rounds Setup</h3>
            <p className="text-xs text-slate-400">
              Customize event scope, dates, prize pools, and presentation rules for participants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Event / Hackathon Name *</label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rounds Workflow</label>
              <input
                type="text"
                value={eventRounds}
                onChange={(e) => setEventRounds(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Event Timeline / Dates</label>
              <input
                type="text"
                value={eventDates}
                onChange={(e) => setEventDates(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Winning Prizes</label>
              <input
                type="text"
                value={eventPrizes}
                onChange={(e) => setEventPrizes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Image URL</label>
              <input
                type="text"
                value={eventBannerUrl}
                onChange={(e) => setEventBannerUrl(e.target.value)}
                placeholder="https://aveeranex.com/banners/hackathon.png"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Event Description &amp; Rules</label>
              <textarea
                rows={4}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingEvent}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-lg disabled:opacity-50"
            >
              {savingEvent ? 'Saving Event Space...' : 'Save Event Space Configuration'}
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: SCORING & EVALUATION MODAL                      */}
      {/* ======================================================== */}
      {scoringUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Evaluate &amp; Score Team</span>
                </h3>
                <p className="text-xs text-slate-400">{scoringUser.teamName || scoringUser.name} &bull; {scoringUser.topicTitle}</p>
              </div>
              <button onClick={() => setScoringUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>💡 Innovation &amp; Creativity:</span>
                  <span className="font-mono text-cyan-300">{scoreInnovation} / 25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scoreInnovation}
                  onChange={(e) => setScoreInnovation(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>⚙️ Technical Feasibility &amp; Prototype:</span>
                  <span className="font-mono text-cyan-300">{scoreTechnical} / 25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scoreTechnical}
                  onChange={(e) => setScoreTechnical(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>📊 Presentation &amp; PPT Quality:</span>
                  <span className="font-mono text-cyan-300">{scorePresentation} / 25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scorePresentation}
                  onChange={(e) => setScorePresentation(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>🌍 Impact &amp; Practical Viability:</span>
                  <span className="font-mono text-cyan-300">{scoreImpact} / 25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scoreImpact}
                  onChange={(e) => setScoreImpact(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="font-bold text-white text-sm">Total Evaluated Score:</span>
                <span className="text-base font-black font-mono text-amber-400">
                  {Number(scoreInnovation) + Number(scoreTechnical) + Number(scorePresentation) + Number(scoreImpact)} / 100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Assign Leaderboard Rank</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={customRank}
                    onChange={(e) => setCustomRank(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isFinalistCheck}
                      onChange={(e) => setIsFinalistCheck(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span className="font-bold text-[11px]">Mark as Grand Finalist</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setScoringUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScore}
                disabled={savingScore}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold text-xs shadow disabled:opacity-50"
              >
                {savingScore ? 'Saving Score...' : 'Save Evaluation & Update Leaderboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: REVIEW & REMARKS MODAL                          */}
      {/* ======================================================== */}
      {reviewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Review Submission &amp; Advance Round</span>
                </h3>
                <p className="text-xs text-slate-400">{reviewUser.teamName || reviewUser.name}</p>
              </div>
              <button onClick={() => setReviewUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Advance / Target Round</label>
                <select
                  value={reviewRound}
                  onChange={(e) => setReviewRound(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                >
                  <option value="Round 1: Abstract &amp; PPT">Round 1: Abstract &amp; PPT</option>
                  <option value="Round 2: Prototype &amp; Code">Round 2: Working Prototype &amp; Code</option>
                  <option value="Round 3: Grand Finale Pitch">Round 3: Grand Finale Pitch</option>
                  <option value="Winner / Finished">Winner / Finished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Evaluation Decision</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                >
                  <option value="ROUND_1_APPROVED">✓ Approve PPT &amp; Advance to Round 2</option>
                  <option value="ROUND_2_APPROVED">✓ Approve Prototype &amp; Advance</option>
                  <option value="FINALIST">🏆 Promote to Grand Finalist</option>
                  <option value="NEEDS_REVISION">⚠️ Request Resubmission / Changes</option>
                  <option value="REJECTED">❌ Disqualify / Reject</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reviewer Remarks &amp; Feedback</label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Enter constructive remarks for the participant team..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setReviewUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                disabled={savingReview}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs shadow disabled:opacity-50"
              >
                {savingReview ? 'Saving Decision...' : 'Save Decision & Notify Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
