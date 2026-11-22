import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://aveeranex-hackathon.vercel.app'),
  title: 'AVEERANEX INNOVATE ONLINE HACKATHON 2026 | Official Portal',
  description:
    'Official Portal for AVEERANEX INNOVATE ONLINE HACKATHON Nov 2026. Participant registration, presentation verification, super admin approvals, and verified digital certificate issuance.',
  keywords: [
    'Aveeranex',
    'Hackathon 2026',
    'Aveeranex Innovate',
    'Hackathon Certificate',
    'Online Hackathon',
    'Aveeranex Learn',
  ],
  icons: {
    icon: '/assets/icon.png',
    shortcut: '/favicon.ico',
    apple: '/assets/icon.png',
  },
  openGraph: {
    title: 'AVEERANEX INNOVATE ONLINE HACKATHON 2026 | Official Portal',
    description:
      'Official Portal for AVEERANEX INNOVATE ONLINE HACKATHON Nov 2026. Participant registration, presentation verification, super admin approvals, and verified digital certificate issuance.',
    url: 'https://aveeranex-hackathon.vercel.app',
    siteName: 'AVEERANEX INNOVATE',
    images: [
      {
        url: '/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AVEERANEX INNOVATE ONLINE HACKATHON 2026',
      },
      {
        url: '/assets/og-square.png',
        width: 600,
        height: 600,
        alt: 'AVEERANEX Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AVEERANEX INNOVATE ONLINE HACKATHON 2026 | Official Portal',
    description:
      'Official Portal for AVEERANEX INNOVATE ONLINE HACKATHON Nov 2026. Participant registration, presentation verification, and verified digital certificate issuance.',
    images: ['/assets/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen antialiased selection:bg-aveeranex-cyan selection:text-black">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
