'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { setUserGoal } from '@/lib/api';

interface GoalScreenProps {
  onNext: () => void;
  onGoalSelected?: (goal: number) => void;
  onBack?: () => void;
}

const PRESETS = [
  { key: 'occasionnel', emoji: '🚶', value: 2 },
  { key: 'regulier', emoji: '🏃', value: 3, recommended: true },
  { key: 'sportif', emoji: '🏋️', value: 5 },
] as const;

export default function GoalScreen({ onNext, onGoalSelected, onBack }: GoalScreenProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(3);

  const handleValidate = async () => {
    try {
      await setUserGoal(selected);
    } catch {
      // non-blocking
    }
    onGoalSelected?.(selected);
    onNext();
  };

  const presetLabels = {
    occasionnel: t.onboardingGoalOccasionnel,
    regulier: t.onboardingGoalRegulier,
    sportif: t.onboardingGoalSportif,
  };

  return (
    <div className="flex flex-col min-h-full px-6 pt-16 pb-[max(env(safe-area-inset-bottom,20px),20px)]">
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-2">
          {onBack && (
            <button onClick={onBack} className="text-secondary text-[20px] -ml-1 active:scale-95 transition-transform">←</button>
          )}
          <h1 className="font-serif text-[28px] text-text">{t.onboardingGoalTitle}</h1>
        </div>
        <p className="text-secondary text-[15px] mb-6">{t.onboardingGoalSubtitle}</p>

        <div className="border-l-[3px] border-accent pl-4 py-2 mb-6">
          <p className="text-secondary text-[14px] leading-relaxed">{t.onboardingGoalCallout}</p>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => setSelected(preset.value)}
              className={`relative flex items-center gap-4 p-4 rounded-xl border-[1.5px] transition-all active:scale-[0.98] ${
                selected === preset.value
                  ? 'border-accent bg-accent/[0.06]'
                  : 'border-border bg-bg-card'
              }`}
            >
              <span className="text-[28px]">{preset.emoji}</span>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text">{presetLabels[preset.key]}</span>
                  {'recommended' in preset && preset.recommended && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                      {t.onboardingGoalRecommended}
                    </span>
                  )}
                </div>
                <span className="text-secondary text-[14px]">{preset.value}x / {t.onboardingGoalPerWeek}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === preset.value ? 'border-accent' : 'border-border'
              }`}>
                {selected === preset.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                )}
              </div>
            </button>
          ))}
        </div>

        <p className="text-muted text-[13px] text-center">{t.onboardingGoalNote}</p>
      </div>

      {/* CTA */}
      <button
        onClick={handleValidate}
        className="mt-6 w-full py-4 rounded-xl font-semibold text-[16px] text-white bg-gradient-to-br from-[#c9a96e] to-[#a0833a] active:scale-[0.98] transition-transform"
      >
        {t.onboardingContinue}
      </button>
    </div>
  );
}
