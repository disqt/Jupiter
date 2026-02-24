import type { Metadata, Viewport } from 'next';
import { DM_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Jupiter Tracker',
  description: 'Track your workouts',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} font-sans bg-bg text-text min-h-dvh overflow-x-hidden`}>
        <div className="flex min-h-dvh">
          <BottomNav />
          <main className="flex-1 pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
