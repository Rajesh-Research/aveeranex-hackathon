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
} from 'lucide-react';
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
  const [subTab, setSubTab] = useState<'PARTICIPANTS' | 'ONBOARD' | 'TEMPLATE'>('TEMPLATE');
  const [eventUsers, setEventUsers] = useState<PublicParticipantInfo[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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

  const readFileAsDataUrl = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') cb(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Onboard Mentor / Coordinator Form State
  const [onboardName, setOnboardName] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardContact, setOnboardContact] = useState('');
  const [onboardRole, setOnboardRole] = useState<UserCategory>('MENTOR_JURY');
  const [onboardOrg, setOnboardOrg] = useState(hostUser.organization || hostUser.college || '');
  const [onboardSpec, setOnboardSpec] = useState('');
  const [onboarding, setOnboarding] = useState(false);

  // Approval Award Selector
  const [awardingId, setAwardingId] = useState<string | null>(null);
  const [selectedAward, setSelectedAward] = useState<AwardLevel>('PARTICIPATION');

  const eventTitle = hostUser.assignedEvent || hostUser.presentedOn || "AVEERANEX INNOVATE - NOV'26";

  const fetchEventUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/event/subplatform');
      if (res.ok) {
        const data = await res.json();
        setEventUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchEventUsers();
  }, [hostUser.id]);

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

  const handleOnboardSubmit = async (e: React.FormEvent) => {
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
          organization: onboardOrg,
          specialization: onboardSpec,
          designation: onboardRole === 'MENTOR_JURY' ? 'Event Mentor / Jury' : 'Event Coordinator',
          technicalResponsibility: onboardSpec,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to onboard member.');
      setStatusMsg(data.message);
      setOnboardName('');
      setOnboardEmail('');
      setOnboardContact('');
      setOnboardSpec('');
      await fetchEventUsers();
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setOnboarding(false);
    }
  };

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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed.');
      setStatusMsg(data.message);
      await fetchEventUsers();
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setAwardingId(null);
    }
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

  const eventParticipants = eventUsers.filter((u) => (u.category || 'PARTICIPANT') === 'PARTICIPANT');
  const eventStaff = eventUsers.filter((u) => u.category && u.category !== 'PARTICIPANT');

  return (
    <div className="bg-slate-950 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Sub-Platform Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            DEDICATED EVENT SUB-PLATFORM
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {eventTitle}
          </h2>
          <p className="text-xs text-slate-400">
            Independent event workspace: design certificate templates (Landscape &amp; Vertical), onboard mentors/coordinators, and approve event participants.
          </p>
        </div>

        {/* Sub-Platform Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('TEMPLATE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'TEMPLATE'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Certificate Designer</span>
          </button>

          <button
            onClick={() => setSubTab('ONBOARD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'ONBOARD'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Team ({eventStaff.length})</span>
          </button>

          <button
            onClick={() => setSubTab('PARTICIPANTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'PARTICIPANTS'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Event Participants ({eventParticipants.length})</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-700 text-cyan-200 text-xs flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: CERTIFICATE TEMPLATE DESIGNER (LANDSCAPE & VERTICAL) */}
      {subTab === 'TEMPLATE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Template Style Controls
            </h3>

            {/* Orientation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Layout Orientation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    orientation === 'landscape'
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Landscape (A4)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    orientation === 'portrait'
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Vertical (Portrait)
                </button>
              </div>
            </div>

            {/* Background Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Background Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'classic', label: 'Classic Official' },
                  { id: 'gold', label: 'Full Royal Gold' },
                  { id: 'dark', label: 'Obsidian Black' },
                  { id: 'white', label: 'Minimal White' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setBgStyle(bg.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      bgStyle === bg.id
                        ? 'bg-amber-500 border-amber-400 text-slate-950'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Typography Font Style
              </label>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
              >
                <option value="royal">Royal Serif (Cinzel / Playfair)</option>
                <option value="modern">Modern Sans (Outfit / Jakarta)</option>
                <option value="classic">Classic Academic (Georgia)</option>
              </select>
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-9 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-300">{accentColor}</span>
              </div>
            </div>

            {/* Custom Logo Upload & Position */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-cyan-300 uppercase font-mono">
                  Custom Host Logo (Replaces Default)
                </label>
                {customLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setCustomLogoUrl('')}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Reset Logo
                  </button>
                )}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) readFileAsDataUrl(f, (url) => setCustomLogoUrl(url));
                }}
                className="w-full text-[11px] text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-cyan-950 file:text-cyan-300 cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['left', 'center', 'right'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setLogoPosition(pos)}
                    className={`py-1 rounded-lg text-[11px] font-semibold capitalize border ${
                      logoPosition === pos
                        ? 'bg-cyan-600 border-cyan-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Logo {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Customization */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Certificate Header Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ribbon / Distinction Subtitle <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={customRibbonText}
                  onChange={(e) => setCustomRibbonText(e.target.value)}
                  placeholder="e.g. HONOUR OF EXCELLENCE • FINALIST"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Citation / Body Content <span className="text-slate-500">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={customBodyText}
                  onChange={(e) => setCustomBodyText(e.target.value)}
                  placeholder="e.g. in recognition of outstanding innovation and presentation at"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Multi-Signature Upload & Placement Builder (Up to 3 Signatories) */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase font-mono">
                  Signatures ({signatures.length}/3)
                </span>
                {signatures.length < 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSignatures((prev) => [
                        ...prev,
                        {
                          name: 'Co-Signatory',
                          title: 'Dean / Coordinator',
                          imageUrl: '/assets/signature.png',
                          position: prev.some((s) => s.position === 'right') ? 'center' : 'right',
                        },
                      ])
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold"
                  >
                    + Add Signature
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-400">
                White backgrounds are automatically removed from uploaded signatures.
              </p>

              <div className="space-y-3">
                {signatures.map((sig, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-300">
                        Signature #{idx + 1}
                      </span>
                      {signatures.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSignatures((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-[11px] text-rose-400 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Signatory Name"
                        value={sig.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSignatures((prev) => prev.map((s, i) => (i === idx ? { ...s, name: val } : s)));
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Designation / Title"
                        value={sig.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSignatures((prev) => prev.map((s, i) => (i === idx ? { ...s, title: val } : s)));
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px] outline-none"
                      />
                    </div>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          readFileAsDataUrl(f, (url) => {
                            setSignatures((prev) => prev.map((s, i) => (i === idx ? { ...s, imageUrl: url } : s)));
                          });
                        }
                      }}
                      className="w-full text-[11px] text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-800 file:text-amber-300 cursor-pointer"
                    />

                    <div className="grid grid-cols-3 gap-1">
                      {(['left', 'center', 'right'] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() =>
                            setSignatures((prev) => prev.map((s, i) => (i === idx ? { ...s, position: pos } : s)))
                          }
                          className={`py-1 rounded-lg text-[10px] font-bold capitalize border ${
                            sig.position === pos
                              ? 'bg-amber-500 border-amber-400 text-slate-950'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          Place {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={savingTemplate}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
            >
              {savingTemplate ? 'Saving Template...' : 'Save Event Certificate Template'}
            </button>
          </div>

          {/* Live Certificate Canvas Preview */}
          <div className="lg:col-span-8">
            <CertificateCanvas
              participantName="Sample Participant"
              teamName="Team Innovators"
              certificateId="AVX-PREVIEW-2026"
              category="PARTICIPANT"
              awardLevel="WINNER_1ST"
              college={hostUser.organization || hostUser.college || 'Host Institution'}
              presentedOn={eventTitle}
              template={templateConfig}
            />
          </div>
        </div>
      )}

      {/* TAB 2: ONBOARD OWN MENTORS & COORDINATORS */}
      {subTab === 'ONBOARD' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleOnboardSubmit}
            className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Onboard Mentor / Coordinator to {eventTitle}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Category</label>
              <select
                value={onboardRole}
                onChange={(e) => setOnboardRole(e.target.value as UserCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
              >
                <option value="MENTOR_JURY">Mentor / Jury (Vertical Royal Gold)</option>
                <option value="TECHNICAL_COORDINATOR">Technical Coordinator</option>
                <option value="EVENT_COORDINATOR">Event Coordinator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={onboardName}
                onChange={(e) => setOnboardName(e.target.value)}
                placeholder="e.g. Dr. Ramesh Krishnan"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={onboardEmail}
                onChange={(e) => setOnboardEmail(e.target.value)}
                placeholder="mentor@company.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Number</label>
              <input
                type="tel"
                value={onboardContact}
                onChange={(e) => setOnboardContact(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / Institution</label>
              <input
                type="text"
                value={onboardOrg}
                onChange={(e) => setOnboardOrg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Specialization / Responsibility</label>
              <input
                type="text"
                value={onboardSpec}
                onChange={(e) => setOnboardSpec(e.target.value)}
                placeholder="e.g. AI / Cloud Evaluation"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={onboarding}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
            >
              {onboarding ? 'Onboarding...' : 'Onboard Member to Event'}
            </button>
          </form>

          <div className="lg:col-span-7 rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase font-mono">
                Event Mentors &amp; Coordinators ({eventStaff.length})
              </span>
              <button onClick={fetchEventUsers} className="text-slate-400 hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-slate-800/80">
              {eventStaff.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No mentors or coordinators onboarded for this event yet.
                </div>
              ) : (
                eventStaff.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-white text-sm">{m.name}</div>
                      <div className="text-xs text-cyan-400 font-mono">{m.category}</div>
                      <div className="text-[11px] text-slate-400">{m.email} &bull; {m.organization || m.college}</div>
                    </div>
                    <div>
                      {m.certificateStatus === 'APPROVED' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                          Approved ({m.certificateId})
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveParticipant(m.id, 'PARTICIPATION')}
                          disabled={awardingId === m.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                        >
                          Approve Certificate
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EVENT PARTICIPANTS & SEPARATE APPROVALS */}
      {subTab === 'PARTICIPANTS' && (
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase font-mono">
              Participants Enrolled in &quot;{eventTitle}&quot; ({eventParticipants.length})
            </span>
            <button onClick={fetchEventUsers} className="text-slate-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Participant &amp; Team</th>
                  <th className="px-5 py-3">Submission</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Approve for Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">Loading event participants...</td>
                  </tr>
                ) : eventParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                      No participants enrolled in this event yet.
                    </td>
                  </tr>
                ) : (
                  eventParticipants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white text-sm">{p.name}</div>
                        <div className="text-cyan-400 text-xs">Team: {p.teamName}</div>
                        <div className="text-[11px] text-slate-400">{p.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.submissionFileName ? (
                          <a
                            href={p.submissionFileUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-300 hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{p.submissionFileName}</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">No file yet</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.certificateStatus === 'APPROVED' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                            Approved ({p.awardLevel || 'PARTICIPATION'})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                            {p.certificateStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            defaultValue={p.awardLevel || 'PARTICIPATION'}
                            onChange={(e) => setSelectedAward(e.target.value as AwardLevel)}
                            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px]"
                          >
                            <option value="PARTICIPATION">Participation</option>
                            <option value="WINNER_1ST">🥇 1st Winner</option>
                            <option value="WINNER_2ND">🥈 2nd Winner</option>
                            <option value="WINNER_3RD">🥉 3rd Winner</option>
                            <option value="RUNNER_4TH">🏅 4th Runner</option>
                            <option value="RUNNER_5TH">🎖️ 5th Runner</option>
                          </select>
                          <button
                            onClick={() => handleApproveParticipant(p.id, selectedAward)}
                            disabled={awardingId === p.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
