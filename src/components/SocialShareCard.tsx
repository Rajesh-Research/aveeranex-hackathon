'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Share2,
  Copy,
  Check,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SocialShareCardProps {
  participantName: string;
  teamName: string;
  topicTitle: string;
  certificateId: string;
}

export default function SocialShareCard({
  participantName,
  teamName,
  topicTitle,
  certificateId,
}: SocialShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareCaption = `🎓 Proud to announce that our team "${teamName}" participated and presented our project "${topicTitle || 'Innovate Hackathon Project'}" at the AVEERANEX INNOVATE ONLINE HACKATHON Nov'26! 🚀

Huge gratitude to AVEERANEX and the organizers for providing such an inspiring platform celebrating Research, Technology, and Innovation!

Connect & Explore AVEERANEX:
📸 Instagram: https://www.instagram.com/aveeranex
▶️ YouTube: https://www.youtube.com/@aveeranex
💼 LinkedIn: https://www.linkedin.com/company/aveeranex
🌐 Website: https://www.aveeranex.com
🎓 Register & Explore AVEERANEX LEARN: https://www.aveeranex.com/products/learn

#Aveeranex #AveeranexHackathon #AveeranexLearn #Innovation #Technology #Hackathon2026 #Research #CertificateOfParticipation`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(shareCaption);
    setCopied(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#067f92', '#00b4d8', '#10b981', '#38bdf8'],
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const socialLinks = [
    {
      name: 'LinkedIn',
      handle: '@aveeranex',
      url: 'https://www.linkedin.com/company/aveeranex',
      icon: Linkedin,
      color: 'hover:text-[#0a66c2] hover:border-[#0a66c2]/50 hover:bg-[#0a66c2]/10',
      badge: 'Tag @aveeranex',
    },
    {
      name: 'Instagram',
      handle: '@aveeranex',
      url: 'https://www.instagram.com/aveeranex',
      icon: Instagram,
      color: 'hover:text-[#E4405F] hover:border-[#E4405F]/50 hover:bg-[#E4405F]/10',
      badge: 'Tag on Stories/Post',
    },
    {
      name: 'YouTube',
      handle: '@aveeranex',
      url: 'https://www.youtube.com/@aveeranex',
      icon: Youtube,
      color: 'hover:text-[#FF0000] hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10',
      badge: 'Subscribe & Watch',
    },
    {
      name: 'AVEERANEX Website',
      handle: 'aveeranex.com',
      url: 'https://www.aveeranex.com',
      icon: Globe,
      color: 'hover:text-aveeranex-cyan hover:border-aveeranex-cyan/50 hover:bg-aveeranex-cyan/10',
      badge: 'Official Portal',
    },
    {
      name: 'AVEERANEX LEARN',
      handle: 'aveeranex.com/products/learn',
      url: 'https://www.aveeranex.com/products/learn',
      icon: GraduationCap,
      color: 'hover:text-emerald-400 hover:border-emerald-400/50 hover:bg-emerald-400/10',
      badge: 'Register & Upskill',
    },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-aveeranex-card/90 via-slate-900/90 to-slate-950/90 rounded-2xl border border-aveeranex-border/70 p-6 md:p-8 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-aveeranex-cyan/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aveeranex-teal/20 border border-aveeranex-teal/40 text-aveeranex-cyan text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Social Recognition & Tagging
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Share Your Achievement & Tag AVEERANEX
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Tag us in your post or story to get featured across our official community channels!
          </p>
        </div>

        <button
          onClick={handleCopyCaption}
          className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98]"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Caption Copied!' : 'Copy Post Caption with Tags'}</span>
        </button>
      </div>

      {/* Official Community Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
        {socialLinks.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-4 rounded-xl bg-slate-900/70 border border-slate-800 transition-all duration-200 group ${item.color}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-800/80 group-hover:bg-slate-800 transition-colors">
                  <Icon className="w-5 h-5 text-slate-300 group-hover:text-inherit transition-colors" />
                </div>
                <div>
                  <div className="font-semibold text-slate-100 text-sm group-hover:text-inherit transition-colors">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {item.handle}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-slate-300">
                <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">
                  {item.badge}
                </span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          );
        })}
      </div>

      {/* Pre-formatted caption preview */}
      <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>RECOMMENDED POST CAPTION</span>
          <button
            onClick={handleCopyCaption}
            className="text-aveeranex-cyan hover:underline flex items-center gap-1"
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
        </div>
        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed line-clamp-3 select-all">
          {shareCaption}
        </pre>
      </div>
    </div>
  );
}
