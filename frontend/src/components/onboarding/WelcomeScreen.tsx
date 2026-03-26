'use client';

import { useI18n } from '@/lib/i18n';

interface WelcomeScreenProps {
  username: string;
  onNext: () => void;
}

export default function WelcomeScreen({ username, onNext }: WelcomeScreenProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col min-h-full px-6 pt-16 pb-[max(env(safe-area-inset-bottom,20px),20px)]">
      {/* Content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Gold glows */}
        <div
          className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.15) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-[20%] left-[20%] w-[250px] h-[250px] rounded-full pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%)' }}
        />

        {/* Medal with glow ring */}
        <div className="relative mb-8">
          <div
            className="absolute inset-0 scale-[2.5] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 60%)' }}
          />
          <span className="text-[72px] relative block">🏅</span>
        </div>

        {/* Welcome title */}
        <h1 className="font-serif text-[34px] leading-tight text-text mb-6 text-center">
          {t.onboardingWelcome}<br />
          <span className="text-accent">{username}</span>
        </h1>

        {/* Decorative divider */}
        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent mb-6" />

        {/* Message */}
        <p className="text-secondary text-[16px] leading-[1.8] max-w-[300px] text-center">
          {t.onboardingWelcomeText1}{' '}
          <span className="text-accent font-medium">{t.onboardingWelcomeHighlight1}</span>
          {t.onboardingWelcomeText2}{' '}
          <span className="text-accent font-medium">{t.onboardingWelcomeHighlight2}</span>.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="mt-6 w-full py-4 rounded-xl font-semibold text-[16px] text-white bg-gradient-to-br from-[#c9a96e] to-[#a0833a] active:scale-[0.98] transition-transform"
      >
        {t.onboardingContinue}
      </button>
    </div>
  );
}
