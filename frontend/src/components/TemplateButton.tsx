'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

interface TemplateButtonProps {
  workoutType: string;
  date: string;
  workoutId?: string | null;
}

export default function TemplateButton({ workoutType, date, workoutId }: TemplateButtonProps) {
  const router = useRouter();
  const { t } = useI18n();

  const handleClick = () => {
    const params = new URLSearchParams({ type: workoutType, date });
    if (workoutId) params.set('from', workoutId);
    router.push(`/workout/templates?${params.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center gap-1 px-4 py-[18px] rounded-card border-2 border-dashed border-strength/40 bg-strength/5 text-strength text-[12px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
      {t.templates}
    </button>
  );
}
