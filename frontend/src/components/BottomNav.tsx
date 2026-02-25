'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WeeklyProgress from '@/components/WeeklyProgress';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

export default function BottomNav() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();
  const { user, logout } = useAuth();

  if (pathname === '/login' || pathname === '/register') return null;

  const navItems = [
    { href: '/', label: t.calendar, icon: '📅' },
    { href: '/stats', label: t.stats, icon: '📊', disabled: true },
    { href: '/profile', label: t.profile, icon: '👤' },
  ];

  return (
    <>
      {/* Mobile/Tablet: bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-bg-card border-t border-border flex py-1.5 pb-5 z-30 lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return item.disabled ? (
            <div key={item.href} className="flex-1 flex flex-col items-center gap-0.5 pt-1 cursor-not-allowed relative">
              <span className="text-xl opacity-25">{item.icon}</span>
              <span className="text-[11px] font-medium opacity-25">{item.label}</span>
              <span className="absolute -top-0.5 right-1/2 translate-x-[18px] text-[8px] font-bold text-accent bg-accent/15 rounded-full px-1.5 py-0.5 leading-none">soon</span>
            </div>
          ) : (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 pt-1 no-underline transition-all duration-150 ${isActive ? 'text-accent' : 'text-inherit'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop: sidebar */}
      <nav className="hidden lg:flex flex-col w-[200px] min-h-dvh bg-bg-card border-r border-border p-6 pt-8 shrink-0">
        <h2 className="font-serif text-xl mb-1">
          Jupiter <span className="text-text-muted italic">Tracker</span>
        </h2>
        {user && (
          <Link href="/profile" className="text-xs text-text-muted no-underline hover:text-accent transition-colors mb-3">
            {user.nickname}
          </Link>
        )}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1">
            <Suspense fallback={null}>
              <WeeklyProgress />
            </Suspense>
          </div>
          <button
            onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
            className="text-[11px] font-bold text-text-muted bg-bg border border-border rounded-md px-1.5 py-1 cursor-pointer transition-all duration-150 active:scale-95 uppercase tracking-wide shrink-0"
          >
            {locale === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return item.disabled ? (
            <div key={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-sm mb-1 cursor-not-allowed">
              <span className="opacity-25">{item.icon}</span>
              <span className="text-sm font-medium opacity-25">{item.label}</span>
              <span className="text-[9px] font-bold text-accent bg-accent/15 rounded-full px-1.5 py-0.5 leading-none ml-auto">soon</span>
            </div>
          ) : (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm mb-1 no-underline transition-all duration-150 ${isActive ? 'bg-bg-elevated text-accent' : 'text-text-secondary hover:bg-bg-elevated'}`}>
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="mt-auto text-sm text-text-muted hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none font-inherit text-left px-3 py-2"
        >
          {t.logout}
        </button>
      </nav>
    </>
  );
}
