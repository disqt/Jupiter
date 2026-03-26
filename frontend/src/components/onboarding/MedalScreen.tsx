'use client';

import { useI18n } from '@/lib/i18n';

interface MedalScreenProps {
  onNext: () => void;
  weeklyGoal?: number;
  onBack?: () => void;
}

const DAYS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DAYS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getCheckedDays(count: number): number[] {
  if (count <= 0) return [];
  if (count >= 7) return [0, 1, 2, 3, 4, 5, 6];
  const spacing = 7 / count;
  return Array.from({ length: count }, (_, i) => Math.round(i * spacing) % 7);
}

export default function MedalScreen({ onNext, weeklyGoal = 3, onBack }: MedalScreenProps) {
  const { t, locale } = useI18n();
  const days = locale === 'fr' ? DAYS_FR : DAYS_EN;
  const checked = getCheckedDays(weeklyGoal);

  return (
    <div className="flex flex-col min-h-full px-6 pt-16 pb-[max(env(safe-area-inset-bottom,20px),20px)]">
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-2">
          {onBack && (
            <button onClick={onBack} className="text-secondary text-[20px] -ml-1 active:scale-95 transition-transform">←</button>
          )}
          <h1 className="font-serif text-[28px] text-text">{t.onboardingMedalTitle}</h1>
        </div>
        <p className="text-secondary text-[15px] leading-relaxed mb-6">{t.onboardingMedalText}</p>

        {/* Medal */}
        <div className="flex justify-center mb-6">
          <span className="text-[56px]" style={{ filter: 'drop-shadow(0 4px 12px rgba(201,169,110,0.3))' }}>🏅</span>
        </div>

        {/* Example card */}
        <div className="bg-bg-card rounded-xl p-5 border border-border mb-4">
          <div className="flex justify-between mb-4">
            {days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-muted text-[12px]">{day}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  checked.includes(i)
                    ? 'bg-gradient-to-br from-[#c9a96e] to-[#a0833a]'
                    : 'bg-elevated'
                }`}>
                  {checked.includes(i) && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-secondary text-[14px]">
            {weeklyGoal} {locale === 'fr' ? 'séances cette semaine = 1 médaille' : 'sessions this week = 1 medal'} 🏅
          </p>
        </div>

        <p className="text-secondary text-[14px] text-center leading-relaxed">
          {t.onboardingMedalProgress}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="mt-6 w-full py-4 rounded-xl font-semibold text-[16px] text-white bg-gradient-to-br from-[#c9a96e] to-[#a0833a] active:scale-[0.98] transition-transform"
      >
        {t.onboardingMedalCta}
      </button>
    </div>
  );
}
