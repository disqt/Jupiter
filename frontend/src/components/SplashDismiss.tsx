'use client';

import { useEffect } from 'react';

export default function SplashDismiss() {
  useEffect(() => {
    // Small delay so the first paint has time to render content behind the splash
    const t = setTimeout(() => {
      (window as unknown as { __splashReady?: () => void }).__splashReady?.();
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return null;
}
