'use client';

import { useI18n } from '@/lib/i18n';

interface WelcomeScreenProps {
  username: string;
  onNext: () => void;
}

export default function WelcomeScreen({ username, onNext }: WelcomeScreenProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 relative">
      {/* Decorative glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)' }}
      />

      <div className="flex flex-col items-center text-center z-10">
        <span className="text-[56px] mb-6">🏅</span>
        <h1 className="font-serif text-[30px] leading-tight text-text mb-2">
          {t.onboardingWelcome}{' '}
          <span className="text-accent">{username}</span>
        </h1>
        <p className="text-secondary text-[15px] leading-relaxed mt-4 max-w-[300px]">
          {t.onboardingWelcomeText1}{' '}
          <span className="text-accent">{t.onboardingWelcomeHighlight1}</span>
          {t.onboardingWelcomeText2}{' '}
          <span className="text-accent">{t.onboardingWelcomeHighlight2}</span>.
        </p>
      </div>

      <button
        onClick={onNext}
        className="mt-auto mb-8 w-full max-w-[300px] py-3.5 rounded-xl font-semibold text-bg-card bg-gradient-to-br from-[#c9a96e] to-[#a0833a] active:scale-[0.98] transition-transform"
      >
        {t.onboardingContinue}
      </button>
    </div>
  );
}
