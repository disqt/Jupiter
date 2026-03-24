'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import type { WorkoutType } from '@/lib/data';
import { WORKOUT_CONFIG } from '@/lib/data';

interface Props {
  sportType: WorkoutType;
}

export default function CardioHeaderMenu({ sportType }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const libraryPath = WORKOUT_CONFIG[sportType].route + '/library';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center"
      >
        <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" className="text-text-muted">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="2" cy="14" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-11 bg-bg-card border border-border rounded-xl shadow-lg z-50 min-w-[200px] overflow-hidden animate-fadeIn">
          <button
            type="button"
            onClick={() => { setOpen(false); router.push(libraryPath); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] text-text hover:bg-bg-elevated transition-colors"
          >
            <span className="text-base">📖</span>
            {t.libraryMenuLabel}
          </button>
        </div>
      )}
    </div>
  );
}
