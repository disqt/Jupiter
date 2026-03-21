import type { Metadata, Viewport } from 'next';
import { DM_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import Providers from '@/components/Providers';
import InstallPrompt from '@/components/InstallPrompt';

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

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'Jupiter Tracker',
  description: 'Multi-Sports Made Simple',
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Jupiter Tracker',
  },
  icons: {
    icon: [
      { url: `${basePath}/favicon.svg`, type: 'image/svg+xml' },
      { url: `${basePath}/favicon.png`, sizes: '32x32', type: 'image/png' },
    ],
    apple: `${basePath}/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0e0f11',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} font-sans bg-bg text-text min-h-dvh overflow-x-hidden`}>
        {/* Splash screen — pure inline CSS, renders before any JS */}
        <div id="splash" aria-hidden="true" style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#0e0f11',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.4s ease, visibility 0.4s ease',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}/logo-horizontal-light.svg`}
            alt=""
            width={220}
            height={99}
            style={{ position: 'relative' }}
          />
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var s=document.getElementById('splash');
            if(!s)return;
            window.__splashReady=function(){
              s.style.opacity='0';
              s.style.visibility='hidden';
              setTimeout(function(){s.remove()},400);
            };
          })();
        `}} />
        <Providers>
          <div className="flex min-h-dvh">
            <BottomNav />
            <main className="flex-1 pb-20 lg:pb-0">
              {children}
            </main>
          </div>
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
