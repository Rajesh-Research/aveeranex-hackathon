'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

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
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register.');
      }

      setSuccess('Registration successful! Redirecting to your certificate dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
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
            Participant & Team Sign Up
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            Fill in your details below to submit your hackathon topic and generate your verified certificate of participation.
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your hackathon team identifier.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    E-mail ID <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. rahul.sharma@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Contact (Mobile Number) <span className="text-rose-400">*</span>
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. College & Institutional Location */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-aveeranex-border/40">
                <School className="w-4 h-4 text-aveeranex-cyan" />
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  2. College / University & Location
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  College / University Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="college"
                    required
                    placeholder="e.g. Indian Institute of Technology Madras"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Location (City) <span className="text-rose-400">*</span>
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
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
                      placeholder="e.g. India"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Pin Code <span className="text-rose-400">*</span>
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Topic & Presentation Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-aveeranex-border/40">
                <Lightbulb className="w-4 h-4 text-aveeranex-cyan" />
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  3. Presentation & Topic Details
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Topic Title <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lightbulb className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="topicTitle"
                    required
                    placeholder="e.g. AI-Powered Early Detection of Retinal Disorders"
                    value={formData.topicTitle}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Topic Domain <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <select
                      name="topicDomain"
                      required
                      value={formData.topicDomain}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all appearance-none cursor-pointer"
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
                    Presented On <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <select
                      name="presentedOn"
                      required
                      value={formData.presentedOn}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all appearance-none cursor-pointer"
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

            {/* 4. Password Security */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-aveeranex-border/40">
                <Lock className="w-4 h-4 text-aveeranex-cyan" />
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  4. Account Password & Access
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-aveeranex-cyan focus:ring-1 focus:ring-aveeranex-cyan outline-none transition-all"
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
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-aveeranex-teal via-cyan-500 to-emerald-500 hover:brightness-110 active:scale-[0.99] text-white font-bold text-base shadow-xl shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registering Participant...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration & Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Switch to Sign In */}
            <div className="text-center text-xs text-slate-400 pt-2">
              Already registered?{' '}
              <Link href="/signin" className="text-aveeranex-cyan font-semibold hover:underline">
                Sign In to your account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
