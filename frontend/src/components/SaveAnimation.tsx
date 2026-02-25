'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

interface SaveAnimationProps {
  onComplete: () => void;
}

const CIRCLE_R = 22;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;
const CHECK_LENGTH = 29;

export default function SaveAnimation({ onComplete }: SaveAnimationProps) {
  const { t } = useI18n();
  useEffect(() => {
    const timer = setTimeout(onComplete, 1900);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md animate-saveOverlayIn animate-saveFadeOut">
      {/* Glow */}
      <div
        className="absolute w-28 h-28 rounded-full animate-saveGlow"
        style={{
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Circle + Checkmark */}
      <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
        <circle
          cx="24" cy="24" r={CIRCLE_R}
          stroke="#a78bfa"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-saveCircleDraw"
          style={{
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: CIRCUMFERENCE,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
        <path
          d="M14 24l7 7 13-13"
          stroke="#a78bfa"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-saveCheckDraw"
          style={{
            strokeDasharray: CHECK_LENGTH,
            strokeDashoffset: CHECK_LENGTH,
          }}
        />
      </svg>

      {/* Text */}
      <p className="mt-5 text-[15px] font-medium text-text/90 tracking-wide animate-saveTextReveal">
        {t.workoutSaved}
      </p>
    </div>
  );
}
