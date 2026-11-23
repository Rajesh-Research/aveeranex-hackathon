import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://aveeranex-hackathon.vercel.app'),
  title: 'AVEERANEX HACKATHON PLATFORM | Official Portal',
  description:
    'Welcome to the official portal for participants / corporates / colleges / universities to host their hackathons and competitions.',
  keywords: [
    'Aveeranex',
    'Hackathon Platform',
    'Aveeranex Hackathon',
    'Aveeranex Innovate',
    'Host Hackathon',
    'Hackathon Certificate',
    'Online Hackathon',
    'Aveeranex Learn',
  ],
  icons: {
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
  openGraph: {
    title: 'AVEERANEX HACKATHON PLATFORM | Official Portal',
    description:
      'Welcome to the official portal for participants / corporates / colleges / universities to host their hackathons and competitions.',
    url: 'https://aveeranex-hackathon.vercel.app',
    siteName: 'AVEERANEX HACKATHON PLATFORM',
    images: [
      {
        url: '/assets/logo.png',
        width: 1017,
        height: 167,
        alt: 'AVEERANEX HACKATHON PLATFORM Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AVEERANEX HACKATHON PLATFORM | Official Portal',
    description:
      'Welcome to the official portal for participants / corporates / colleges / universities to host their hackathons and competitions.',
    images: ['/assets/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen antialiased bg-black text-white selection:bg-aveeranex-cyan selection:text-black">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
