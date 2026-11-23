'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  Eye,
  Check,
  X,
  RefreshCw,
  Award,
  Sparkles,
  ExternalLink,
  Lock,
  Mail,
  AlertCircle,
  School,
  FileText,
  UserCheck,
  Briefcase,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  Trophy,
  Medal,
  ChevronDown,
} from 'lucide-react';
import { PublicParticipantInfo, AwardLevel } from '@/lib/types';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<PublicParticipantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<PublicParticipantInfo[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    participants: 0,
    mentors: 0,
    techCoordinators: 0,
    eventCoordinators: 0,
    admins: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    notRequested: 0,
    isPostgres: false,
  });

  // Active Category Tab: 'PARTICIPANTS' | 'MENTORS' | 'TECH_COORDINATORS' | 'EVENT_COORDINATORS' | 'ADMINS'
  const [activeTab, setActiveTab] = useState<'PARTICIPANTS' | 'MENTORS' | 'TECH_COORDINATORS' | 'EVENT_COORDINATORS' | 'ADMINS'>('PARTICIPANTS');

  const [syncingSheets, setSyncingSheets] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<PublicParticipantInfo | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Award modal / dropdown state
  const [awardModalUser, setAwardModalUser] = useState<PublicParticipantInfo | null>(null);
  const [selectedAwardLevel, setSelectedAwardLevel] = useState<AwardLevel>('PARTICIPATION');
  const [includeParticipationToo, setIncludeParticipationToo] = useState(true);
  const [awardOrientation, setAwardOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [runnerTheme, setRunnerTheme] = useState<'white' | 'black'>('white');

  // Rejection modal
  const [rejectModalUser, setRejectModalUser] = useState<PublicParticipantInfo | null>(null);
  const [rejectReason, setRejectReason] = useState('Project submission details did not meet evaluation criteria.');

  // Admin login states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/participants');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.participants || []);
        if (data.stats) setStats(data.stats);
        if (data.caller) setCurrentUser(data.caller);
      } else if (res.status === 403 || res.status === 401) {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user && (data.user.role === 'admin' || data.user.role === 'super_admin')) {
          setCurrentUser(data.user);
          await fetchUsers();
          return;
        }
      }
      setCurrentUser(null);
      setLoading(false);
    } catch (e) {
      setCurrentUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.email?.toLowerCase() === 'info@aveeranex.com';
  const canApprove = isSuperAdmin || (currentUser?.role === 'admin' && Boolean(currentUser?.canApproveCertificates));

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate as Admin.');
      }

      if (data.user.role !== 'admin' && data.user.role !== 'super_admin') {
        throw new Error('This account does not have Admin or Super Admin privileges.');
      }

      setCurrentUser(data.user);
      await fetchUsers();
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleApproveWithLevel = async (
    userId: string,
    level: AwardLevel,
    alsoParticipation = true,
    orientation: 'landscape' | 'portrait' = 'landscape',
    rTheme: 'white' | 'black' = 'white'
  ) => {
    setActionInProgress(userId);
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          awardLevel: level,
          includeParticipationToo: alsoParticipation,
          awardOrientation: orientation,
          runnerTheme: rTheme,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
        });
        setAwardModalUser(null);
        await fetchUsers();
      } else {
        alert(data.error || 'Failed to approve certificate.');
      }
    } catch (e) {
      console.error(e);
      alert('Error approving certificate.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionInProgress(userId);
    try {
      const res = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason: rejectReason }),
      });
      if (res.ok) {
        setRejectModalUser(null);
        await fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reject certificate request.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleAdminRights = async (adminId: string, currentRights: boolean) => {
    setActionInProgress(adminId);
    try {
      const res = await fetch('/api/admin/toggle-admin-rights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, canApproveCertificates: !currentRights }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchUsers();
      } else {
        alert(data.error || 'Failed to update admin rights.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApproveEvent = async (userId: string, currentEventApproved: boolean) => {
    setActionInProgress(userId);
    try {
      const res = await fetch('/api/admin/approve-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, eventApproved: !currentEventApproved }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchUsers();
      } else {
        alert(data.error || 'Failed to update event approval.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBulkApprovePending = async () => {
    const pendingParticipants = filteredList.filter((p) => p.certificateStatus === 'PENDING_APPROVAL');
    if (pendingParticipants.length === 0) {
      alert('No pending requests to approve in current view.');
      return;
    }

    if (!confirm(`Are you sure you want to approve certificates for all ${pendingParticipants.length} pending entries?`)) {
      return;
    }

    setLoading(true);
    for (const u of pendingParticipants) {
      await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id, awardLevel: u.awardLevel || 'PARTICIPATION' }),
      });
    }

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.4 },
    });
    await fetchUsers();
  };

  const handleSyncToGoogleSheets = async () => {
    setSyncingSheets(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/admin/sync-sheets', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(data.message || `Successfully synced participants to Google Sheets!`);
        setTimeout(() => setSyncMessage(null), 6000);
      } else {
        alert(data.error || 'Failed to sync to Google Sheets');
      }
    } catch (e) {
      console.error(e);
      alert('Error triggering Google Sheets sync.');
    } finally {
      setSyncingSheets(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      alert('No records to export in current category view.');
      return;
    }

    const headers = [
      'Category',
      'Name',
      'Team Name',
      'Email',
      'Contact',
      'College/Organization',
      'Location',
      'Role/Designation',
      'Topic/Event',
      'Status',
      'Award Level',
      'Certificate ID',
      'Submission File',
      'Approved Date',
      'Registered Date',
    ];

    const rows = filteredList.map((p) => [
      `"${p.category || 'PARTICIPANT'}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.teamName || '').replace(/"/g, '""')}"`,
      `"${(p.email || '').replace(/"/g, '""')}"`,
      `"${(p.contact || '').replace(/"/g, '""')}"`,
      `"${(p.college || p.organization || '').replace(/"/g, '""')}"`,
      `"${(p.location || '').replace(/"/g, '""')}"`,
      `"${(p.designation || p.technicalResponsibility || p.committeeRole || '').replace(/"/g, '""')}"`,
      `"${(p.topicTitle || p.assignedEvent || '').replace(/"/g, '""')}"`,
      `"${(p.certificateStatus || '').replace(/"/g, '""')}"`,
      `"${(p.awardLevel || 'PARTICIPATION').replace(/"/g, '""')}"`,
      `"${(p.certificateId || '').replace(/"/g, '""')}"`,
      `"${(p.submissionFileName || '').replace(/"/g, '""')}"`,
      `"${(p.certificateApprovedAt || '').replace(/"/g, '""')}"`,
      `"${(p.createdAt || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aveeranex_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Filter list by category & search & status
  const filteredList = allUsers.filter((u) => {
    const category = u.category || 'PARTICIPANT';

    let matchCategory = false;
    if (activeTab === 'PARTICIPANTS') matchCategory = category === 'PARTICIPANT';
    else if (activeTab === 'MENTORS') matchCategory = category === 'MENTOR_JURY';
    else if (activeTab === 'TECH_COORDINATORS') matchCategory = category === 'TECHNICAL_COORDINATOR';
    else if (activeTab === 'EVENT_COORDINATORS') matchCategory = category === 'EVENT_COORDINATOR';
    else if (activeTab === 'ADMINS') matchCategory = category === 'ADMIN' || u.role === 'admin';

    if (!matchCategory) return false;

    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.teamName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.college || u.organization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.topicTitle || u.assignedEvent || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.certificateId && u.certificateId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ? true : u.certificateStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // If not logged in as Admin / Super Admin, render Login Form
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-aveeranex-card/90 border border-aveeranex-cyan/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-aveeranex-cyan flex items-center justify-center mx-auto text-white shadow-lg shadow-cyan-950 mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Admin & Host Console</h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized access for Super Admin (Dr. Rajesh Kumar) & Designated Event Hosts
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@aveeranex.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-aveeranex-cyan"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-aveeranex-cyan"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-aveeranex-teal via-cyan-600 to-aveeranex-cyan hover:brightness-110 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-cyan-950 transition-all disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Admin Console'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header Card */}
      <div className="bg-aveeranex-card/80 border border-aveeranex-border/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isSuperAdmin ? 'SUPER ADMIN CENTRAL COMMAND' : 'EVENT HOST ADMIN CONSOLE'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hackathon Governance & Certification Portal
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400">
              Signed in as <span className="text-white font-semibold">{currentUser.name}</span> ({currentUser.email})
            </span>
            <span className="text-slate-600">&bull;</span>
            {canApprove ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Certificate Approval Rights Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Host Admin (Awaiting Super Admin Approval Rights)
              </span>
            )}
            <span className="text-slate-600">&bull;</span>
            {stats.isPostgres ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                Postgres Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/50 text-amber-300">
                Memory Mode
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isSuperAdmin && (
            <button
              onClick={handleSyncToGoogleSheets}
              disabled={syncingSheets}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all disabled:opacity-50"
              title="Sync all participants to Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingSheets ? 'animate-spin' : ''}`} />
              <span>{syncingSheets ? 'Syncing...' : 'Sync to Sheets'}</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            title="Export current tab as CSV"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV ({filteredList.length})</span>
          </button>

          {canApprove && (
            <button
              onClick={handleBulkApprovePending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Bulk Approve ({stats.pending})</span>
            </button>
          )}
        </div>
      </div>

      {/* Super Admin Quick Stakeholder Dashboard Previews */}
      {isSuperAdmin && (
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Preview Stakeholder Dashboards &amp; Certificates:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard?preview=MENTOR_JURY"
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
            >
              Mentor / Jury View
            </Link>
            <Link
              href="/dashboard?preview=TECHNICAL_COORDINATOR"
              className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-all"
            >
              Tech Coordinator View
            </Link>
            <Link
              href="/dashboard?preview=EVENT_COORDINATOR"
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
            >
              Event Coordinator View
            </Link>
            <Link
              href="/dashboard?preview=ADMIN"
              className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all"
            >
              Host Admin View
            </Link>
            <Link
              href="/dashboard?preview=PARTICIPANT&award=WINNER_1ST"
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
            >
              1st Winner View
            </Link>
          </div>
        </div>
      )}

      {syncMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => { setActiveTab('PARTICIPANTS'); setStatusFilter('ALL'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PARTICIPANTS'
              ? 'bg-gradient-to-r from-cyan-600 to-aveeranex-cyan text-slate-950 shadow-lg shadow-cyan-950'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Participants ({allUsers.filter((u) => (u.category || 'PARTICIPANT') === 'PARTICIPANT').length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('MENTORS'); setStatusFilter('ALL'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MENTORS'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-950'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Mentors & Jury ({allUsers.filter((u) => u.category === 'MENTOR_JURY').length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('TECH_COORDINATORS'); setStatusFilter('ALL'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TECH_COORDINATORS'
              ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-blue-950'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4 text-sky-400" />
          <span>Technical Coordinators ({allUsers.filter((u) => u.category === 'TECHNICAL_COORDINATOR').length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('EVENT_COORDINATORS'); setStatusFilter('ALL'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'EVENT_COORDINATORS'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-950'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <School className="w-4 h-4 text-emerald-400" />
          <span>Event Coordinators ({allUsers.filter((u) => u.category === 'EVENT_COORDINATOR').length})</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => { setActiveTab('ADMINS'); setStatusFilter('ALL'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ADMINS'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-950'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Host Admins Management ({allUsers.filter((u) => u.category === 'ADMIN' || u.role === 'admin').length})</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-aveeranex-card/50 border border-aveeranex-border/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, college, topic, cert ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 outline-none focus:border-aveeranex-cyan"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'NOT_REQUESTED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-aveeranex-cyan text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st === 'ALL'
                ? 'All Statuses'
                : st === 'PENDING_APPROVAL'
                ? 'Pending'
                : st === 'APPROVED'
                ? 'Approved'
                : st === 'NOT_REQUESTED'
                ? 'Not Requested'
                : 'Rejected'}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN DATA TABLE FOR CURRENT CATEGORY */}
      <div className="bg-aveeranex-card/60 border border-aveeranex-border/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-aveeranex-border/60">
              <tr>
                <th className="px-6 py-4">
                  {activeTab === 'ADMINS'
                    ? 'Admin Name & Contact'
                    : activeTab === 'MENTORS'
                    ? 'Mentor / Jury & Contact'
                    : activeTab === 'TECH_COORDINATORS' || activeTab === 'EVENT_COORDINATORS'
                    ? 'Coordinator & Contact'
                    : 'Participant & Team'}
                </th>
                <th className="px-6 py-4">
                  {activeTab === 'ADMINS'
                    ? 'Organization & Designation'
                    : activeTab === 'MENTORS'
                    ? 'Organization & Specialization'
                    : activeTab === 'TECH_COORDINATORS'
                    ? 'Institution & Tech Domain'
                    : activeTab === 'EVENT_COORDINATORS'
                    ? 'Institution & Committee Role'
                    : 'Topic Title & Domain'}
                </th>
                <th className="px-6 py-4">
                  {activeTab === 'PARTICIPANTS' ? 'Project Submission' : 'Assigned Event'}
                </th>
                <th className="px-6 py-4">
                  {activeTab === 'ADMINS' ? 'Approval Authority' : 'Certificate Status & Award'}
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No records found matching your filters in {activeTab}.
                  </td>
                </tr>
              ) : (
                filteredList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/60 transition-colors">
                    {/* Column 1: Identity */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{user.name}</div>
                      {user.teamName && (
                        <div className="text-aveeranex-cyan font-medium text-xs">Team: {user.teamName}</div>
                      )}
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                        {user.email} &bull; {user.contact || 'No contact'}
                      </div>
                    </td>

                    {/* Column 2: Role / Professional details */}
                    <td className="px-6 py-4 max-w-xs">
                      {activeTab === 'PARTICIPANTS' ? (
                        <>
                          <div className="font-semibold text-slate-200 line-clamp-1">{user.topicTitle || 'No topic'}</div>
                          <div className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] mt-1">
                            {user.topicDomain || 'General'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{user.college}</div>
                        </>
                      ) : activeTab === 'MENTORS' ? (
                        <>
                          <div className="font-semibold text-amber-300">{user.designation || 'Judge / Mentor'}</div>
                          <div className="text-slate-300 text-xs">{user.organization || 'Industry Specialist'}</div>
                          {user.specialization && (
                            <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                              Domain: {user.specialization}
                            </div>
                          )}
                        </>
                      ) : activeTab === 'TECH_COORDINATORS' ? (
                        <>
                          <div className="font-semibold text-sky-300">{user.technicalResponsibility || 'Technical Operations'}</div>
                          <div className="text-slate-300 text-xs">{user.college || user.organization}</div>
                          {user.topicDomain && (
                            <div className="text-[10px] text-sky-400 font-mono mt-0.5">
                              Dept: {user.topicDomain}
                            </div>
                          )}
                        </>
                      ) : activeTab === 'EVENT_COORDINATORS' ? (
                        <>
                          <div className="font-semibold text-emerald-300">{user.committeeRole || user.designation || 'Organizing Committee'}</div>
                          <div className="text-slate-300 text-xs">{user.college || user.organization}</div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-purple-300">{user.designation || 'Event Host Administrator'}</div>
                          <div className="text-slate-300 text-xs">{user.organization || user.college || 'Host Institution'}</div>
                        </>
                      )}
                    </td>

                    {/* Column 3: Submission / Assigned Event */}
                    <td className="px-6 py-4">
                      {activeTab === 'PARTICIPANTS' ? (
                        user.submissionFileName ? (
                          <div className="space-y-1">
                            <a
                              href={user.submissionFileUrl || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:text-white text-[11px] font-semibold"
                            >
                              <FileText className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="max-w-[130px] truncate">{user.submissionFileName}</span>
                              <span className="text-[10px] text-slate-400">({user.submissionFileSize})</span>
                            </a>
                            {user.submissionGithubUrl && (
                              <div>
                                <a
                                  href={user.submissionGithubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                                >
                                  <span>Repository / Demo</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">No file submitted yet</span>
                        )
                      ) : (
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-slate-200">
                            {user.assignedEvent || 'Aveeranex Innovate'}
                          </div>
                          {(activeTab === 'ADMINS' || activeTab === 'EVENT_COORDINATORS') && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {user.eventApproved ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                                  Event Live
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[10px] border border-amber-500/30">
                                  Event Pending Approval
                                </span>
                              )}
                              {user.eventRounds && (
                                <span className="text-[10px] text-slate-400">
                                  &bull; {user.eventRounds}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Column 4: Status / Rights */}
                    <td className="px-6 py-4">
                      {activeTab === 'ADMINS' ? (
                        user.canApproveCertificates ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved to Issue Certificates
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[11px]">
                            <Clock className="w-3 h-3" />
                            Hosting Only (No Certificate Rights)
                          </span>
                        )
                      ) : (
                        <div>
                          {user.certificateStatus === 'APPROVED' && (
                            <div>
                              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                Approved
                              </div>
                              {/* Award Level Tag */}
                              {user.awardLevel && user.awardLevel !== 'PARTICIPATION' && (
                                <div className="mt-1">
                                  {user.awardLevel === 'WINNER_1ST' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold text-[10px] border border-yellow-500/40">
                                      🥇 1st Prize Winner
                                    </span>
                                  )}
                                  {user.awardLevel === 'WINNER_2ND' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-400/20 text-slate-200 font-bold text-[10px] border border-slate-400/40">
                                      🥈 2nd Prize Winner
                                    </span>
                                  )}
                                  {user.awardLevel === 'WINNER_3RD' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-700/20 text-amber-300 font-bold text-[10px] border border-amber-700/40">
                                      🥉 3rd Prize Winner
                                    </span>
                                  )}
                                  {user.awardLevel === 'RUNNER_4TH' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/40">
                                      🏅 4th Level Runner-Up
                                    </span>
                                  )}
                                  {user.awardLevel === 'RUNNER_5TH' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-300 font-bold text-[10px] border border-emerald-600/40">
                                      🎖️ 5th Level Runner-Up
                                    </span>
                                  )}
                                </div>
                              )}
                              {user.certificateId && (
                                <div className="text-[10px] font-mono text-cyan-300 mt-0.5">
                                  {user.certificateId}
                                </div>
                              )}
                            </div>
                          )}

                          {user.certificateStatus === 'PENDING_APPROVAL' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[11px] animate-pulse">
                              <Clock className="w-3 h-3" />
                              Pending Approval
                            </span>
                          )}

                          {user.certificateStatus === 'NOT_REQUESTED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold text-[11px]">
                              Not Requested
                            </span>
                          )}

                          {user.certificateStatus === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-[11px]">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Column 5: Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Admin rights toggle & Event approval for Super Admin */}
                        {activeTab === 'ADMINS' && isSuperAdmin && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveEvent(user.id, Boolean(user.eventApproved))}
                              disabled={actionInProgress === user.id}
                              className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                                user.eventApproved
                                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow'
                              }`}
                            >
                              {user.eventApproved ? 'Unpublish Event' : 'Approve Event'}
                            </button>
                            <button
                              onClick={() => handleToggleAdminRights(user.id, Boolean(user.canApproveCertificates))}
                              disabled={actionInProgress === user.id}
                              className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all ${
                                user.canApproveCertificates
                                  ? 'bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950'
                              }`}
                            >
                              {user.canApproveCertificates ? (
                                <>
                                  <ToggleRight className="w-4 h-4" />
                                  <span>Revoke Rights</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4" />
                                  <span>Grant Rights</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {activeTab === 'EVENT_COORDINATORS' && isSuperAdmin && (
                          <button
                            onClick={() => handleApproveEvent(user.id, Boolean(user.eventApproved))}
                            disabled={actionInProgress === user.id}
                            className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                              user.eventApproved
                                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow'
                            }`}
                          >
                            {user.eventApproved ? 'Unpublish Event' : 'Approve Event'}
                          </button>
                        )}

                        {/* Approvals for non-admin categories */}
                        {activeTab !== 'ADMINS' && canApprove && (
                          <>
                            {activeTab === 'PARTICIPANTS' ? (
                              <button
                                onClick={() => {
                                  setAwardModalUser(user);
                                  setSelectedAwardLevel(user.awardLevel || 'PARTICIPATION');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-950 transition-all"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>{user.certificateStatus === 'APPROVED' ? 'Change Award' : 'Award & Approve'}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApproveWithLevel(user.id, 'PARTICIPATION')}
                                disabled={actionInProgress === user.id}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-950 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{user.certificateStatus === 'APPROVED' ? 'Re-Issue' : 'Approve Certificate'}</span>
                              </button>
                            )}

                            {user.certificateStatus === 'PENDING_APPROVAL' && (
                              <button
                                onClick={() => setRejectModalUser(user)}
                                disabled={actionInProgress === user.id}
                                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}

                        {user.certificateStatus === 'APPROVED' && user.certificateId && (
                          <Link
                            href={`/verify/${user.certificateId}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 hover:text-cyan-100 transition-colors"
                            title="Verify Public Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AWARD & APPROVAL MODAL FOR PARTICIPANTS */}
      {awardModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-aveeranex-card border border-aveeranex-cyan/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setAwardModalUser(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Award & Certificate Issuance</h3>
                  <p className="text-xs text-slate-400">{awardModalUser.name} &bull; Team: {awardModalUser.teamName}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Award Level / Certificate Category
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'PARTICIPATION', label: 'Certificate of Participation', badge: 'Standard Teal', color: 'border-cyan-500/40 bg-cyan-950/30' },
                    { id: 'WINNER_1ST', label: '1st Prize - Grand Winner', badge: '🥇 Radiant Gold Foil', color: 'border-yellow-500/50 bg-yellow-950/30' },
                    { id: 'WINNER_2ND', label: '2nd Prize - 1st Runner-Up', badge: '🥈 Platinum Silver', color: 'border-slate-400/50 bg-slate-800/40' },
                    { id: 'WINNER_3RD', label: '3rd Prize - 2nd Runner-Up', badge: '🥉 Bronze / Amber', color: 'border-amber-700/50 bg-amber-950/30' },
                    { id: 'RUNNER_4TH', label: '4th Level Runner-Up', badge: '🏅 Cobalt Sapphire', color: 'border-blue-500/50 bg-blue-950/30' },
                    { id: 'RUNNER_5TH', label: '5th Level Runner-Up', badge: '🎖️ Forest Emerald', color: 'border-emerald-500/50 bg-emerald-950/30' },
                  ].map((tier) => (
                    <label
                      key={tier.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedAwardLevel === tier.id
                          ? `${tier.color} ring-2 ring-aveeranex-cyan`
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="awardLevel"
                          value={tier.id}
                          checked={selectedAwardLevel === tier.id}
                          onChange={() => setSelectedAwardLevel(tier.id as AwardLevel)}
                          className="text-aveeranex-cyan focus:ring-aveeranex-cyan"
                        />
                        <span className="text-sm font-bold text-white">{tier.label}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-300">{tier.badge}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedAwardLevel !== 'PARTICIPATION' && (
                <div className="space-y-3 pt-1">
                  {/* Landscape vs Vertical Orientation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Certificate Layout Orientation
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAwardOrientation('landscape')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          awardOrientation === 'landscape'
                            ? 'bg-aveeranex-cyan border-cyan-400 text-slate-950'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        Landscape (Horizontal)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAwardOrientation('portrait')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          awardOrientation === 'portrait'
                            ? 'bg-aveeranex-cyan border-cyan-400 text-slate-950'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        Vertical (Portrait)
                      </button>
                    </div>
                  </div>

                  {/* 4th & 5th Runner Theme Option (Complete White vs Complete Black) */}
                  {(selectedAwardLevel === 'RUNNER_4TH' || selectedAwardLevel === 'RUNNER_5TH') && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Runner Certificate Theme (4th / 5th Level)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRunnerTheme('white')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            runnerTheme === 'white'
                              ? 'bg-white border-cyan-400 text-slate-950'
                              : 'bg-slate-900 border-slate-700 text-slate-300'
                          }`}
                        >
                          Pure White (Black Font)
                        </button>
                        <button
                          type="button"
                          onClick={() => setRunnerTheme('black')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            runnerTheme === 'black'
                              ? 'bg-black border-cyan-400 text-white'
                              : 'bg-slate-900 border-slate-700 text-slate-300'
                          }`}
                        >
                          Pure Black (White Font)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dual Certificate Option */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeParticipationToo}
                      onChange={(e) => setIncludeParticipationToo(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-emerald-300">
                      Also issue Certificate of Participation (Approve Both Appreciation + Participation)
                    </span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setAwardModalUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleApproveWithLevel(
                      awardModalUser.id,
                      selectedAwardLevel,
                      includeParticipationToo,
                      awardOrientation,
                      runnerTheme
                    )
                  }
                  disabled={actionInProgress === awardModalUser.id}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-aveeranex-cyan hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
                >
                  {actionInProgress === awardModalUser.id ? 'Generating...' : 'Approve & Issue Certificate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-aveeranex-card border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Reject Certificate Request</h3>
            <p className="text-xs text-slate-400 mb-4">
              Specify the reason for rejecting {rejectModalUser.name}:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-rose-500 mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectModalUser.id)}
                disabled={actionInProgress === rejectModalUser.id}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS VIEW MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-aveeranex-card border border-aveeranex-cyan/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-mono font-bold">
                  CATEGORY: {selectedUser.category || 'PARTICIPANT'}
                </span>
                <h3 className="text-2xl font-black text-white mt-2">{selectedUser.name}</h3>
                {selectedUser.teamName && (
                  <p className="text-sm font-semibold text-aveeranex-cyan">Team: {selectedUser.teamName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-mono">Email Address</span>
                  <div className="text-white font-semibold">{selectedUser.email}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-mono">Contact Phone</span>
                  <div className="text-white font-semibold">{selectedUser.contact || 'N/A'}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-mono">College / Organization</span>
                  <div className="text-white font-semibold">{selectedUser.college || selectedUser.organization || 'N/A'}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-mono">Designation / Role</span>
                  <div className="text-white font-semibold">{selectedUser.designation || selectedUser.technicalResponsibility || selectedUser.committeeRole || 'Participant'}</div>
                </div>
              </div>

              {/* Hosted Event Proposal Details Box */}
              {(selectedUser.category === 'ADMIN' || selectedUser.category === 'EVENT_COORDINATOR') && selectedUser.assignedEvent && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 uppercase tracking-wider font-mono">
                      Hosted Event Proposal
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${selectedUser.eventApproved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {selectedUser.eventApproved ? 'APPROVED & LIVE' : 'PENDING SUPER ADMIN APPROVAL'}
                    </span>
                  </div>
                  <div className="text-base font-bold text-white">{selectedUser.assignedEvent}</div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400">Rounds:</span>
                      <div className="text-slate-200 font-semibold">{selectedUser.eventRounds || 'Not specified yet'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Dates:</span>
                      <div className="text-slate-200 font-semibold">{selectedUser.eventDates || 'Not specified yet'}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Winning Prizes:</span>
                      <div className="text-amber-300 font-semibold">{selectedUser.eventPrizes || 'Not specified yet'}</div>
                    </div>
                    {selectedUser.eventDescription && (
                      <div className="col-span-2">
                        <span className="text-slate-400">Description:</span>
                        <p className="text-slate-200 mt-0.5 leading-relaxed">{selectedUser.eventDescription}</p>
                      </div>
                    )}
                    {selectedUser.eventBannerUrl && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block mb-1">Sample Banner (1200 &times; 630 px):</span>
                        <a href={selectedUser.eventBannerUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline">
                          View Uploaded Banner
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Submission Box */}
              {selectedUser.submissionFileName && (
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                      Project Submission File
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{selectedUser.submissionFileSize}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-white font-bold text-sm">{selectedUser.submissionFileName}</div>
                      <div className="text-xs text-slate-400">Type: {selectedUser.submissionFileType || 'DOCUMENT'}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href={selectedUser.submissionFileUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download / View Evaluation File</span>
                    </a>
                    {selectedUser.submissionGithubUrl && (
                      <a
                        href={selectedUser.submissionGithubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs border border-slate-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open GitHub / Demo</span>
                      </a>
                    )}
                  </div>
                  {selectedUser.submissionNotes && (
                    <div className="pt-2 border-t border-cyan-900/60">
                      <span className="text-[11px] text-slate-400 font-mono">Synopsis / Notes:</span>
                      <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{selectedUser.submissionNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
