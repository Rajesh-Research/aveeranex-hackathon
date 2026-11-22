'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Download, Share2, CheckCircle2, ShieldCheck, Printer, Eye } from 'lucide-react';

interface CertificateCanvasProps {
  participantName: string;
  teamName: string;
  certificateId: string;
  issueDate?: string;
  topicTitle?: string;
  college?: string;
  onDownloadSuccess?: () => void;
}

export default function CertificateCanvas({
  participantName,
  teamName,
  certificateId,
  issueDate = '22 November 2026',
  topicTitle,
  college,
  onDownloadSuccess,
}: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const certWidth = 3508;
  const certHeight = 2479;

  useEffect(() => {
    // Generate QR code for certificate verification
    const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://aveeranex.com'}/verify/${certificateId}`;
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 280,
      color: {
        dark: '#067F92',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code', err);
      });
  }, [certificateId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = certWidth;
    canvas.height = certHeight;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.src = '/assets/certificate-template.png';

    baseImg.onload = () => {
      // Draw background template
      ctx.drawImage(baseImg, 0, 0, certWidth, certHeight);

      // Draw Participant Name
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#067F92'; // Exact Aveeranex Teal
      ctx.font = 'bold 112px "Outfit", "Georgia", "Times New Roman", serif';
      const centerX = certWidth / 2;
      ctx.fillText(participantName || 'Participant Name', centerX, 1140);

      // Draw Team Name
      ctx.fillStyle = '#067F92';
      ctx.font = '600 46px "Outfit", "Inter", sans-serif';
      ctx.fillText(`Team: ${teamName || 'Innovators'}`, centerX, 1335);

      // Draw Verification Metadata & ID at bottom left
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = '500 24px "Inter", sans-serif';
      ctx.fillText(`Certificate ID: ${certificateId}`, 360, 2195);
      ctx.fillText(`Verification: avx.io/v/${certificateId}`, 360, 2235);

      // Draw QR Code if available
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 3170, 1960, 160, 160);
          // Label under QR
          ctx.textAlign = 'center';
          ctx.fillStyle = '#64748b';
          ctx.font = '600 18px "Inter", sans-serif';
          ctx.fillText('SCAN TO VERIFY', 3250, 2145);
          setIsReady(true);
        };
      } else {
        setIsReady(true);
      }
    };
  }, [participantName, teamName, certificateId, qrDataUrl]);

  // Download High-Resolution PNG
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const safeName = participantName.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `AVEERANEX_HACKATHON_${safeName}_Certificate.png`;
      link.href = dataUrl;
      link.click();
      if (onDownloadSuccess) onDownloadSuccess();
    } catch (err) {
      console.error('Download PNG failed', err);
    } finally {
      setDownloading(false);
    }
  };

  // Download Printable A4 PDF
  const handleDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPdfGenerating(true);

    try {
      const imgData = canvas.toDataURL('image/png', 1.0);
      // Landscape A4: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
      const safeName = participantName.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`AVEERANEX_HACKATHON_${safeName}_Certificate.pdf`);
      if (onDownloadSuccess) onDownloadSuccess();
    } catch (err) {
      console.error('Download PDF failed', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const windowContent = `<!DOCTYPE html>
      <html>
        <head>
          <title>Aveeranex Certificate - ${participantName}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { width: 100vw; height: auto; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>`;
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(windowContent);
      printWin.document.close();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Certificate Preview Card */}
      <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-aveeranex-border/60 bg-aveeranex-card/40 backdrop-blur-md p-3 md:p-6 mb-6">
        <div className="flex items-center justify-between pb-4 border-b border-aveeranex-border/40 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-aveeranex-green" />
            <span className="text-xs md:text-sm font-semibold tracking-wide text-slate-200 uppercase">
              Official Verified Certificate Preview
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-aveeranex-teal/20 text-aveeranex-cyan border border-aveeranex-cyan/30 font-mono">
            {certificateId}
          </span>
        </div>

        {/* Responsive Canvas Container */}
        <div className="relative w-full aspect-[3508/2479] max-w-4xl mx-auto rounded-xl overflow-hidden shadow-inner bg-slate-900 border border-slate-700/50">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block"
            style={{ imageRendering: 'auto' }}
          />

          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm text-cyan-400">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">Generating high-definition certificate...</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-3xl">
        <button
          onClick={handleDownloadPDF}
          disabled={!isReady || pdfGenerating}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-aveeranex-teal via-cyan-600 to-aveeranex-cyan text-white font-semibold shadow-lg hover:shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>{pdfGenerating ? 'Preparing PDF...' : 'Download Official PDF'}</span>
        </button>

        <button
          onClick={handleDownloadPNG}
          disabled={!isReady || downloading}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold border border-slate-600/70 hover:border-aveeranex-cyan/50 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Download className="w-5 h-5 text-aveeranex-cyan" />
          <span>{downloading ? 'Exporting...' : 'Download High-Res PNG'}</span>
        </button>

        <button
          onClick={handlePrint}
          disabled={!isReady}
          className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 hover:border-slate-500 shadow-sm transition-all"
          title="Print Certificate"
        >
          <Printer className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
