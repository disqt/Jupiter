'use client';

import { useI18n } from '@/lib/i18n';

interface Props {
  onComplete: () => void;
  onBack?: () => void;
}

export default function ReadyScreen({ onComplete, onBack }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col min-h-full px-6 pt-16 pb-[max(env(safe-area-inset-bottom,20px),20px)] relative overflow-hidden">
      {/* Gold glows */}
      <div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full pointer-events-none opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 65%)' }}
      />

      {/* Content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center z-10">
        {onBack && (
          <button onClick={onBack} className="self-start text-secondary text-[20px] -ml-1 mb-4 active:scale-95 transition-transform">←</button>
        )}
        <span className="text-[72px] mb-6">💪</span>
        <h1 className="font-serif text-[32px] text-text mb-4">{t.onboardingReadyTitle}</h1>
        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent mb-4" />
        <p className="text-secondary text-[16px] text-center leading-[1.8] max-w-[280px]">
          {t.onboardingReadyText}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onComplete}
        className="mt-6 w-full py-4 rounded-xl font-semibold text-[16px] text-white bg-gradient-to-br from-[#c9a96e] to-[#a0833a] active:scale-[0.98] transition-transform z-10"
      >
        {t.onboardingLetsGo}
      </button>
    </div>
  );
}
