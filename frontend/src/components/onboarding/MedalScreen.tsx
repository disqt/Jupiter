'use client';

import { useI18n } from '@/lib/i18n';

interface MedalScreenProps {
  onNext: () => void;
}

const DAYS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DAYS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const CHECKED = [0, 2, 4]; // Mon, Wed, Fri

export default function MedalScreen({ onNext }: MedalScreenProps) {
  const { t, locale } = useI18n();
  const days = locale === 'fr' ? DAYS_FR : DAYS_EN;

  return (
    <div className="flex flex-col h-full px-6 pt-20 pb-6">
      <h1 className="font-serif text-[28px] text-text mb-2">{t.onboardingMedalTitle}</h1>
      <p className="text-secondary text-[15px] leading-relaxed mb-8">{t.onboardingMedalText}</p>

      {/* Medal */}
      <div className="flex justify-center mb-8">
        <span className="text-[56px]" style={{ filter: 'drop-shadow(0 4px 12px rgba(201,169,110,0.3))' }}>🏅</span>
      </div>

      {/* Example card */}
      <div className="bg-bg-card rounded-xl p-5 border border-border mb-6">
        <div className="flex justify-between mb-4">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-muted text-[12px]">{day}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                CHECKED.includes(i)
                  ? 'bg-gradient-to-br from-[#c9a96e] to-[#a0833a]'
                  : 'bg-elevated'
              }`}>
                {CHECKED.includes(i) && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-secondary text-[14px]">
          {t.onboardingMedalExample}
        </p>
      </div>

      <p className="text-secondary text-[14px] text-center leading-relaxed mb-6">
        {t.onboardingMedalProgress}
      </p>

      <button
        onClick={onNext}
        className="mt-auto mb-2 w-full py-3.5 rounded-xl font-semibold text-bg-card bg-gradient-to-br from-[#c9a96e] to-[#a0833a] active:scale-[0.98] transition-transform"
      >
        {t.onboardingMedalCta}
      </button>
    </div>
  );
}
