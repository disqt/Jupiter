'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { setUserGoal } from '@/lib/api';

interface Props {
  currentTarget: number;
  onClose: () => void;
  onSaved: (newTarget: number) => void;
  onCreateAccount: () => void;
}

const PRESETS = [
  { key: 'casual', target: 2, emoji: '🚶' },
  { key: 'regular', target: 3, emoji: '🏃' },
  { key: 'athlete', target: 5, emoji: '🏋️' },
] as const;

export default function GoalModal({ currentTarget, onClose, onSaved, onCreateAccount }: Props) {
  const { t } = useI18n();
  const { isGuest } = useAuth();

  const isCustom = !PRESETS.some((p) => p.target === currentTarget);
  const [selected, setSelected] = useState<number | 'custom'>(isCustom ? 'custom' : currentTarget);
  const [customValue, setCustomValue] = useState<number>(isCustom ? currentTarget : 4);
  const [saving, setSaving] = useState(false);

  const effectiveTarget = selected === 'custom' ? customValue : selected;
  const unchanged = effectiveTarget === currentTarget;

  async function handleSave() {
    if (unchanged || saving) return;
    setSaving(true);
    try {
      await setUserGoal(effectiveTarget);
      onSaved(effectiveTarget);
      onClose();
    } catch {
      setSaving(false);
    }
  }

  const presetLabels: Record<string, string> = {
    casual: t.goalCasual,
    regular: t.goalRegular,
    athlete: t.goalAthlete,
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
      <div className="fixed inset-0 z-[51] flex items-center justify-center px-4 lg:left-[200px]" onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[380px] animate-fadeIn"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-5 text-center">
            <span className="text-[28px] mb-1">🎯</span>
            <h2 className="text-[18px] font-serif text-text">{t.sportsGoal}</h2>
            <p className="text-[12px] text-text-muted mt-1 leading-snug">{t.sportsGoalSubtitle}</p>
            <p className="text-[11px] text-text-muted/60 mt-2 leading-snug italic">{t.goalProspectiveNote}</p>
          </div>

          {/* Preset cards */}
          <div className={`flex flex-col gap-2 mb-2 ${isGuest ? 'opacity-40 pointer-events-none' : ''}`}>
            {PRESETS.map((preset) => {
              const isSelected = selected === preset.target;
              return (
                <button
                  key={preset.key}
                  onClick={() => setSelected(preset.target)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-150 active:scale-[0.98] font-inherit cursor-pointer text-left ${
                    isSelected
                      ? 'border-[#c9a96e] bg-[#c9a96e]/8'
                      : 'border-border bg-bg-elevated'
                  }`}
                >
                  {/* Icon box */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-[20px] shrink-0 ${
                      isSelected ? 'bg-[#c9a96e]/20' : 'bg-bg-card'
                    }`}
                  >
                    {preset.emoji}
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-text">{presetLabels[preset.key]}</span>
                      {preset.key === 'regular' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-[#c9a96e]/50 text-[#c9a96e] leading-none">
                          {t.goalDefault}
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-text-muted">{t.sessionsPerWeek(preset.target)}</span>
                  </div>

                  {/* Radio */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-[#c9a96e] bg-[#c9a96e]' : 'border-border'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}

            {/* Custom card */}
            <button
              onClick={() => setSelected('custom')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-150 active:scale-[0.98] font-inherit cursor-pointer text-left ${
                selected === 'custom'
                  ? 'border-[#c9a96e] bg-[#c9a96e]/8'
                  : 'border-border bg-bg-elevated'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[20px] shrink-0 ${
                  selected === 'custom' ? 'bg-[#c9a96e]/20' : 'bg-bg-card'
                }`}
              >
                ⚙️
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] font-medium text-text">{t.goalCustom}</span>
                <p className="text-[12px] text-text-muted">{t.goalCustomRange}</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  selected === 'custom' ? 'border-[#c9a96e] bg-[#c9a96e]' : 'border-border'
                }`}
              >
                {selected === 'custom' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>

            {/* Stepper — shown when custom is selected */}
            {selected === 'custom' && (
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  onClick={() => setCustomValue((v) => Math.max(1, v - 1))}
                  disabled={customValue <= 1}
                  className="w-9 h-9 rounded-full border border-border bg-bg-elevated flex items-center justify-center text-[18px] text-text font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="text-[24px] font-serif text-[#c9a96e] w-8 text-center">{customValue}</span>
                <button
                  onClick={() => setCustomValue((v) => Math.min(7, v + 1))}
                  disabled={customValue >= 7}
                  className="w-9 h-9 rounded-full border border-border bg-bg-elevated flex items-center justify-center text-[18px] text-text font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Guest upsell */}
          {isGuest && (
            <div className="mb-4 p-3 rounded-xl border border-dashed border-[#c9a96e]/50 text-center">
              <p className="text-[13px] text-[#c9a96e] font-medium mb-1">{t.goalGuestUpsell}</p>
              <p className="text-[12px] text-text-muted">{t.goalGuestCurrent}</p>
            </div>
          )}

          {/* Action button */}
          {isGuest ? (
            <button
              onClick={onCreateAccount}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a0833a] text-white text-[14px] font-semibold font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]"
            >
              {t.goalCreateAccount}
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={unchanged || saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a0833a] text-white text-[14px] font-semibold font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {saving ? '…' : t.goalSave}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
