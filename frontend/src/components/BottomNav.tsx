'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WeeklyProgress from '@/components/WeeklyProgress';

const navItems = [
  { href: '/', label: 'Calendrier', icon: '📅' },
  { href: '/stats', label: 'Stats', icon: '📊', disabled: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile/Tablet: bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-bg-card border-t border-border flex py-1.5 pb-5 z-30 lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return item.disabled ? (
            <div key={item.href} className="flex-1 flex flex-col items-center gap-0.5 pt-1 opacity-25 cursor-not-allowed">
              <span className="text-xl">{item.icon}</span>
              <span className="text-[11px] font-medium">{item.label}</span>
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
        <h2 className="font-serif text-xl mb-4">
          Jupiter <span className="text-text-muted italic">Tracker</span>
        </h2>
        <div className="mb-6">
          <WeeklyProgress />
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return item.disabled ? (
            <div key={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-sm mb-1 opacity-25 cursor-not-allowed">
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ) : (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm mb-1 no-underline transition-all duration-150 ${isActive ? 'bg-bg-elevated text-accent' : 'text-text-secondary hover:bg-bg-elevated'}`}>
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
