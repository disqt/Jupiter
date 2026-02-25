'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getWeeklyProgress, getTotalMedals } from '@/lib/data';

export default function WeeklyProgress() {
  const searchParams = useSearchParams();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const { count } = getWeeklyProgress(todayStr);
  const totalMedals = getTotalMedals();

  const progress = Math.min(count / 3, 1);
  const extra = Math.max(0, count - 3);

  useEffect(() => {
    if (searchParams.get('saved') === '1' && count >= 3) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 1200);
      window.history.replaceState({}, '', '/');
      return () => clearTimeout(timer);
    }
  }, [searchParams, count]);

  const glowStyle = count >= 3
    ? { boxShadow: `0 0 ${8 + extra * 4}px ${2 + extra * 2}px rgba(167, 139, 250, ${0.3 + extra * 0.1})` }
    : {};

  return (
    <>
      <div className="w-full cursor-pointer" onClick={() => setShowInfo(true)}>
        {/* Medal counter */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-text-muted">{count}/3 cette semaine</span>
          <div className="flex items-center gap-1 relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              className={`text-accent ${showCelebration ? 'animate-medalBounce' : ''}`}>
              <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
              <polygon points="12,5 13.5,8 17,8.5 14.5,11 15,14.5 12,13 9,14.5 9.5,11 7,8.5 10.5,8" fill="currentColor" />
              <path d="M8 14.5l-2 5.5 4-2M16 14.5l2 5.5-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[13px] font-bold text-accent">{totalMedals}</span>
            {showCelebration && (
              <span className="absolute -top-1 -right-3 text-[11px] font-bold text-accent animate-medalFloatUp">+1</span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-1 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-accent to-[#8b5cf6] transition-all duration-500 ease-out ${count >= 3 ? 'animate-progressGlow' : ''}`}
            style={{ width: `${progress * 100}%`, ...glowStyle }}
          />
        </div>
      </div>

      {/* Info modal */}
      {showInfo && (
        <>
          <div onClick={() => setShowInfo(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed inset-0 z-[51] flex items-center justify-center px-8" onClick={() => setShowInfo(false)}>
            <div onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[320px] animate-fadeIn">
              <div className="flex items-center gap-2 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent shrink-0">
                  <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
                  <polygon points="12,5 13.5,8 17,8.5 14.5,11 15,14.5 12,13 9,14.5 9.5,11 7,8.5 10.5,8" fill="currentColor" />
                  <path d="M8 14.5l-2 5.5 4-2M16 14.5l2 5.5-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h3 className="text-[15px] font-semibold">Médailles</h3>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-3">
                Gagne des médailles en t&apos;entraînant régulièrement chaque semaine (lundi au dimanche).
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-[52px] shrink-0 text-accent font-semibold">3 séances</span>
                  <span className="text-text-muted">&rarr;</span>
                  <span className="text-text-secondary">1 médaille</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-[52px] shrink-0 text-accent font-semibold">4 séances</span>
                  <span className="text-text-muted">&rarr;</span>
                  <span className="text-text-secondary">2 médailles</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-[52px] shrink-0 text-accent font-semibold">5 séances</span>
                  <span className="text-text-muted">&rarr;</span>
                  <span className="text-text-secondary">3 médailles</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-[52px] shrink-0 text-accent font-semibold">6+</span>
                  <span className="text-text-muted">&rarr;</span>
                  <span className="text-text-secondary">+1 par séance supplémentaire</span>
                </div>
              </div>
              <p className="text-[11px] text-text-muted mt-3">
                Tu as actuellement <span className="text-accent font-semibold">{totalMedals}</span> médaille{totalMedals > 1 ? 's' : ''}.
              </p>
              <button onClick={() => setShowInfo(false)}
                className="w-full mt-4 py-2.5 bg-bg-elevated border border-border rounded-sm text-text text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
                Compris
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
