'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { SESSION_TYPES, WORKOUT_CONFIG } from '@/lib/data';
import type { WorkoutType } from '@/lib/data';

interface Props {
  sportType: WorkoutType;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  accentColorClass: string; // e.g. 'text-cycling'
}

export default function SessionTypeCard({ sportType, value, onChange, disabled, accentColorClass }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const types = SESSION_TYPES[sportType] || [];
  const libraryPath = WORKOUT_CONFIG[sportType].route + '/library';

  return (
    <div className="mb-4 bg-bg-elevated rounded-xl p-3 border border-border">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full py-2.5 px-3 bg-bg-card border border-border rounded-lg text-[14px] text-text disabled:opacity-50 appearance-none"
          >
            <option value="">{t.sessionType}</option>
            {types.map((st) => (
              <option key={st} value={st}>{t.sessionTypes[st]}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => router.push(libraryPath)}
          className={`shrink-0 text-[13px] font-bold ${accentColorClass} active:opacity-70 transition-opacity`}
        >
          {t.libraryInspireAction} +
        </button>
      </div>
    </div>
  );
}
