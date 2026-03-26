'use client';

import { useI18n } from '@/lib/i18n';

interface Props {
  onNext: () => void;
  onBack?: () => void;
}

const SPORTS = [
  { emoji: '🚴', labelFr: 'Vélo', labelEn: 'Cycling', color: '#3b9eff' },
  { emoji: '🏋️', labelFr: 'Muscu', labelEn: 'Strength', color: '#ff8a3b' },
  { emoji: '🏃', labelFr: 'Course', labelEn: 'Running', color: '#34d399' },
  { emoji: '🏊', labelFr: 'Natation', labelEn: 'Swimming', color: '#06b6d4' },
  { emoji: '🚶', labelFr: 'Marche', labelEn: 'Walking', color: '#f59e0b' },
  { emoji: '✨', labelFr: 'Custom', labelEn: 'Custom', color: '#a78bfa' },
];

export default function SportsScreen({ onNext, onBack }: Props) {
  const { t, locale } = useI18n();

  return (
    <div className="flex flex-col min-h-full px-6 pt-16 pb-[max(env(safe-area-inset-bottom,20px),20px)]">
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-2">
          {onBack && (
            <button onClick={onBack} className="text-secondary text-[20px] -ml-1 active:scale-95 transition-transform">←</button>
          )}
          <h1 className="font-serif text-[28px] text-text">{t.onboardingDiscoverySportsTitle}</h1>
        </div>
        <p className="text-secondary text-[15px] mb-8 leading-relaxed">{t.onboardingDiscoverySportsText}</p>

        <div className="grid grid-cols-3 gap-3">
          {SPORTS.map((sport) => (
            <div
              key={sport.labelEn}
              className="flex flex-col items-center gap-2 py-5 rounded-xl bg-bg-card border-[1.5px]"
              style={{ borderColor: sport.color }}
            >
              <span className="text-[32px]">{sport.emoji}</span>
              <span className="text-text text-[13px] font-medium">
                {locale === 'fr' ? sport.labelFr : sport.labelEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="mt-6 w-full py-4 rounded-xl font-semibold text-[16px] text-white bg-gradient-to-br from-[#c9a96e] to-[#a0833a] active:scale-[0.98] transition-transform"
      >
        {t.onboardingNext}
      </button>
    </div>
  );
}
