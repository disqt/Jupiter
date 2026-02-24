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
  title: 'Sport Tracker',
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
      <body className={`${dmSans.variable} ${instrumentSerif.variable} font-sans`}
        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
        <main className="max-w-[430px] mx-auto relative pb-[80px]">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
