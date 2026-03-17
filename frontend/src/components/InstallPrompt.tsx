'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function isDismissed(): boolean {
  try {
    const val = localStorage.getItem(DISMISS_KEY);
    if (!val) return false;
    return Date.now() - parseInt(val, 10) < DISMISS_DURATION;
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

function isIosSafari(): boolean {
  return isIos() && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS/.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const [isIosPrompt, setIsIosPrompt] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    // iOS Safari: show manual instructions
    if (isIosSafari()) {
      setIsIosPrompt(true);
      setShow(true);
      return;
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {});
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    deferredPrompt.current = null;
  };

  const handleDismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-[72px] lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-[360px] z-50 animate-fadeIn">
      <div className="bg-bg-card border border-border rounded-card p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#333] flex items-center justify-content overflow-hidden flex-shrink-0">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon-192.png`}
              alt="Jupiter Tracker"
              width={40}
              height={40}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text leading-tight">
              {t.installPrompt}
            </p>
            {isIosPrompt && (
              <p className="text-[12px] text-text-secondary mt-1 leading-snug">
                {t.installIosInstructions}
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-text-muted hover:text-text-secondary transition-colors p-1 -mt-1 -mr-1 flex-shrink-0"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>
        {!isIosPrompt && (
          <button
            onClick={handleInstall}
            className="mt-3 w-full py-2.5 bg-accent text-bg-card text-[13px] font-bold rounded-sm transition-all active:scale-[0.97]"
          >
            {t.install}
          </button>
        )}
      </div>
    </div>
  );
}
