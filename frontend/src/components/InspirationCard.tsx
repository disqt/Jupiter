'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { WORKOUT_CONFIG } from '@/lib/data';
import type { WorkoutType } from '@/lib/data';

interface Props {
  sportType: WorkoutType;
  accentColor: string;
  hasData: boolean;
  workoutId?: string | null;
}

export default function InspirationCard({ sportType, accentColor, hasData, workoutId }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const storageKey = `library-card-dismissed-${sportType}`;

  useEffect(() => {
    if (sessionStorage.getItem(storageKey)) setDismissed(true);
  }, [storageKey]);

  if (workoutId || hasData || dismissed) return null;

  const libraryPath = WORKOUT_CONFIG[sportType].route + '/library';
  const sportName = t.librarySportNames[sportType] || sportType;

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem(storageKey, '1');
    setDismissed(true);
  };

  return (
    <div
      onClick={() => router.push(libraryPath)}
      className="relative mb-5 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, #1a2332 0%, #1a1b22 100%)',
        borderColor: '#2a3a4a',
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-text-muted text-xs hover:bg-bg-elevated"
      >
        ✕
      </button>
      <div className="flex items-center gap-3">
        <span className="text-xl">💡</span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-text">{t.libraryInspireTitle}</div>
          <div className="text-[11px] text-text-muted mt-0.5">{t.libraryInspireSubtitle(sportName)}</div>
        </div>
        <span className={`text-[13px] font-medium ${accentColor}`}>{t.libraryInspireAction} →</span>
      </div>
    </div>
  );
}
