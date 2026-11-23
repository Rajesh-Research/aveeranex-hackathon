'use client';

import React, { useEffect, useState } from 'react';
import CertificateCanvas from '@/components/CertificateCanvas';

const MODELS = [
  {
    id: 'model_01_participant_landscape',
    title: '1. Participation Certificate (Classic Landscape)',
    props: {
      participantName: 'ADITYA SHARMA',
      teamName: 'Neural Nexians',
      certificateId: 'AVX-2026-NOV-2846',
      category: 'PARTICIPANT' as const,
      awardLevel: 'PARTICIPATION' as const,
      awardOrientation: 'landscape' as const,
      issueDate: '23 November 2026',
      topicTitle: 'Autonomous Edge-AI Fault Detection System',
      college: 'Indian Institute of Technology Madras',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
  {
    id: 'model_02_winner_1st_gold_landscape',
    title: '2. 1st Prize Winner • Grand Champion (Gold Metallic Landscape)',
    props: {
      participantName: 'ADITYA SHARMA',
      teamName: 'Neural Nexians',
      certificateId: 'AVX-2026-WIN1-001',
      category: 'PARTICIPANT' as const,
      awardLevel: 'WINNER_1ST' as const,
      awardOrientation: 'landscape' as const,
      issueDate: '23 November 2026',
      topicTitle: 'Autonomous Edge-AI Fault Detection System',
      college: 'Indian Institute of Technology Madras',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
  {
    id: 'model_03_winner_1st_gold_portrait',
    title: '3. 1st Prize Winner • Grand Champion (Gold Metallic Portrait)',
    props: {
      participantName: 'ADITYA SHARMA',
      teamName: 'Neural Nexians',
      certificateId: 'AVX-2026-WIN1-002',
      category: 'PARTICIPANT' as const,
      awardLevel: 'WINNER_1ST' as const,
      awardOrientation: 'portrait' as const,
      issueDate: '23 November 2026',
      topicTitle: 'Autonomous Edge-AI Fault Detection System',
      college: 'Indian Institute of Technology Madras',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
  {
    id: 'model_04_winner_2nd_silver_landscape',
    title: '4. 2nd Prize Winner • 1st Runner-Up (Silver Metallic Landscape)',
    props: {
      participantName: 'PRIYA SUNDARAM',
      teamName: 'Quantum Coders',
      certificateId: 'AVX-2026-WIN2-001',
      category: 'PARTICIPANT' as const,
      awardLevel: 'WINNER_2ND' as const,
      awardOrientation: 'landscape' as const,
      issueDate: '23 November 2026',
      topicTitle: 'Distributed Quantum Cryptography for IoT',
      college: 'National Institute of Technology Karnataka',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
  {
    id: 'model_05_winner_3rd_bronze_landscape',
    title: '5. 3rd Prize Winner • 2nd Runner-Up (Bronze Metallic Landscape)',
    props: {
      participantName: 'ROHAN VERMA',
      teamName: 'BioSynthetix',
      certificateId: 'AVX-2026-WIN3-001',
      category: 'PARTICIPANT' as const,
      awardLevel: 'WINNER_3RD' as const,
      awardOrientation: 'landscape' as const,
      issueDate: '23 November 2026',
      topicTitle: 'Synthetic Biology Gene Sequence Optimization Engine',
      college: 'Birla Institute of Technology and Science, Pilani',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
  {
    id: 'model_06_runner_4th_white_landscape',
    title: '6. 4th Level Runner-Up • Finalist (Pure White Landscape)',
    props: {
      participantName: 'ANANYA IYER',
      teamName: 'AeroDynamics AI',
      certificateId: 'AVX-2026-RUN4-001',
      category: 'PARTICIPANT' as const,
      awardLevel: 'RUNNER_4TH' as const,
      awardOrientation: 'landscape' as const,
      runnerTheme: 'white' as const,
      issueDate: '23 November 2026',
      topicTitle: 'Micro-UAV Swarm Path Planning with Deep RL',
      college: 'College of Engineering, Guindy, Anna University',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
  {
    id: 'model_07_runner_5th_dark_landscape',
    title: '7. 5th Level Runner-Up • Commendation (Obsidian Black Landscape)',
    props: {
      participantName: 'VIKRAM CHOWDHURY',
      teamName: 'CyberGuard Systems',
      certificateId: 'AVX-2026-RUN5-001',
      category: 'PARTICIPANT' as const,
      awardLevel: 'RUNNER_5TH' as const,
      awardOrientation: 'landscape' as const,
      runnerTheme: 'black' as const,
      issueDate: '23 November 2026',
      topicTitle: 'Zero-Day Ransomware Detection with eBPF',
      college: 'Delhi Technological University',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
  {
    id: 'model_08_mentor_jury_portrait',
    title: '8. Mentor / Jury Royal Gold (Portrait)',
    props: {
      participantName: 'DR. ANANYA SEN',
      certificateId: 'AVX-2026-MJ-001',
      category: 'MENTOR_JURY' as const,
      organization: 'Tata Consultancy Services Research',
      designation: 'Principal AI Research Scientist',
      specialization: 'Neuromorphic Computing & AI Systems',
      issueDate: '23 November 2026',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
  {
    id: 'model_09_tech_coordinator_landscape',
    title: '9. Technical Coordinator Certificate (Landscape)',
    props: {
      participantName: 'KAVYA NAIR',
      certificateId: 'AVX-2026-TC-001',
      category: 'TECHNICAL_COORDINATOR' as const,
      organization: 'BITS Pilani',
      designation: 'Lead Technical Infrastructure Coordinator',
      issueDate: '23 November 2026',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
  {
    id: 'model_10_event_coordinator_landscape',
    title: '10. Event Coordinator Certificate (Landscape)',
    props: {
      participantName: 'ROHAN DESHMUKH',
      certificateId: 'AVX-2026-EC-001',
      category: 'EVENT_COORDINATOR' as const,
      organization: 'National Institute of Technology Trichy',
      designation: 'Head Event Operations Coordinator',
      issueDate: '23 November 2026',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
  {
    id: 'model_11_host_admin_landscape',
    title: '11. Host Admin Credential (Landscape)',
    props: {
      participantName: 'DR. RAJESH KUMAR',
      certificateId: 'AVX-2026-ADM-001',
      category: 'ADMIN' as const,
      organization: 'AVEERANEX (OPC) PRIVATE LIMITED',
      designation: 'Director & Chief Patron',
      issueDate: '23 November 2026',
      presentedOn: "AVEERANEX INNOVATE - NOV'26",
    },
  },
];

export default function ModelsPreviewPage() {
  const [exportStatus, setExportStatus] = useState<string>('Initializing...');
  const [exportedCount, setExportedCount] = useState<number>(0);

  const exportAllCanvases = async () => {
    setExportStatus('Scanning canvas elements on page...');
    const containers = document.querySelectorAll('[data-model-id]');
    if (containers.length === 0) {
      setExportStatus('No containers found yet. Retrying...');
      return;
    }

    let count = 0;
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      const modelId = container.getAttribute('data-model-id');
      const canvas = container.querySelector('canvas') as HTMLCanvasElement | null;
      if (modelId && canvas && canvas.width > 0 && canvas.height > 0) {
        try {
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          await fetch('/api/export-previews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: `${modelId}.png`,
              base64: dataUrl,
            }),
          });
          count++;
          setExportedCount(count);
          setExportStatus(`Exported ${count}/${containers.length}: ${modelId}.png`);
        } catch (e: any) {
          console.error(`Failed to export ${modelId}`, e);
        }
      }
    }
    setExportStatus(`All ${count} certificates successfully rendered & exported!`);
  };

  useEffect(() => {
    // Wait 3.5s for fonts, QR codes, logos, stamps and signatures to finish rendering on canvases
    const timer = setTimeout(() => {
      exportAllCanvases();
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="border-b border-zinc-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
              AVEERANEX CERTIFICATE MODELS
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              High-resolution PNG & PDF models for all categories, award tiers, and orientations.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-cyan-400">
              {exportStatus}
            </span>
            <button
              onClick={exportAllCanvases}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:brightness-110 shadow-lg"
            >
              Export / Refresh All PNGs
            </button>
          </div>
        </div>

        <div className="space-y-16">
          {MODELS.map((item) => (
            <div
              key={item.id}
              data-model-id={item.id}
              className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <h2 className="text-lg font-semibold text-zinc-200">{item.title}</h2>
                <div className="flex items-center gap-2">
                  <a
                    href={`/previews/${item.id}.png`}
                    download={`${item.id}.png`}
                    className="text-xs px-3 py-1 bg-zinc-900 border border-zinc-700 hover:border-cyan-400 rounded-md text-zinc-300 hover:text-white"
                  >
                    Direct PNG Download
                  </a>
                </div>
              </div>
              <CertificateCanvas {...item.props} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
