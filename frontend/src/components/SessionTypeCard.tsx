'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { SESSION_TYPES, SESSION_TYPE_COLORS, WORKOUT_CONFIG } from '@/lib/data';
import type { WorkoutType } from '@/lib/data';

const SPORT_ACCENT: Record<string, string> = {
  velo: '#3b9eff',
  course: '#34d399',
  natation: '#06b6d4',
  marche: '#f59e0b',
};

interface Props {
  sportType: WorkoutType;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  accentColorClass: string;
}

export default function SessionTypeCard({ sportType, value, onChange, disabled, accentColorClass }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const types = SESSION_TYPES[sportType] || [];
  const libraryPath = WORKOUT_CONFIG[sportType].route + '/library';
  const accent = SPORT_ACCENT[sportType] || '#c9a96e';
  const selectedColors = value ? SESSION_TYPE_COLORS[value] : null;

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        background: selectedColors
          ? `linear-gradient(135deg, ${selectedColors.bg} 0%, #12121a 80%)`
          : `linear-gradient(135deg, ${accent}08 0%, #12121a 80%)`,
        border: `1px solid ${selectedColors ? selectedColors.text + '18' : '#2a2b32'}`,
      }}
    >
      {/* Accent top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-colors duration-300"
        style={{ backgroundColor: selectedColors ? selectedColors.text + '40' : accent + '20' }}
      />

      <div className="p-3.5">
        {/* Label row */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8b8a94]">
            {t.sessionType} <span className="normal-case tracking-normal font-normal">{t.optionalField}</span>
          </span>
          <button
            type="button"
            onClick={() => router.push(libraryPath)}
            className="text-[12px] font-bold active:opacity-70 transition-opacity flex items-center gap-1"
            style={{ color: accent }}
          >
            {t.libraryMenuLabel}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Pill selector */}
        <div className="flex flex-wrap gap-1.5">
          {types.map((st) => {
            const isSelected = value === st;
            const stColors = SESSION_TYPE_COLORS[st] || { text: '#8b8a94', bg: '#1a1b22' };
            return (
              <button
                key={st}
                type="button"
                disabled={disabled}
                onClick={() => onChange(isSelected ? '' : st)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 disabled:opacity-50 active:scale-[0.96]"
                style={isSelected ? {
                  color: stColors.text,
                  backgroundColor: stColors.bg,
                  border: `1px solid ${stColors.text}30`,
                  boxShadow: `0 0 12px ${stColors.text}15`,
                } : {
                  color: '#8b8a94',
                  backgroundColor: 'transparent',
                  border: '1px solid #2a2b3260',
                }}
              >
                {t.sessionTypes[st]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
