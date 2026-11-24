'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Download, ShieldCheck, Printer } from 'lucide-react';
import { UserCategory, AwardLevel } from '@/lib/types';

export interface CertificateSignatureItem {
  id?: string;
  name: string;
  title: string;
  imageUrl?: string;
  position: 'left' | 'center' | 'right';
}

export interface CertificateTemplateConfig {
  orientation?: 'landscape' | 'portrait';
  bgStyle?: 'classic' | 'gold' | 'silver' | 'bronze' | 'dark' | 'white' | 'custom';
  customBgColor?: string;
  fontStyle?: 'royal' | 'modern' | 'classic';
  accentColor?: string;
  titleColor?: string;
  bodyTextColor?: string;
  customTitle?: string;
  hostSignatory?: string;
  customLogoUrl?: string;
  logoPosition?: 'left' | 'center' | 'right' | 'top-left' | 'top-center' | 'top-right';
  logoXOffset?: number;
  logoYOffset?: number;
  logoScale?: number;
  secondaryLogoUrl?: string;
  secondaryLogoPosition?: 'left' | 'center' | 'right' | 'top-left' | 'top-center' | 'top-right';
  secondaryLogoScale?: number;
  customRibbonText?: string;
  customBodyText?: string;
  customFooterText?: string;
  textOffsetY?: number;
  signatures?: CertificateSignatureItem[];
  isCleanDraft?: boolean;
}

interface CertificateCanvasProps {
  participantName: string;
  teamName?: string;
  certificateId: string;
  category?: UserCategory;
  awardLevel?: AwardLevel;
  awardOrientation?: 'landscape' | 'portrait';
  runnerTheme?: 'white' | 'black';
  issueDate?: string;
  topicTitle?: string;
  college?: string;
  organization?: string;
  designation?: string;
  specialization?: string;
  presentedOn?: string;
  template?: CertificateTemplateConfig;
  onDownloadSuccess?: () => void;
}

/**
 * Auto-fits font size so long names/titles never overflow horizontally.
 */
/**
 * Checks whether a given HEX color is dark or light.
 */
function isColorDark(hex?: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  const c = hex.substring(1);
  const rgb = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
  if (isNaN(rgb)) return false;
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128;
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weightAndFamily: (size: number) => string
): number {
  let size = startSize;
  while (size > minSize) {
    ctx.font = weightAndFamily(size);
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  }
  return size;
}

/**
 * Wraps and draws centered multi-line text, returning the Y coordinate after the last line.
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  font: string,
  color: string
): number {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  let y = startY;
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

/**
 * Strips white / light gray backgrounds from any signature image so it renders cleanly
 * with 100% transparent ink on Gold, Dark, White, and Classic certificate canvases.
 */
function createTransparentSignature(
  img: HTMLImageElement,
  invertForDark: boolean
): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = img.width;
  off.height = img.height;
  const octx = off.getContext('2d');
  if (!octx) return off;

  octx.drawImage(img, 0, 0);
  try {
    const imgData = octx.getImageData(0, 0, off.width, off.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const a = d[i + 3];
      if (a === 0) continue;

      const brightness = (r + g + b) / 3;
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

      // Remove white / light-gray paper background
      if (brightness > 195 && maxDiff < 35) {
        d[i + 3] = 0;
      } else if (brightness > 165 && maxDiff < 25) {
        // Soft anti-aliased edge feathering
        d[i + 3] = Math.round(((195 - brightness) / 30) * a);
      } else if (invertForDark && brightness < 130) {
        // Make dark ink crisp light silver/white on Obsidian Black certificates
        d[i] = 244;
        d[i + 1] = 244;
        d[i + 2] = 245;
      }
    }
    octx.putImageData(imgData, 0, 0);
  } catch {
    // Fallback if cross-origin prevents pixel access
  }
  return off;
}

/**
 * Trims transparent or white outer padding from any logo image so it always
 * renders at exact, predictable dimensions regardless of source padding.
 */
function createTrimmedLogo(img: HTMLImageElement): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = img.width;
  off.height = img.height;
  const octx = off.getContext('2d');
  if (!octx) return off;

  octx.drawImage(img, 0, 0);
  try {
    const imgData = octx.getImageData(0, 0, off.width, off.height);
    const { data, width, height } = imgData;
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
        const brightness = (r + g + b) / 3;
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        const isWhiteOrPaper = brightness > 215 && maxDiff < 30;
        if (isWhiteOrPaper) {
          data[idx + 3] = 0;
        } else if (a > 40) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    octx.putImageData(imgData, 0, 0);
    if (maxX > minX && maxY > minY) {
      const tw = maxX - minX + 1;
      const th = maxY - minY + 1;
      const trimmed = document.createElement('canvas');
      trimmed.width = tw;
      trimmed.height = th;
      const tctx = trimmed.getContext('2d');
      if (tctx) {
        tctx.drawImage(off, minX, minY, tw, th, 0, 0, tw, th);
        return trimmed;
      }
    }
  } catch {
    // Fallback if cross-origin
  }
  return off;
}

export default function CertificateCanvas({
  participantName,
  teamName,
  certificateId,
  category = 'PARTICIPANT',
  awardLevel = 'PARTICIPATION',
  awardOrientation,
  runnerTheme = 'white',
  issueDate = '22 November 2026',
  topicTitle,
  college,
  organization,
  designation,
  specialization,
  presentedOn = "AVEERANEX INNOVATE - NOV'26",
  template,
  onDownloadSuccess,
}: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const isMentorJury = category === 'MENTOR_JURY';
  const isWinnerOrRunner = category === 'PARTICIPANT' && Boolean(awardLevel) && awardLevel !== 'PARTICIPATION';

  const orientation: 'landscape' | 'portrait' =
    template?.orientation || (isMentorJury ? 'portrait' : awardOrientation || 'landscape');
  const isPortrait = orientation === 'portrait';

  const resolveBgStyle = (): 'classic' | 'gold' | 'silver' | 'bronze' | 'dark' | 'white' | 'custom' => {
    if (template?.bgStyle) return template.bgStyle;
    if (isMentorJury || awardLevel === 'WINNER_1ST') return 'gold';
    if (awardLevel === 'WINNER_2ND') return 'silver';
    if (awardLevel === 'WINNER_3RD') return 'bronze';
    if (awardLevel === 'RUNNER_4TH' || awardLevel === 'RUNNER_5TH') {
      return runnerTheme === 'black' ? 'dark' : 'white';
    }
    return 'classic';
  };

  const bgStyle = resolveBgStyle();

  const fontStyle: 'royal' | 'modern' | 'classic' =
    template?.fontStyle || (isMentorJury || isWinnerOrRunner ? 'royal' : 'modern');

  const certWidth = isPortrait ? 2400 : bgStyle === 'classic' ? 3508 : 3200;
  const certHeight = isPortrait ? 3000 : bgStyle === 'classic' ? 2479 : 2150;

  const getThemeColor = () => {
    if (template?.accentColor) return template.accentColor;
    if (bgStyle === 'gold' || bgStyle === 'silver' || bgStyle === 'bronze') return '#09090B'; // Black visible font
    if (bgStyle === 'dark') return '#FFFFFF'; // Crisp white font on pure black
    if (bgStyle === 'white' && isWinnerOrRunner) return '#09090B'; // Crisp black font on pure white
    if (category === 'TECHNICAL_COORDINATOR') return '#0284C7';
    if (category === 'EVENT_COORDINATOR') return '#059669';
    if (category === 'ADMIN') return '#7C3AED';
    return '#067F92';
  };

  const themeColor = getThemeColor();

  const getFontFamily = (kind: 'display' | 'body') => {
    if (fontStyle === 'royal') {
      return kind === 'display'
        ? '"Cinzel", "Playfair Display", "Georgia", serif'
        : '"Playfair Display", "Georgia", "Times New Roman", serif';
    }
    if (fontStyle === 'classic') {
      return '"Georgia", "Times New Roman", serif';
    }
    return kind === 'display'
      ? '"Outfit", "Plus Jakarta Sans", sans-serif'
      : '"Plus Jakarta Sans", "Outfit", sans-serif';
  };

  useEffect(() => {
    const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://aveeranex-hackathon.vercel.app'}/verify/${certificateId}`;
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 280,
      color: {
        dark: bgStyle === 'dark' ? '#00B4D8' : '#09090B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code', err));
  }, [certificateId, bgStyle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = certWidth;
    canvas.height = certHeight;

    const loadImage = (src: string): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    const renderCertificate = async () => {
      setIsReady(false);

      const isHostConsole = Boolean(template);
      const isDarkBg =
        bgStyle === 'dark' || (Boolean(template?.customBgColor) && isColorDark(template?.customBgColor));

      // Clean Draft Mode: For event hosts & admin consoles, do NOT pre-load default director name or logo!
      const sigList: CertificateSignatureItem[] = isHostConsole
        ? template?.signatures || []
        : [
            {
              name: 'Dr. Rajesh Kumar',
              title: 'Director, AVEERANEX (OPC) PVT. LTD.',
              imageUrl: '/assets/signature.png',
              position: 'left',
            },
          ];

      // Top logo: in clean draft mode, only display if host explicitly uploaded customLogoUrl!
      const logoSrc = isHostConsole
        ? template?.customLogoUrl || null
        : (isDarkBg ? '/assets/logo.png' : '/assets/logo-dark-text.png');

      const secondaryLogoSrc = template?.secondaryLogoUrl || null;
      const aveeranexBottomLogoSrc = isDarkBg ? '/assets/logo.png' : '/assets/logo-dark-text.png';

      const [
        baseTemplateImg,
        logoImg,
        secondaryLogoImg,
        sealImg,
        qrImg,
        aveeranexBottomImg,
        ...loadedSigImgs
      ] = await Promise.all([
        bgStyle === 'classic' && !isPortrait && !isHostConsole
          ? loadImage('/assets/certificate-template.png')
          : Promise.resolve(null),
        logoSrc ? loadImage(logoSrc) : Promise.resolve(null),
        secondaryLogoSrc ? loadImage(secondaryLogoSrc) : Promise.resolve(null),
        !isHostConsole || (template?.signatures && template.signatures.length > 0)
          ? loadImage('/assets/seal.png')
          : Promise.resolve(null),
        qrDataUrl ? loadImage(qrDataUrl) : Promise.resolve(null),
        loadImage(aveeranexBottomLogoSrc),
        ...sigList.map((s) => loadImage(s.imageUrl || '/assets/signature.png')),
      ]);

      const centerX = certWidth / 2;
      const isMetallicBg = bgStyle === 'gold' || bgStyle === 'silver' || bgStyle === 'bronze';

      // 1. DRAW BACKGROUND
      if (template?.customBgColor) {
        ctx.fillStyle = template.customBgColor;
        ctx.fillRect(0, 0, certWidth, certHeight);

        const borderColor = template.titleColor || themeColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 14;
        ctx.strokeRect(80, 80, certWidth - 160, certHeight - 160);
        ctx.strokeStyle = template.accentColor || '#94A3B8';
        ctx.lineWidth = 4;
        ctx.strokeRect(116, 116, certWidth - 232, certHeight - 232);
      } else if (isMetallicBg) {
        const grad = ctx.createLinearGradient(0, 0, certWidth, certHeight);
        if (bgStyle === 'gold') {
          grad.addColorStop(0, '#F7DF8A');
          grad.addColorStop(0.25, '#E2B84A');
          grad.addColorStop(0.55, '#F5D67B');
          grad.addColorStop(0.85, '#C89B2B');
          grad.addColorStop(1, '#B3831E');
        } else if (bgStyle === 'silver') {
          grad.addColorStop(0, '#F1F5F9');
          grad.addColorStop(0.25, '#CBD5E1');
          grad.addColorStop(0.55, '#E2E8F0');
          grad.addColorStop(0.85, '#94A3B8');
          grad.addColorStop(1, '#64748B');
        } else {
          // Bronze
          grad.addColorStop(0, '#F3C9A4');
          grad.addColorStop(0.25, '#D99B66');
          grad.addColorStop(0.55, '#E8B88A');
          grad.addColorStop(0.85, '#B86B35');
          grad.addColorStop(1, '#8F4C1E');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, certWidth, certHeight);

        const sheen = ctx.createRadialGradient(centerX, certHeight * 0.38, 100, centerX, certHeight * 0.4, certWidth * 0.7);
        sheen.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
        sheen.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
        ctx.fillStyle = sheen;
        ctx.fillRect(0, 0, certWidth, certHeight);

        ctx.strokeStyle = '#09090B';
        ctx.lineWidth = 14;
        ctx.strokeRect(85, 85, certWidth - 170, certHeight - 170);

        ctx.strokeStyle = '#18181B';
        ctx.lineWidth = 4;
        ctx.strokeRect(118, 118, certWidth - 236, certHeight - 236);

        const cornerSize = 90;
        const corners = [
          [85, 85],
          [certWidth - 85 - cornerSize, 85],
          [85, certHeight - 85 - cornerSize],
          [certWidth - 85 - cornerSize, certHeight - 85 - cornerSize],
        ];
        ctx.strokeStyle = '#09090B';
        ctx.lineWidth = 8;
        corners.forEach(([cx, cy]) => {
          ctx.strokeRect(cx, cy, cornerSize, cornerSize);
        });
      } else if (bgStyle === 'dark') {
        // Pure Black Background with White Font
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, certWidth, certHeight);

        ctx.strokeStyle = template?.accentColor || '#FFFFFF';
        ctx.lineWidth = 12;
        ctx.strokeRect(80, 80, certWidth - 160, certHeight - 160);
        ctx.lineWidth = 3;
        ctx.strokeRect(112, 112, certWidth - 224, certHeight - 224);
      } else if (bgStyle === 'white' || (bgStyle === 'classic' && isPortrait)) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, certWidth, certHeight);

        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 14;
        ctx.strokeRect(80, 80, certWidth - 160, certHeight - 160);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 4;
        ctx.strokeRect(116, 116, certWidth - 232, certHeight - 232);
      } else if (baseTemplateImg) {
        ctx.drawImage(baseTemplateImg, 0, 0, certWidth, certHeight);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, certWidth, certHeight);
      }

      const primaryText = template?.titleColor || (isDarkBg ? '#FFFFFF' : '#09090B');
      const secondaryText = template?.bodyTextColor || (isDarkBg ? '#F1F5F9' : isMetallicBg ? '#09090B' : '#0F172A');
      const mutedText = isDarkBg ? '#E2E8F0' : isMetallicBg ? '#18181B' : '#334155';
      const accentText = template?.accentColor || (isMetallicBg ? '#000000' : isDarkBg ? '#FFFFFF' : themeColor);

      const displayFont = getFontFamily('display');
      const bodyFont = getFontFamily('body');

      // Helper to compute X position from 'left' | 'center' | 'right'
      const getSlotX = (pos: 'left' | 'center' | 'right') => {
        if (pos === 'left') return isPortrait ? 520 : 660;
        if (pos === 'right') return isPortrait ? certWidth - 520 : certWidth - 660;
        return centerX;
      };

      // Helper to draw all background-removed signatures + round stamp beside primary signature & designation
      const drawSignatures = (sigBaseY: number) => {
        if (sigList.length === 0) {
          if (isHostConsole) {
            ctx.textAlign = 'center';
            ctx.fillStyle = isDarkBg ? 'rgba(255, 255, 255, 0.45)' : 'rgba(15, 23, 42, 0.45)';
            ctx.font = `600 24px ${bodyFont}`;
            ctx.fillText('[ + Add Authorized Director & Faculty Signatures in Studio Panel ]', centerX, sigBaseY + 185);
          }
          return;
        }

        sigList.forEach((sig, idx) => {
          const pos = sig.position || (idx === 0 ? 'left' : idx === 1 ? 'right' : 'center');
          const sx = getSlotX(pos);
          const rawImg = loadedSigImgs[idx];
          if (rawImg) {
            const cleanCanvas = createTransparentSignature(rawImg, isDarkBg);
            const sigW = 370;
            const sigH = Math.min(155, (cleanCanvas.height / cleanCanvas.width) * sigW || 145);
            // Move signature down slightly so it rests cleanly right above the line
            ctx.drawImage(cleanCanvas, sx - sigW / 2, sigBaseY + 34, sigW, sigH);
          }

          // Signatory underline + Name + Title
          ctx.strokeStyle = mutedText;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx - 210, sigBaseY + 185);
          ctx.lineTo(sx + 210, sigBaseY + 185);
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.fillStyle = primaryText;
          ctx.font = `700 34px ${displayFont}`;
          ctx.fillText(sig.name || 'Authorized Signatory', sx, sigBaseY + 230);

          ctx.fillStyle = mutedText;
          ctx.font = `500 27px ${bodyFont}`;
          ctx.fillText(sig.title || 'Event Host', sx, sigBaseY + 278);

          // Move Round Stamp slightly inward towards the signature line & designation
          if (idx === 0 && sealImg) {
            const cleanSeal = createTransparentSignature(sealImg, isDarkBg);
            const stampSize = 230;
            const stampX = pos === 'right' ? sx - 185 - stampSize : sx + 185;
            const stampY = sigBaseY + 42;
            ctx.drawImage(cleanSeal, stampX, stampY, stampSize, stampSize);
          }
        });
      };

      // 2. DRAW CONTENT BASED ON ORIENTATION
      if (isPortrait) {
        // ==================== VERTICAL PORTRAIT LAYOUT (2400 x 3000) ====================
        const textOffsetY = template?.textOffsetY || 0;

        if (logoImg) {
          const trimmed = createTrimmedLogo(logoImg);
          const scaleFactor = template?.logoScale || 1.0;
          const maxLogoW = 980 * scaleFactor;
          const maxLogoH = 215 * scaleFactor;
          const scale = Math.min(maxLogoW / trimmed.width, maxLogoH / trimmed.height);
          const logoW = trimmed.width * scale;
          const logoH = trimmed.height * scale;
          let logoX = centerX - logoW / 2;
          if (template?.logoPosition === 'left' || template?.logoPosition === 'top-left') {
            logoX = 200;
          } else if (template?.logoPosition === 'right' || template?.logoPosition === 'top-right') {
            logoX = certWidth - 200 - logoW;
          }
          logoX += template?.logoXOffset || 0;
          const logoY = 160 + (template?.logoYOffset || 0) + (maxLogoH - logoH) / 2;
          ctx.drawImage(trimmed, logoX, logoY, logoW, logoH);
        }

        if (secondaryLogoImg) {
          const trimmedSec = createTrimmedLogo(secondaryLogoImg);
          const secScale = template?.secondaryLogoScale || template?.logoScale || 1.0;
          const maxSecW = 750 * secScale;
          const maxSecH = 200 * secScale;
          const sScale = Math.min(maxSecW / trimmedSec.width, maxSecH / trimmedSec.height);
          const secW = trimmedSec.width * sScale;
          const secH = trimmedSec.height * sScale;
          let secX = certWidth - 200 - secW;
          if (template?.secondaryLogoPosition === 'left' || template?.logoPosition === 'right') {
            secX = 200;
          }
          const secY = 160 + (template?.logoYOffset || 0) + (maxSecH - secH) / 2;
          ctx.drawImage(trimmedSec, secX, secY, secW, secH);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const headerTitle =
          template?.customTitle ||
          (isWinnerOrRunner
            ? 'CERTIFICATE OF APPRECIATION'
            : isMentorJury
            ? 'CERTIFICATE OF DISTINCTION'
            : category === 'TECHNICAL_COORDINATOR'
            ? 'CERTIFICATE OF TECHNICAL EXCELLENCE'
            : category === 'EVENT_COORDINATOR'
            ? 'CERTIFICATE OF LEADERSHIP'
            : 'CERTIFICATE OF PARTICIPATION');

        const headerFontSize = fitFontSize(
          ctx,
          headerTitle,
          1960,
          94,
          58,
          (sz) => `700 ${sz}px ${displayFont}`
        );
        const afterHeaderY = drawWrappedText(
          ctx,
          headerTitle,
          centerX,
          445 + textOffsetY,
          1960,
          headerFontSize + 14,
          `700 ${headerFontSize}px ${displayFont}`,
          primaryText
        );

        const divY = afterHeaderY + 14;
        ctx.strokeStyle = primaryText;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 540, divY);
        ctx.lineTo(centerX + 540, divY);
        ctx.stroke();

        let ribbonText = template?.customRibbonText || '';
        if (!ribbonText) {
          if (isMentorJury) ribbonText = 'HONOURABLE MENTOR & JURY PANEL';
          else if (category === 'TECHNICAL_COORDINATOR') ribbonText = 'TECHNICAL COORDINATOR';
          else if (category === 'EVENT_COORDINATOR') ribbonText = 'EVENT COORDINATOR';
          else if (category === 'ADMIN') ribbonText = 'EVENT HOST ADMINISTRATOR';
          else if (awardLevel === 'WINNER_1ST') ribbonText = '1ST PRIZE WINNER • GRAND CHAMPION';
          else if (awardLevel === 'WINNER_2ND') ribbonText = '2ND PRIZE WINNER • 1ST RUNNER-UP';
          else if (awardLevel === 'WINNER_3RD') ribbonText = '3RD PRIZE WINNER • 2ND RUNNER-UP';
          else if (awardLevel === 'RUNNER_4TH') ribbonText = '4TH LEVEL RUNNER-UP';
          else if (awardLevel === 'RUNNER_5TH') ribbonText = '5TH LEVEL RUNNER-UP';
          else ribbonText = 'OFFICIAL PARTICIPANT';
        }

        drawWrappedText(
          ctx,
          ribbonText,
          centerX,
          divY + 84 + textOffsetY,
          1960,
          58,
          `700 50px ${displayFont}`,
          primaryText
        );

        ctx.fillStyle = secondaryText;
        ctx.font = `600 44px ${bodyFont}`;
        ctx.fillText('THIS CERTIFICATE IS PROUDLY PRESENTED TO', centerX, 945 + textOffsetY);

        const nameDisplay = participantName || 'Recipient Name';
        const nameSize = fitFontSize(
          ctx,
          nameDisplay,
          1960,
          138,
          76,
          (sz) => `800 ${sz}px ${displayFont}`
        );
        ctx.fillStyle = accentText;
        ctx.font = `800 ${nameSize}px ${displayFont}`;
        ctx.fillText(nameDisplay, centerX, 1125 + textOffsetY);

        ctx.strokeStyle = primaryText;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 680, 1235 + textOffsetY);
        ctx.lineTo(centerX + 680, 1235 + textOffsetY);
        ctx.stroke();

        // Flowing dynamic body section (larger legible typography, balanced gaps)
        let flowY = 1385 + textOffsetY;
        if (isMentorJury && !template?.customBodyText) {
          flowY = drawWrappedText(
            ctx,
            'Thank you for serving as Mentor / Jury for',
            centerX,
            flowY,
            1900,
            62,
            `600 48px ${bodyFont}`,
            primaryText
          );
          flowY += 28;
          flowY = drawWrappedText(
            ctx,
            presentedOn,
            centerX,
            flowY,
            1900,
            70,
            `800 58px ${displayFont}`,
            primaryText
          );

          if (designation || organization) {
            flowY += 38;
            flowY = drawWrappedText(
              ctx,
              [designation, organization].filter(Boolean).join(' • '),
              centerX,
              flowY,
              1900,
              58,
              `600 44px ${bodyFont}`,
              secondaryText
            );
          }
          if (specialization) {
            flowY += 22;
            flowY = drawWrappedText(
              ctx,
              `Domain Expertise: ${specialization}`,
              centerX,
              flowY,
              1900,
              54,
              `500 40px ${bodyFont}`,
              mutedText
            );
          }
        } else {
          const roleStatement =
            template?.customBodyText ||
            (isWinnerOrRunner
              ? 'in recognition of outstanding innovation, creativity, and excellence at'
              : category === 'TECHNICAL_COORDINATOR'
              ? 'for exemplary technical coordination and operations at'
              : category === 'EVENT_COORDINATOR'
              ? 'for dedicated organizing leadership as Event Coordinator at'
              : category === 'ADMIN'
              ? 'for institutional leadership in hosting'
              : 'in recognition of active participation and innovation at');

          flowY = drawWrappedText(
            ctx,
            roleStatement,
            centerX,
            flowY,
            1900,
            62,
            `600 46px ${bodyFont}`,
            secondaryText
          );
          flowY += 26;
          flowY = drawWrappedText(
            ctx,
            presentedOn,
            centerX,
            flowY,
            1900,
            68,
            `800 56px ${displayFont}`,
            primaryText
          );

          if (teamName && category === 'PARTICIPANT') {
            flowY += 32;
            flowY = drawWrappedText(
              ctx,
              `Team: ${teamName}`,
              centerX,
              flowY,
              1900,
              58,
              `700 46px ${bodyFont}`,
              secondaryText
            );
          }
          if (college || organization) {
            flowY += 20;
            flowY = drawWrappedText(
              ctx,
              college || organization || '',
              centerX,
              flowY,
              1900,
              56,
              `600 42px ${bodyFont}`,
              mutedText
            );
          }
          if (topicTitle && category === 'PARTICIPANT') {
            flowY += 20;
            flowY = drawWrappedText(
              ctx,
              `Project: "${topicTitle}"`,
              centerX,
              flowY,
              1900,
              54,
              `500 40px ${bodyFont}`,
              secondaryText
            );
          }
        }

        const dateY = Math.max(flowY + 55, 1960);
        ctx.textAlign = 'center';
        ctx.fillStyle = mutedText;
        ctx.font = `600 38px ${bodyFont}`;
        ctx.fillText(`Issued on ${issueDate}`, centerX, dateY);

        // Signatures row with Round Stamp placed directly beside primary signature & designation
        drawSignatures(2150);

        // QR Code neatly at bottom right below signatures row
        if (qrImg) {
          const qrX = certWidth - 385;
          const qrY = 2565;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(qrX - 10, qrY - 10, 200, 200);
          ctx.drawImage(qrImg, qrX, qrY, 180, 180);
          ctx.textAlign = 'center';
          ctx.fillStyle = mutedText;
          ctx.font = `700 20px ${bodyFont}`;
          ctx.fillText('SCAN TO VERIFY', qrX + 90, qrY + 215);
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = mutedText;
        ctx.font = `600 26px monospace`;
        ctx.fillText(`Certificate ID: ${certificateId}`, 185, 2650);
        ctx.fillText(`Verify: aveeranex-hackathon.vercel.app/verify/${certificateId}`, 185, 2700);

        if (template?.customFooterText) {
          flowY += 15;
          drawWrappedText(
            ctx,
            template.customFooterText,
            centerX,
            flowY,
            1900,
            46,
            `600 32px ${bodyFont}`,
            mutedText
          );
        }

        // Bottom Brand Attribution for Event & Admin Host Certificates
        if (template) {
          const badgeLogo = aveeranexBottomImg;
          const badgeH = 40;
          const badgeW = badgeLogo ? Math.min(130, (badgeLogo.width / badgeLogo.height) * badgeH) : 40;
          const brandTotalW = badgeW + 430;
          const brandX = centerX - brandTotalW / 2;
          const badgeY = 2860;

          if (badgeLogo) {
            const trimmed = createTrimmedLogo(badgeLogo);
            ctx.drawImage(trimmed, brandX, badgeY - badgeH / 2, badgeW, badgeH);
          }
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = mutedText;
          ctx.font = `700 22px ${bodyFont}`;
          ctx.fillText('Powered by AVEERANEX (OPC) PRIVATE LIMITED', brandX + badgeW + 14, badgeY);
        }
      } else {
        // ==================== HORIZONTAL LANDSCAPE LAYOUT (3508 x 2479) ====================
        if (bgStyle !== 'classic' || template?.customLogoUrl) {
          const textOffsetY = template?.textOffsetY || 0;

          if (logoImg) {
            const trimmed = createTrimmedLogo(logoImg);
            const scaleFactor = template?.logoScale || 1.0;
            const maxLogoW = 1060 * scaleFactor;
            const maxLogoH = 215 * scaleFactor;
            const scale = Math.min(maxLogoW / trimmed.width, maxLogoH / trimmed.height);
            const logoW = trimmed.width * scale;
            const logoH = trimmed.height * scale;
            let logoX = centerX - logoW / 2;
            if (template?.logoPosition === 'left' || template?.logoPosition === 'top-left') {
              logoX = 240;
            } else if (template?.logoPosition === 'right' || template?.logoPosition === 'top-right') {
              logoX = certWidth - 240 - logoW;
            }
            logoX += template?.logoXOffset || 0;
            const logoY = 135 + (template?.logoYOffset || 0) + (maxLogoH - logoH) / 2;
            if (bgStyle === 'classic' && template?.customLogoUrl) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(centerX - 550, 120, 1100, 230);
            }
            ctx.drawImage(trimmed, logoX, logoY, logoW, logoH);
          }

          if (secondaryLogoImg) {
            const trimmedSec = createTrimmedLogo(secondaryLogoImg);
            const secScale = template?.secondaryLogoScale || template?.logoScale || 1.0;
            const maxSecW = 800 * secScale;
            const maxSecH = 200 * secScale;
            const sScale = Math.min(maxSecW / trimmedSec.width, maxSecH / trimmedSec.height);
            const secW = trimmedSec.width * sScale;
            const secH = trimmedSec.height * sScale;
            let secX = certWidth - 240 - secW;
            if (template?.secondaryLogoPosition === 'left' || template?.logoPosition === 'right') {
              secX = 240;
            }
            const secY = 135 + (template?.logoYOffset || 0) + (maxSecH - secH) / 2;
            ctx.drawImage(trimmedSec, secX, secY, secW, secH);
          }

          if (bgStyle !== 'classic') {
            const customHead =
              template?.customTitle ||
              (isWinnerOrRunner
                ? 'CERTIFICATE OF APPRECIATION'
                : category === 'TECHNICAL_COORDINATOR'
                ? 'CERTIFICATE OF TECHNICAL COORDINATION'
                : category === 'EVENT_COORDINATOR'
                ? 'CERTIFICATE OF EVENT COORDINATION'
                : category === 'ADMIN'
                ? 'CERTIFICATE OF HOSTING LEADERSHIP'
                : 'CERTIFICATE OF PARTICIPATION');

            const headSize = fitFontSize(
              ctx,
              customHead,
              2700,
              98,
              60,
              (sz) => `800 ${sz}px ${displayFont}`
            );
            drawWrappedText(
              ctx,
              customHead,
              centerX,
              415,
              2700,
              headSize + 14,
              `800 ${headSize}px ${displayFont}`,
              primaryText
            );

            ctx.textAlign = 'center';
            ctx.fillStyle = secondaryText;
            ctx.font = `600 44px ${bodyFont}`;
            ctx.fillText('PROUDLY PRESENTED TO', centerX, 625);
          }
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let ribbonText = template?.customRibbonText || '';
        if (!ribbonText) {
          if (category === 'TECHNICAL_COORDINATOR') {
            ribbonText = 'HONOUR OF EXCELLENCE • TECHNICAL COORDINATOR';
          } else if (category === 'EVENT_COORDINATOR') {
            ribbonText = 'HONOUR OF LEADERSHIP • EVENT COORDINATOR';
          } else if (category === 'ADMIN') {
            ribbonText = 'HACKATHON HOSTING LEADERSHIP • EVENT ADMIN';
          } else if (category === 'PARTICIPANT') {
            if (awardLevel === 'WINNER_1ST') ribbonText = '1ST PRIZE WINNER • GRAND CHAMPION';
            else if (awardLevel === 'WINNER_2ND') ribbonText = '2ND PRIZE WINNER • 1ST RUNNER-UP';
            else if (awardLevel === 'WINNER_3RD') ribbonText = '3RD PRIZE WINNER • 2ND RUNNER-UP';
            else if (awardLevel === 'RUNNER_4TH') ribbonText = '4TH LEVEL RUNNER-UP • FINALIST';
            else if (awardLevel === 'RUNNER_5TH') ribbonText = '5TH LEVEL RUNNER-UP • COMMENDATION';
          }
        }

        if (ribbonText) {
          const bannerWidth = 1820;
          const bannerHeight = 94;
          const bannerX = centerX - bannerWidth / 2;
          const bannerY = bgStyle === 'classic' ? 725 : 715;

          ctx.fillStyle = isMetallicBg ? 'rgba(0,0,0,0.08)' : themeColor + '18';
          ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);
          ctx.strokeStyle = accentText;
          ctx.lineWidth = 3;
          ctx.strokeRect(bannerX, bannerY, bannerWidth, bannerHeight);

          ctx.fillStyle = accentText;
          ctx.font = `700 50px ${displayFont}`;
          ctx.fillText(ribbonText, centerX, bannerY + 47);
        }

        // Recipient Name (auto-fitted, larger bold display)
        const nameY = bgStyle === 'classic' ? 1125 : 975;
        const nameDisplay = participantName || 'Recipient Name';
        const nameSize = fitFontSize(
          ctx,
          nameDisplay,
          2600,
          134,
          74,
          (sz) => `800 ${sz}px ${displayFont}`
        );
        ctx.fillStyle = accentText;
        ctx.font = `800 ${nameSize}px ${displayFont}`;
        ctx.fillText(nameDisplay, centerX, nameY);

        // Dynamic wrapped details (zero overlap, tighter balanced gaps)
        let flowY = bgStyle === 'classic' ? 1265 : 1140;
        const maxBodyW = 2480;

        if (template?.customBodyText) {
          flowY = drawWrappedText(
            ctx,
            template.customBodyText,
            centerX,
            flowY,
            maxBodyW,
            56,
            `500 40px ${bodyFont}`,
            secondaryText
          );
          flowY += 16;
          flowY = drawWrappedText(
            ctx,
            presentedOn,
            centerX,
            flowY,
            maxBodyW,
            58,
            `700 44px ${displayFont}`,
            primaryText
          );

          if (teamName || college || organization) {
            flowY += 14;
            drawWrappedText(
              ctx,
              [teamName ? `Team: ${teamName}` : '', college || organization].filter(Boolean).join(' • '),
              centerX,
              flowY,
              maxBodyW,
              50,
              `600 36px ${bodyFont}`,
              mutedText
            );
          }
        } else if (category === 'TECHNICAL_COORDINATOR') {
          flowY = drawWrappedText(
            ctx,
            'for exemplary technical leadership, infrastructure management, and service as',
            centerX,
            flowY,
            maxBodyW,
            54,
            `500 40px ${bodyFont}`,
            secondaryText
          );
          flowY += 12;
          flowY = drawWrappedText(
            ctx,
            'TECHNICAL COORDINATOR',
            centerX,
            flowY,
            maxBodyW,
            58,
            `700 46px ${displayFont}`,
            accentText
          );
          flowY += 12;
          flowY = drawWrappedText(
            ctx,
            `at ${presentedOn}`,
            centerX,
            flowY,
            maxBodyW,
            54,
            `600 38px ${bodyFont}`,
            primaryText
          );
          if (college) {
            flowY += 10;
            drawWrappedText(ctx, college, centerX, flowY, maxBodyW, 48, `500 34px ${bodyFont}`, mutedText);
          }
        } else if (category === 'EVENT_COORDINATOR') {
          flowY = drawWrappedText(
            ctx,
            'in sincere appreciation of outstanding organizing leadership and dedication as',
            centerX,
            flowY,
            maxBodyW,
            54,
            `500 40px ${bodyFont}`,
            secondaryText
          );
          flowY += 12;
          flowY = drawWrappedText(
            ctx,
            'EVENT COORDINATOR',
            centerX,
            flowY,
            maxBodyW,
            58,
            `700 46px ${displayFont}`,
            accentText
          );
          flowY += 12;
          flowY = drawWrappedText(
            ctx,
            `at ${presentedOn}`,
            centerX,
            flowY,
            maxBodyW,
            54,
            `600 38px ${bodyFont}`,
            primaryText
          );
          if (college) {
            flowY += 10;
            drawWrappedText(ctx, college, centerX, flowY, maxBodyW, 48, `500 34px ${bodyFont}`, mutedText);
          }
        } else if (category === 'ADMIN') {
          flowY = drawWrappedText(
            ctx,
            'in recognition of institutional partnership and excellence in hosting',
            centerX,
            flowY,
            maxBodyW,
            54,
            `500 40px ${bodyFont}`,
            secondaryText
          );
          flowY += 12;
          flowY = drawWrappedText(
            ctx,
            'HACKATHON EVENT HOST',
            centerX,
            flowY,
            maxBodyW,
            58,
            `700 46px ${displayFont}`,
            accentText
          );
          flowY += 12;
          flowY = drawWrappedText(
            ctx,
            presentedOn,
            centerX,
            flowY,
            maxBodyW,
            54,
            `600 38px ${bodyFont}`,
            primaryText
          );
          if (organization) {
            flowY += 10;
            drawWrappedText(ctx, organization, centerX, flowY, maxBodyW, 48, `500 34px ${bodyFont}`, mutedText);
          }
        } else {
          if (awardLevel && awardLevel !== 'PARTICIPATION') {
            flowY = drawWrappedText(
              ctx,
              'in recognition of outstanding innovation, creativity, and excellence at',
              centerX,
              flowY,
              maxBodyW,
              60,
              `600 45px ${bodyFont}`,
              secondaryText
            );
            flowY += 18;
            flowY = drawWrappedText(
              ctx,
              presentedOn,
              centerX,
              flowY,
              maxBodyW,
              66,
              `800 52px ${displayFont}`,
              primaryText
            );
            flowY += 18;
            flowY = drawWrappedText(
              ctx,
              `Team: ${teamName || 'Innovators'}${college ? ` • ${college}` : ''}`,
              centerX,
              flowY,
              maxBodyW,
              58,
              `600 42px ${bodyFont}`,
              primaryText
            );
            if (topicTitle) {
              flowY += 14;
              flowY = drawWrappedText(
                ctx,
                `Project: "${topicTitle}"`,
                centerX,
                flowY,
                maxBodyW,
                54,
                `500 38px ${bodyFont}`,
                secondaryText
              );
            }
            flowY += 20;
            ctx.textAlign = 'center';
            ctx.fillStyle = mutedText;
            ctx.font = `600 34px ${bodyFont}`;
            ctx.fillText(`Issued on ${issueDate}`, centerX, Math.min(flowY, 1660));
          } else {
            flowY = drawWrappedText(
              ctx,
              `Team: ${teamName || 'Innovators'}`,
              centerX,
              flowY + 25,
              maxBodyW,
              58,
              `700 46px ${displayFont}`,
              accentText
            );
            if (college) {
              flowY += 14;
              drawWrappedText(
                ctx,
                college,
                centerX,
                flowY,
                maxBodyW,
                52,
                `500 38px ${bodyFont}`,
                secondaryText
              );
            }
          }
        }

        // Draw background-removed signature(s) + Round Stamp beside primary signature & designation!
        if (bgStyle !== 'classic') {
          drawSignatures(1545);

          ctx.textAlign = 'left';
          ctx.fillStyle = mutedText;
          ctx.font = `600 24px monospace`;
          ctx.fillText(`Certificate ID: ${certificateId}`, 220, 1915);
          ctx.fillText(`Verification: aveeranex-hackathon.vercel.app/verify/${certificateId}`, 220, 1955);

          // Bottom Brand Attribution for Event & Admin Host Certificates
          if (template) {
            const badgeLogo = aveeranexBottomImg;
            const badgeH = 36;
            const badgeW = badgeLogo ? Math.min(120, (badgeLogo.width / badgeLogo.height) * badgeH) : 36;
            const brandTotalW = badgeW + 410;
            const brandX = centerX - brandTotalW / 2;
            const badgeY = 2040;

            if (badgeLogo) {
              const trimmed = createTrimmedLogo(badgeLogo);
              ctx.drawImage(trimmed, brandX, badgeY - badgeH / 2, badgeW, badgeH);
            }
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = mutedText;
            ctx.font = `700 22px ${bodyFont}`;
            ctx.fillText('Powered by AVEERANEX (OPC) PRIVATE LIMITED', brandX + badgeW + 12, badgeY);
          }

          if (qrImg) {
            const qrX = certWidth - 375;
            const qrY = 1715;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(qrX - 10, qrY - 10, 185, 185);
            ctx.drawImage(qrImg, qrX, qrY, 165, 165);
            ctx.textAlign = 'center';
            ctx.fillStyle = mutedText;
            ctx.font = `700 18px ${bodyFont}`;
            ctx.fillText('SCAN TO VERIFY', qrX + 82, qrY + 195);
          }
        } else {
          if (template?.signatures && template.signatures.length > 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(1050, 1740, 2000, 380);
            drawSignatures(1780);
          }

          ctx.textAlign = 'left';
          ctx.fillStyle = mutedText;
          ctx.font = `600 24px monospace`;
          ctx.fillText(`Certificate ID: ${certificateId}`, 360, 2195);
          ctx.fillText(`Verification: aveeranex-hackathon.vercel.app/verify/${certificateId}`, 360, 2235);

          if (template) {
            const badgeLogo = aveeranexBottomImg;
            const badgeH = 36;
            const badgeW = badgeLogo ? Math.min(120, (badgeLogo.width / badgeLogo.height) * badgeH) : 36;
            const brandTotalW = badgeW + 410;
            const brandX = centerX - brandTotalW / 2;
            const badgeY = 2340;

            if (badgeLogo) {
              const trimmed = createTrimmedLogo(badgeLogo);
              ctx.drawImage(trimmed, brandX, badgeY - badgeH / 2, badgeW, badgeH);
            }
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = mutedText;
            ctx.font = `700 22px ${bodyFont}`;
            ctx.fillText('Powered by AVEERANEX (OPC) PRIVATE LIMITED', brandX + badgeW + 12, badgeY);
          }

          if (qrImg) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(3162, 1952, 176, 176);
            ctx.drawImage(qrImg, 3170, 1960, 160, 160);
            ctx.textAlign = 'center';
            ctx.fillStyle = mutedText;
            ctx.font = `700 18px ${bodyFont}`;
            ctx.fillText('SCAN TO VERIFY', 3250, 2148);
          }
        }
      }

      setIsReady(true);
    };

    renderCertificate();
  }, [
    participantName,
    teamName,
    certificateId,
    category,
    awardLevel,
    issueDate,
    qrDataUrl,
    presentedOn,
    organization,
    designation,
    specialization,
    college,
    topicTitle,
    themeColor,
    orientation,
    bgStyle,
    fontStyle,
    template?.customTitle,
    template?.hostSignatory,
    template?.accentColor,
    template?.customLogoUrl,
    template?.logoPosition,
    template?.customRibbonText,
    template?.customBodyText,
    template?.signatures,
    template?.titleColor,
    template?.bodyTextColor,
    template?.customBgColor,
    template?.logoXOffset,
    template?.logoYOffset,
    template?.logoScale,
    template?.secondaryLogoUrl,
    template?.secondaryLogoPosition,
    template?.secondaryLogoScale,
    template?.customFooterText,
    template?.textOffsetY,
    template?.isCleanDraft,
    certWidth,
    certHeight,
    isPortrait,
    isMentorJury,
  ]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const safeName = participantName.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `AVEERANEX_${category}_${safeName}_Certificate.png`;
      link.href = dataUrl;
      link.click();
      if (onDownloadSuccess) onDownloadSuccess();
    } catch (err) {
      console.error('Download PNG failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPdfGenerating(true);
    try {
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfW = isPortrait ? 210 : 297;
      const pdfH = Math.round((certHeight / certWidth) * pdfW);
      const pdf = new jsPDF({
        orientation: isPortrait ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfW, pdfH],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');
      const safeName = participantName.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`AVEERANEX_${category}_${safeName}_Certificate.pdf`);
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
            @page { size: ${isPortrait ? 'portrait' : 'landscape'}; margin: 0; }
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
      <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-aveeranex-border/60 bg-aveeranex-card/40 backdrop-blur-md p-3 md:p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-aveeranex-border/40 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs md:text-sm font-semibold tracking-wide text-slate-200 uppercase">
              {isMentorJury
                ? '👑 Vertical Royal Gold Mentor / Jury Certificate'
                : category === 'TECHNICAL_COORDINATOR'
                ? '⚙️ Technical Coordinator Certificate'
                : category === 'EVENT_COORDINATOR'
                ? '📋 Event Coordinator Certificate'
                : category === 'ADMIN'
                ? '🛡️ Host Admin Credential'
                : awardLevel && awardLevel !== 'PARTICIPATION'
                ? `🏆 ${awardLevel.replace(/_/g, ' ')} Certificate`
                : 'Official Verified Participant Certificate'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono uppercase">
              {isPortrait ? 'Vertical (A4 Portrait)' : 'Horizontal (A4 Landscape)'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-aveeranex-teal/20 text-aveeranex-cyan border border-aveeranex-cyan/30 font-mono">
              {certificateId}
            </span>
          </div>
        </div>

        <div
          style={{ aspectRatio: `${certWidth} / ${certHeight}` }}
          className={`relative mx-auto rounded-xl overflow-hidden shadow-inner bg-slate-900 border border-slate-700/50 ${
            isPortrait ? 'max-w-md w-full' : 'max-w-4xl w-full'
          }`}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block"
            style={{ imageRendering: 'auto' }}
          />

          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm text-cyan-400">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">Rendering high-definition certificate...</p>
            </div>
          )}
        </div>
      </div>

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
