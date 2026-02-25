'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getWeeklyProgress, getTotalMedals } from '@/lib/data';

export default function WeeklyProgress() {
  const searchParams = useSearchParams();
  const [showCelebration, setShowCelebration] = useState(false);

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
    <div className="w-full">
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
  );
}
