'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WeeklyProgress from '@/components/WeeklyProgress';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user, isGuest, logout } = useAuth();

  const navItems = [
    { href: '/', label: t.home, icon: '🏠' },
    { href: '/calendar', label: t.calendar, icon: '📅' },
    { href: '/stats', label: t.stats, icon: '📊' },
    { href: '/profile', label: t.profile, icon: '👤' },
  ];

  return (
    <>
      {/* Mobile/Tablet: bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-bg-card border-t border-border flex py-1.5 pb-5 z-30 lg:hidden">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 pt-1 no-underline transition-all duration-150 ${isActive ? (item.href === '/' ? 'text-[#c9a96e]' : 'text-accent') : 'text-inherit'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop: sidebar */}
      <nav className="hidden lg:flex flex-col w-[200px] h-dvh sticky top-0 bg-bg-card border-r border-border p-6 pt-8 shrink-0">
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo-horizontal-dark.svg`}
          alt="Jupiter Tracker"
          className="h-12 w-auto mb-1"
        />
        <Link href="/profile" className="text-xs text-text-muted no-underline hover:text-accent transition-colors mb-3">
          {isGuest ? t.guestMode : user?.nickname}
        </Link>
        <div className="mb-6">
          <Suspense fallback={null}>
            <WeeklyProgress />
          </Suspense>
        </div>
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm mb-1 no-underline transition-all duration-150 ${isActive ? (item.href === '/' ? 'bg-bg-elevated text-[#c9a96e]' : 'bg-bg-elevated text-accent') : 'text-text-secondary hover:bg-bg-elevated'}`}>
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
        <div className="mt-auto flex flex-col gap-2">
          {!isGuest && (
            <button
              onClick={logout}
              className="text-sm text-text-muted hover:text-red-400 transition-colors cursor-pointer bg-transparent border border-border rounded-md font-inherit text-center px-3 py-2"
            >
              {t.logout}
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
