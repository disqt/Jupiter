'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { fetchWeeklyProgress } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function WeeklyProgress() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t } = useI18n();
  const [showCelebration, setShowCelebration] = useState(false);
  const [count, setCount] = useState(0);
  const [totalMedals, setTotalMedals] = useState(0);

  useEffect(() => {
    fetchWeeklyProgress().then((data) => {
      setCount(parseInt(data.week_count) || 0);
      setTotalMedals(parseInt(data.total_medals) || 0);
    }).catch(console.error);
  }, [pathname]);

  useEffect(() => {
    if (searchParams.get('saved') === '1' && count >= 3) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 1200);
      window.history.replaceState({}, '', '/');
      return () => clearTimeout(timer);
    }
  }, [searchParams, count]);

  const progress = Math.min(count / 3, 1);

  return (
    <div className="flex items-center gap-2.5 border border-border rounded-sm px-3 py-2">
      {/* Big medal icon */}
      <div className="relative shrink-0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          className={`text-accent ${showCelebration ? 'animate-medalBounce' : ''}`}>
          <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
          <polygon points="12,5 13.5,8 17,8.5 14.5,11 15,14.5 12,13 9,14.5 9.5,11 7,8.5 10.5,8" fill="currentColor" />
          <path d="M8 14.5l-2 5.5 4-2M16 14.5l2 5.5-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {showCelebration && (
          <span className="absolute -top-2 -right-3 text-[11px] font-bold text-accent animate-medalFloatUp">+1</span>
        )}
      </div>

      {/* Big number + label */}
      <div className="flex-1 min-w-0">
        <span className="text-[18px] font-bold text-accent leading-none">{totalMedals}</span>
        <div className="text-[9px] text-text-muted font-medium mt-0.5">{t.totalMedals}</div>
      </div>
    </div>
  );
}
