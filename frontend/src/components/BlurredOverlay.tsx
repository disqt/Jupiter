'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

interface BlurredOverlayProps {
  children: React.ReactNode;
  message?: string;
}

export default function BlurredOverlay({ children, message }: BlurredOverlayProps) {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <div className="relative">
      <div className="blur-sm opacity-50 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-text-muted text-[13px] text-center font-medium">
          {message || t.createAccountToSeeMore}
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="px-5 py-2.5 bg-accent text-white text-[13px] font-semibold rounded-full transition-all duration-200 active:scale-[0.97]"
        >
          {t.createAccount}
        </button>
      </div>
    </div>
  );
}
