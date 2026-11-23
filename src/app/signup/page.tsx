'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Users,
  Mail,
  Phone,
  School,
  MapPin,
  Compass,
  Globe,
  Hash,
  Lightbulb,
  Layers,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Award,
  Briefcase,
  Cpu,
  BookmarkCheck,
  Building,
  Linkedin,
} from 'lucide-react';
import { UserCategory } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();

  const [category, setCategory] = useState<UserCategory>('PARTICIPANT');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role') as UserCategory | null;
      if (
        roleParam &&
        ['PARTICIPANT', 'MENTOR_JURY', 'TECHNICAL_COORDINATOR', 'EVENT_COORDINATOR', 'ADMIN'].includes(roleParam)
      ) {
        setCategory(roleParam);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    teamName: '',
    email: '',
    contact: '',
    college: '',
    location: '',
    state: '',
    country: 'India',
    pincode: '',
    topicTitle: '',
    topicDomain: 'AI / Machine Learning',
    presentedOn: "AVEERANEX INNOVATE ONLINE HACKATHON  Nov'26",
    organization: '',
    designation: '',
    specialization: 'AI / Machine Learning',
    technicalResponsibility: 'Technical Evaluation & Platform Lead',
    committeeRole: 'Event Management & Organizing Lead',
    linkedinUrl: '',
    assignedEvent: '',
    eventRounds: '',
    eventDates: '',
    eventPrizes: '',
    eventDescription: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const topicDomains = [
    'AI / Machine Learning',
    'Generative AI & LLMs',
    'Web3 / Blockchain & Decentralized Systems',
    'Cloud Computing & DevOps',
    'IoT, Robotics & Embedded Systems',
    'HealthTech & BioInformatics',
    'FinTech & InsurTech',
    'Cybersecurity & Ethical Hacking',
    'EdTech & Future of Learning',
    'CleanTech, Green Energy & Sustainability',
    'AR / VR & Spatial Computing',
    'Open Innovation & Social Impact',
  ];

  const presentedOnOptions = [
    "AVEERANEX INNOVATE ONLINE HACKATHON  Nov'26",
    "AVEERANEX AI & CLOUD CHALLENGE 2026",
    "AVEERANEX CAMPUS INVENT HACKATHON 2026",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        category,
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register.');
      }

      setSuccess(`Registration successful as ${category.replace(/_/g, ' ')}! Redirecting to your dashboard...`);
      setTimeout(() => {
        if (category === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aveeranex-teal/20 border border-aveeranex-teal/40 text-aveeranex-cyan text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            AVEERANEX HACKATHON REGISTRATION
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Portal Registration & Credential Issuance
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            Select your participation category below to register for the official hackathon and verified credentials.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-aveeranex-card/70 border border-aveeranex-border/80 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: CATEGORY SELECTION (MUST COME FIRST) */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-aveeranex-cyan/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-aveeranex-cyan uppercase tracking-wider font-mono">
                  Select Registration Category <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Step 1 of 2</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setCategory('PARTICIPANT')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    category === 'PARTICIPANT'
                      ? 'bg-gradient-to-b from-teal-500/20 to-cyan-500/20 border-aveeranex-cyan text-white shadow-lg shadow-cyan-950'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <Users className="w-4 h-4 text-aveeranex-cyan" />
                  <span>Participant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('MENTOR_JURY')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    category === 'MENTOR_JURY'
                      ? 'bg-gradient-to-b from-amber-500/20 to-yellow-500/20 border-amber-400 text-white shadow-lg shadow-amber-950'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Mentor / Jury</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('TECHNICAL_COORDINATOR')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    category === 'TECHNICAL_COORDINATOR'
                      ? 'bg-gradient-to-b from-cyan-500/20 to-blue-500/20 border-cyan-400 text-white shadow-lg shadow-blue-950'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Tech Coordinator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('EVENT_COORDINATOR')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    category === 'EVENT_COORDINATOR'
                      ? 'bg-gradient-to-b from-emerald-500/20 to-teal-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-950'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span>Event Coord.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('ADMIN')}
                  className={`col-span-2 sm:col-span-1 p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    category === 'ADMIN'
                      ? 'bg-gradient-to-b from-purple-500/20 to-indigo-500/20 border-purple-400 text-white shadow-lg shadow-purple-950'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <Building className="w-4 h-4 text-purple-400" />
                  <span>Host Admin</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CATEGORY 1: PARTICIPANT LAYOUT (ORIGINAL LAYOUT - 100% UNTOUCHED)        */}
            {/* ========================================================================= */}
            {category === 'PARTICIPANT' && (
              <>
                {/* 1. Personal & Contact Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-aveeranex-border/40">
                    <User className="w-4 h-4 text-aveeranex-cyan" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                      1. Participant & Contact Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        This exact name will be printed on your official certificate.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Team Name <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="teamName"
                          required
                          placeholder="e.g. Neural Nexians"
                          value={formData.teamName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Your hackathon team identifier.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="e.g. rahul.sharma@gmail.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Used for certificate delivery & verification link.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Contact / WhatsApp Number <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          name="contact"
                          required
                          placeholder="e.g. +91 9876543210"
                          value={formData.contact}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Academic & Geographic Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-aveeranex-border/40">
                    <School className="w-4 h-4 text-aveeranex-cyan" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                      2. Academic & Location Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        College / University / Institution <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <School className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="college"
                          required
                          placeholder="e.g. Indian Institute of Technology (IIT), Delhi"
                          value={formData.college}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        City / Location <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="location"
                          required
                          placeholder="e.g. Bengaluru"
                          value={formData.location}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        State <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Compass className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="state"
                          required
                          placeholder="e.g. Karnataka"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Country <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        PIN / Postal Code <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="pincode"
                          required
                          placeholder="e.g. 560001"
                          value={formData.pincode}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Hackathon Topic Presentation Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-aveeranex-border/40">
                    <Lightbulb className="w-4 h-4 text-aveeranex-cyan" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                      3. Hackathon Presentation Details
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Topic / Project Title <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Lightbulb className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="topicTitle"
                          required
                          placeholder="e.g. Autonomous Edge AI for Real-Time Medical Diagnostics"
                          value={formData.topicTitle}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Exact innovation title presented in the hackathon round.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Topic Domain / Track <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <Layers className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <select
                            name="topicDomain"
                            value={formData.topicDomain}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-aveeranex-cyan outline-none transition-all appearance-none cursor-pointer"
                          >
                            {topicDomains.map((domain) => (
                              <option key={domain} value={domain} className="bg-slate-900 text-white">
                                {domain}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Presented On (Event Name) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <select
                            name="presentedOn"
                            value={formData.presentedOn}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-aveeranex-cyan outline-none transition-all appearance-none cursor-pointer"
                          >
                            {presentedOnOptions.map((opt) => (
                              <option key={opt} value={opt} className="bg-slate-900 text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 2: MENTOR / JURY LAYOUT                                          */}
            {/* ========================================================================= */}
            {category === 'MENTOR_JURY' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-amber-500/40">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider font-mono">
                    Mentor & Jury Credentials
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Dr. Anand Verma"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Official Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. anand.verma@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Contact / Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        name="contact"
                        required
                        placeholder="e.g. +91 9876543210"
                        value={formData.contact}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Current Organization / Company / University <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="organization"
                        required
                        placeholder="e.g. Microsoft / IIT Madras"
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Professional Designation <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="designation"
                        required
                        placeholder="e.g. Principal AI Architect / Professor"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Domain Expertise / Area of Specialization <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Layers className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-amber-400 outline-none transition-all appearance-none cursor-pointer"
                      >
                        {topicDomains.map((domain) => (
                          <option key={domain} value={domain} className="bg-slate-900 text-white">
                            {domain}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Hackathon Event Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <select
                        name="presentedOn"
                        value={formData.presentedOn}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-amber-400 outline-none transition-all appearance-none cursor-pointer"
                      >
                        {presentedOnOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-slate-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      LinkedIn Profile URL <span className="text-slate-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Linkedin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="url"
                        name="linkedinUrl"
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 3: TECHNICAL COORDINATOR LAYOUT                                  */}
            {/* ========================================================================= */}
            {category === 'TECHNICAL_COORDINATOR' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/40">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider font-mono">
                    Technical Coordinator Credentials
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Prof. Rajesh Mehra"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. rajesh.mehra@college.edu"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Contact Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        name="contact"
                        required
                        placeholder="e.g. +91 9876543210"
                        value={formData.contact}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Institution / College <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="college"
                        required
                        placeholder="e.g. Chennai Institute of Technology"
                        value={formData.college}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Technical Responsibility / Area Managed <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Cpu className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="technicalResponsibility"
                        required
                        placeholder="e.g. Cloud Infrastructure, Evaluation Platform & Code Review Lead"
                        value={formData.technicalResponsibility}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Associated Hackathon Event <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <select
                        name="presentedOn"
                        value={formData.presentedOn}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-cyan-400 outline-none transition-all appearance-none cursor-pointer"
                      >
                        {presentedOnOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-slate-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 4: EVENT COORDINATOR LAYOUT                                      */}
            {/* ========================================================================= */}
            {category === 'EVENT_COORDINATOR' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/40">
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider font-mono">
                    Event Coordinator Credentials
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Priya Venkatesh"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-emerald-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. priya.v@institution.org"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-emerald-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Contact Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        name="contact"
                        required
                        placeholder="e.g. +91 9876543210"
                        value={formData.contact}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-emerald-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      College / Organizing Institution <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="college"
                        required
                        placeholder="e.g. Andhra University"
                        value={formData.college}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-emerald-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Committee / Organizing Role <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <BookmarkCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="committeeRole"
                        required
                        placeholder="e.g. Student Convenor, Logistics & Jury Hospitality Head"
                        value={formData.committeeRole}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-emerald-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Event / Hackathon / Competition Name to Host <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="assignedEvent"
                        required
                        placeholder="Type your Event / Hackathon / Competition Name"
                        value={formData.assignedEvent}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-emerald-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Number of Rounds <span className="text-slate-500">(or update after login)</span>
                    </label>
                    <input
                      type="text"
                      name="eventRounds"
                      placeholder="e.g. 3 Rounds (Idea, Prototype, Finale)"
                      value={formData.eventRounds}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-emerald-400 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Event Dates
                    </label>
                    <input
                      type="text"
                      name="eventDates"
                      placeholder="e.g. 15 Dec - 17 Dec 2026"
                      value={formData.eventDates}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-emerald-400 outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Winning Prizes
                    </label>
                    <input
                      type="text"
                      name="eventPrizes"
                      placeholder="e.g. 1st: ₹50,000, 2nd: ₹25,000, 3rd: ₹10,000"
                      value={formData.eventPrizes}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-emerald-400 outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Basic Description &amp; Rules
                    </label>
                    <textarea
                      name="eventDescription"
                      rows={2}
                      placeholder="Brief overview of the hackathon theme and evaluation criteria..."
                      value={formData.eventDescription}
                      onChange={(e) => setFormData((prev) => ({ ...prev, eventDescription: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-emerald-400 outline-none transition-all"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Sample Banner (1200 &times; 630 px) and event edits can also be uploaded from your portal after registration. Your event goes to Super Admin for approval.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 5: ADMIN (EVENT HOST) LAYOUT                                     */}
            {/* ========================================================================= */}
            {category === 'ADMIN' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-purple-500/40">
                  <Building className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider font-mono">
                    Host Admin Details (Colleges & Corporates)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Administrator Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Dr. K. S. Raman"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Official Admin Email <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. hackathon.lead@university.edu"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Contact Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        name="contact"
                        required
                        placeholder="e.g. +91 9876543210"
                        value={formData.contact}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      College / Corporate Host Entity <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="organization"
                        required
                        placeholder="e.g. Vel Tech University / Tech Mahindra"
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Admin Designation <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="designation"
                        required
                        placeholder="e.g. Dean of Academics / Head of Incubation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Event / Hackathon / Competition Name to Host <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="assignedEvent"
                        required
                        placeholder="Type your Event / Hackathon / Competition Name"
                        value={formData.assignedEvent}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Number of Rounds <span className="text-slate-500">(or update after login)</span>
                    </label>
                    <input
                      type="text"
                      name="eventRounds"
                      placeholder="e.g. 3 Rounds"
                      value={formData.eventRounds}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-400 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Event Dates
                    </label>
                    <input
                      type="text"
                      name="eventDates"
                      placeholder="e.g. 15 Dec - 17 Dec 2026"
                      value={formData.eventDates}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-400 outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Winning Prizes
                    </label>
                    <input
                      type="text"
                      name="eventPrizes"
                      placeholder="e.g. 1st: ₹50,000, 2nd: ₹25,000, 3rd: ₹10,000"
                      value={formData.eventPrizes}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-400 outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Basic Description &amp; Rules
                    </label>
                    <textarea
                      name="eventDescription"
                      rows={2}
                      placeholder="Brief description of the event, themes, and rules..."
                      value={formData.eventDescription}
                      onChange={(e) => setFormData((prev) => ({ ...prev, eventDescription: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-400 outline-none transition-all"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Sample Banner (1200 &times; 630 px) and event edits can also be uploaded from your portal after registration. Your event goes to Super Admin for approval.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: PASSWORD CREDENTIALS (COMMON TO ALL CATEGORIES)                   */}
            {/* ========================================================================= */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-aveeranex-border/40">
                <Lock className="w-4 h-4 text-aveeranex-cyan" />
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  Account Security Password
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-aveeranex-teal via-cyan-600 to-aveeranex-cyan hover:brightness-110 active:scale-[0.99] text-white font-bold text-base shadow-xl shadow-cyan-950 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing Registration...</span>
                ) : (
                  <>
                    <span>Complete {category.replace(/_/g, ' ')} Registration</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="text-center pt-8 border-t border-aveeranex-border/40 mt-8">
            <p className="text-sm text-slate-400">
              Already registered?{' '}
              <Link href="/signin" className="text-aveeranex-cyan hover:underline font-semibold">
                Sign In to Your Dashboard &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
