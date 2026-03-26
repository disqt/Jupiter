'use client';

import { useState, useRef, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';

interface DiscoveryScreenProps {
  onComplete: () => void;
}

const SPORTS = [
  { emoji: '🚴', label: 'cycling', color: '#3b9eff' },
  { emoji: '🏋️', label: 'strength', color: '#ff8a3b' },
  { emoji: '🏃', label: 'running', color: '#34d399' },
  { emoji: '🏊', label: 'swimming', color: '#06b6d4' },
  { emoji: '🚶', label: 'walking', color: '#f59e0b' },
  { emoji: '✨', label: 'custom', color: '#a78bfa' },
];

export default function DiscoveryScreen({ onComplete }: DiscoveryScreenProps) {
  const { t, locale } = useI18n();
  const [subIndex, setSubIndex] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const subTotal = 3;

  const sportLabels: Record<string, string> = locale === 'fr'
    ? { cycling: 'Vélo', strength: 'Muscu', running: 'Course', swimming: 'Natation', walking: 'Marche', custom: 'Custom' }
    : { cycling: 'Cycling', strength: 'Strength', running: 'Running', swimming: 'Swimming', walking: 'Walking', custom: 'Custom' };

  const goToSub = useCallback((index: number) => {
    if (index >= subTotal) return;
    setSubIndex(Math.max(0, Math.min(index, subTotal - 1)));
    setOffsetX(0);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;
    if (!isSwiping && Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartRef.current = null;
      return;
    }
    setIsSwiping(true);
    if ((subIndex === 0 && deltaX > 0) || (subIndex === subTotal - 1 && deltaX < 0)) {
      setOffsetX(deltaX * 0.3);
    } else {
      setOffsetX(deltaX);
    }
  }, [subIndex, isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    const threshold = 50;
    const velocity = Math.abs(offsetX) / (Date.now() - touchStartRef.current.time);
    if (offsetX < -threshold || (velocity > 0.5 && offsetX < 0)) {
      goToSub(subIndex + 1);
    } else if (offsetX > threshold || (velocity > 0.5 && offsetX > 0)) {
      goToSub(subIndex - 1);
    } else {
      setOffsetX(0);
    }
    touchStartRef.current = null;
    setIsSwiping(false);
  }, [offsetX, subIndex, goToSub]);

  // Calendar mockup data — scattered workout days
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthNames = t.months;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const workoutDays = [2, 5, 8, 11, 14, 17, 20, 23];

  const handleCta = () => {
    if (subIndex < subTotal - 1) {
      goToSub(subIndex + 1);
    } else {
      onComplete();
    }
  };

  const ctaLabel = subIndex < subTotal - 1 ? t.onboardingNext : t.onboardingLetsGo;

  return (
    <div className="flex flex-col h-full pt-16 pb-6">
      {/* Sub-dot indicators */}
      <div className="flex justify-center gap-1.5 mb-6">
        {Array.from({ length: subTotal }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === subIndex ? '#c9a96e' : '#2a2b32',
            }}
          />
        ))}
      </div>

      {/* Sub-slides */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(-${subIndex * 100}% + ${offsetX}px))`,
            transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Sub 1: Sports grid */}
          <div className="w-full h-full flex-shrink-0 px-6 flex flex-col">
            <h2 className="font-serif text-[26px] text-text mb-2">{t.onboardingDiscoverySportsTitle}</h2>
            <p className="text-secondary text-[14px] mb-8">{t.onboardingDiscoverySportsText}</p>
            <div className="grid grid-cols-3 gap-3">
              {SPORTS.map((sport) => (
                <div
                  key={sport.label}
                  className="flex flex-col items-center gap-2 py-5 rounded-xl bg-bg-card border-[1.5px]"
                  style={{ borderColor: sport.color }}
                >
                  <span className="text-[32px]">{sport.emoji}</span>
                  <span className="text-text text-[13px] font-medium">{sportLabels[sport.label]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sub 2: Calendar mockup */}
          <div className="w-full h-full flex-shrink-0 px-6 flex flex-col">
            <h2 className="font-serif text-[26px] text-text mb-2">{t.onboardingDiscoveryCalendarTitle}</h2>
            <p className="text-secondary text-[14px] mb-6">{t.onboardingDiscoveryCalendarText}</p>
            <div className="bg-bg-card rounded-xl p-4 border border-border">
              <p className="text-center text-text font-semibold mb-3">
                {monthNames[month]} {year}
              </p>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {(locale === 'fr' ? ['L', 'M', 'M', 'J', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((d, i) => (
                  <div key={i} className="text-center text-muted text-[11px] py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isWorkout = workoutDays.includes(day);
                  return (
                    <div
                      key={day}
                      className={`text-center text-[12px] py-1.5 rounded-lg ${
                        isWorkout
                          ? 'bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-white font-semibold'
                          : 'text-secondary'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sub 3: Ready */}
          <div className="w-full h-full flex-shrink-0 px-6 flex flex-col items-center justify-center">
            <span className="text-[64px] mb-6">💪</span>
            <h2 className="font-serif text-[28px] text-text mb-3">{t.onboardingReadyTitle}</h2>
            <p className="text-secondary text-[15px] text-center leading-relaxed max-w-[280px]">
              {t.onboardingReadyText}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6">
        <button
          onClick={handleCta}
          className="w-full py-3.5 rounded-xl font-semibold text-bg-card bg-gradient-to-br from-[#c9a96e] to-[#a0833a] active:scale-[0.98] transition-transform"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
