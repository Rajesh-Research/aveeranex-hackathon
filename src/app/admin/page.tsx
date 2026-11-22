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
  Filter,
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
  MapPin,
  Calendar,
} from 'lucide-react';
import { PublicParticipantInfo } from '@/lib/types';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<PublicParticipantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<PublicParticipantInfo[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    notRequested: 0,
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedParticipant, setSelectedParticipant] = useState<PublicParticipantInfo | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [rejectModalUser, setRejectModalUser] = useState<PublicParticipantInfo | null>(null);
  const [rejectReason, setRejectReason] = useState('Presentation details did not meet hackathon criteria.');

  // Admin login form states (if not logged in as admin)
  const [adminEmail, setAdminEmail] = useState('admin@aveeranex.com');
  const [adminPassword, setAdminPassword] = useState('Admin@Aveeranex2026!');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/participants');
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants);
        setStats(data.stats);
      } else if (res.status === 403 || res.status === 401) {
        // Not super admin
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
        if (data.user && data.user.role === 'admin') {
          setCurrentUser(data.user);
          await fetchParticipants();
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
        throw new Error(data.error || 'Failed to authenticate as Super Admin.');
      }

      if (data.user.role !== 'admin') {
        throw new Error('This account does not have Super Admin privileges.');
      }

      setCurrentUser(data.user);
      await fetchParticipants();
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionInProgress(userId);
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 },
        });
        await fetchParticipants();
      } else {
        alert(data.error || 'Failed to approve');
      }
    } catch (e) {
      console.error(e);
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
        await fetchParticipants();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBulkApprovePending = async () => {
    const pendingUsers = participants.filter((p) => p.certificateStatus === 'PENDING_APPROVAL');
    if (pendingUsers.length === 0) {
      alert('No pending certificate requests to approve.');
      return;
    }

    if (!confirm(`Are you sure you want to approve certificates for all ${pendingUsers.length} pending participants?`)) {
      return;
    }

    setLoading(true);
    for (const u of pendingUsers) {
      await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id }),
      });
    }

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.4 },
    });
    await fetchParticipants();
  };

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Team Name',
      'Email',
      'Contact',
      'College',
      'Location',
      'State',
      'Topic Title',
      'Topic Domain',
      'Presented On',
      'Status',
      'Certificate ID',
      'Approved Date',
    ];

    const rows = filteredParticipants.map((p) => [
      `"${p.name}"`,
      `"${p.teamName}"`,
      `"${p.email}"`,
      `"${p.contact}"`,
      `"${p.college}"`,
      `"${p.location}"`,
      `"${p.state}"`,
      `"${p.topicTitle.replace(/"/g, '""')}"`,
      `"${p.topicDomain}"`,
      `"${p.presentedOn}"`,
      `"${p.certificateStatus}"`,
      `"${p.certificateId || ''}"`,
      `"${p.certificateApprovedAt || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aveeranex_Hackathon_Participants_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.certificateId && p.certificateId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ? true : p.certificateStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // If not logged in as Super Admin, show Super Admin Login Form
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-aveeranex-card/90 border border-aveeranex-cyan/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-aveeranex-cyan flex items-center justify-center mx-auto text-white shadow-lg shadow-cyan-950 mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Super Admin Console</h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized personnel only: Dr. Rajesh Kumar & Aveeranex Leadership
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
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
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
              {loginLoading ? 'Authenticating...' : 'Sign In as Super Admin'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500">
              Default pre-configured credentials loaded for evaluation.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Super Admin Top Header */}
      <div className="bg-aveeranex-card/80 border border-aveeranex-border/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            SUPER ADMIN APPROVAL PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Certificate Authorization Console
          </h1>
          <p className="text-slate-400 text-sm">
            Signed in as <span className="text-white font-semibold">{currentUser.name}</span> ({currentUser.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchParticipants}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleBulkApprovePending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Bulk Approve Pending ({stats.pending})</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-aveeranex-card/50 border border-aveeranex-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono uppercase">Total Registered</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.total}</div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-mono uppercase">Pending Approval</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">{stats.pending}</div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-mono uppercase">Approved & Issued</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">{stats.approved}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono uppercase">Not Requested</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-300 mt-2">{stats.notRequested}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-aveeranex-card/50 border border-aveeranex-border/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search participant, team, topic, college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 outline-none focus:border-aveeranex-cyan"
          />
        </div>

        {/* Status Pill Filters */}
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
                ? 'All'
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

      {/* Participants Table */}
      <div className="bg-aveeranex-card/60 border border-aveeranex-border/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-aveeranex-border/60">
              <tr>
                <th className="px-6 py-4">Participant & Team</th>
                <th className="px-6 py-4">Topic Title & Domain</th>
                <th className="px-6 py-4">College / Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No participants found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                    {/* Participant & Team */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-aveeranex-cyan font-medium">Team: {p.teamName}</div>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">{p.email} • {p.contact}</div>
                    </td>

                    {/* Topic Title & Domain */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-200 line-clamp-1">{p.topicTitle}</div>
                      <div className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] mt-1">
                        {p.topicDomain}
                      </div>
                      <div className="text-[10px] text-emerald-400/90 mt-0.5 font-mono">{p.presentedOn}</div>
                    </td>

                    {/* College & Location */}
                    <td className="px-6 py-4">
                      <div className="text-slate-200 font-medium line-clamp-1">{p.college}</div>
                      <div className="text-slate-400 text-[11px]">
                        {p.location}, {p.state} ({p.country})
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {p.certificateStatus === 'APPROVED' && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                          {p.certificateId && (
                            <div className="text-[10px] font-mono text-cyan-300 mt-1">
                              {p.certificateId}
                            </div>
                          )}
                        </div>
                      )}

                      {p.certificateStatus === 'PENDING_APPROVAL' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[11px] animate-pulse">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}

                      {p.certificateStatus === 'NOT_REQUESTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold text-[11px]">
                          Not Requested
                        </span>
                      )}

                      {p.certificateStatus === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-[11px]">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedParticipant(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {p.certificateStatus === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              onClick={() => handleApprove(p.id)}
                              disabled={actionInProgress === p.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md shadow-emerald-950 transition-all disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => setRejectModalUser(p)}
                              disabled={actionInProgress === p.id}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {p.certificateStatus === 'NOT_REQUESTED' && (
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={actionInProgress === p.id}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-xs transition-colors"
                          >
                            Pre-Approve
                          </button>
                        )}

                        {p.certificateStatus === 'APPROVED' && p.certificateId && (
                          <Link
                            href={`/verify/${p.certificateId}`}
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

      {/* Participant Details Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-aveeranex-card border border-aveeranex-cyan/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedParticipant(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase">Participant Record</span>
                <h3 className="text-2xl font-bold text-white">{selectedParticipant.name}</h3>
                <p className="text-aveeranex-cyan font-semibold text-sm">Team: {selectedParticipant.teamName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 font-mono">E-MAIL ID</span>
                  <div className="text-slate-200 font-medium mt-1">{selectedParticipant.email}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 font-mono">CONTACT</span>
                  <div className="text-slate-200 font-medium mt-1">{selectedParticipant.contact}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 col-span-2">
                  <span className="text-slate-500 font-mono">COLLEGE / UNIVERSITY</span>
                  <div className="text-slate-200 font-medium mt-1">{selectedParticipant.college}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 col-span-2">
                  <span className="text-slate-500 font-mono">LOCATION</span>
                  <div className="text-slate-200 font-medium mt-1">
                    {selectedParticipant.location}, {selectedParticipant.state} - {selectedParticipant.pincode} ({selectedParticipant.country})
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 col-span-2">
                  <span className="text-slate-500 font-mono">PRESENTATION TOPIC TITLE</span>
                  <div className="text-aveeranex-cyan font-semibold mt-1">{selectedParticipant.topicTitle}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 font-mono">DOMAIN</span>
                  <div className="text-slate-200 font-medium mt-1">{selectedParticipant.topicDomain}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 font-mono">PRESENTED ON</span>
                  <div className="text-emerald-400 font-medium mt-1">{selectedParticipant.presentedOn}</div>
                </div>
              </div>

              {selectedParticipant.certificateStatus === 'PENDING_APPROVAL' && (
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      handleApprove(selectedParticipant.id);
                      setSelectedParticipant(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
                  >
                    Authorize & Approve Certificate
                  </button>
                  <button
                    onClick={() => {
                      setRejectModalUser(selectedParticipant);
                      setSelectedParticipant(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 font-semibold text-xs"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-aveeranex-card border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              Reject Request for {rejectModalUser.name}
            </h3>
            <p className="text-xs text-slate-400">
              Provide a reason for the rejection. The participant will be notified on their dashboard.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalUser(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectModalUser.id)}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
