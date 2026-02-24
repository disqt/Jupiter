# Tailwind Migration + Responsive Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all custom CSS from globals.css to Tailwind utility classes and add responsive layouts for mobile, tablet, and desktop.

**Architecture:** Register the design system tokens (colors, radii, fonts) in tailwind.config.ts so they're available as utility classes. Migrate each component one at a time from custom CSS classes to Tailwind classes inline. Add responsive breakpoints: mobile-first (default), tablet (md: 768px), desktop (lg: 1024px). On desktop, replace bottom nav with a left sidebar and use a two-column layout.

**Tech Stack:** Tailwind CSS 3, Next.js 14, TypeScript

---

### Task 1: Tailwind Config — Register Design System Tokens

**Files:**
- Modify: `frontend/tailwind.config.ts`
- Modify: `frontend/src/app/globals.css` (strip to bare minimum)

**Step 1: Update tailwind.config.ts with all design tokens**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0e0f11',
          card: '#1a1b1f',
          'card-hover': '#222329',
          elevated: '#26272d',
        },
        border: '#2a2b32',
        text: {
          DEFAULT: '#f0eff4',
          secondary: '#8b8a94',
          muted: '#55545e',
        },
        cycling: {
          DEFAULT: '#3b9eff',
          glow: 'rgba(59, 158, 255, 0.15)',
          soft: '#1a2a3d',
        },
        strength: {
          DEFAULT: '#ff8a3b',
          glow: 'rgba(255, 138, 59, 0.15)',
          soft: '#2d1f14',
        },
        accent: '#a78bfa',
        danger: '#ef4444',
      },
      borderRadius: {
        card: '14px',
        sm: '10px',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        serif: ['var(--font-instrument-serif)', 'serif'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        overlayIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        sheetUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        pulseDelete: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease',
        overlayIn: 'overlayIn 0.2s ease',
        sheetUp: 'sheetUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pulseDelete: 'pulseDelete 0.3s ease',
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 2: Reduce globals.css to bare minimum**

Replace the entire globals.css with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  -webkit-tap-highlight-color: transparent;
}

/* Hide number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
```

**Step 3: Verify the dev server still starts**

Run: `cd frontend && npm run dev`
Expected: compiles without errors (pages will look unstyled — that's expected)

**Step 4: Commit**

```bash
git add frontend/tailwind.config.ts frontend/src/app/globals.css
git commit -m "refactor: register design tokens in Tailwind config, strip globals.css"
```

---

### Task 2: Layout — Responsive Shell with Sidebar/Bottom Nav

**Files:**
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/components/BottomNav.tsx`

**Step 1: Update layout.tsx with responsive container**

Replace the current layout with a responsive shell. On desktop (lg+), the content area sits to the right of a sidebar. On mobile/tablet, content is full-width with bottom padding for the nav bar.

```tsx
import type { Metadata, Viewport } from 'next';
import { DM_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Jupiter Tracker',
  description: 'Track your workouts',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} font-sans bg-bg text-text min-h-dvh overflow-x-hidden`}>
        <div className="flex min-h-dvh">
          {/* Desktop sidebar — hidden on mobile/tablet */}
          <BottomNav />
          {/* Main content */}
          <main className="flex-1 pb-20 lg:pb-0 lg:ml-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

**Step 2: Update BottomNav.tsx — bottom nav on mobile, sidebar on desktop**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        <h2 className="font-serif text-xl mb-8">
          Jupiter <span className="text-text-muted italic">Tracker</span>
        </h2>
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
```

**Step 3: Verify layout renders correctly at different widths**

Run dev server, check at 375px (mobile), 768px (tablet), 1200px (desktop).
Expected: Bottom nav shows on mobile/tablet, sidebar shows on desktop.

**Step 4: Commit**

```bash
git add frontend/src/app/layout.tsx frontend/src/components/BottomNav.tsx
git commit -m "refactor: responsive layout with desktop sidebar and mobile bottom nav"
```

---

### Task 3: Calendar Component — Tailwind Migration + Responsive

**Files:**
- Modify: `frontend/src/components/Calendar.tsx`

This is the largest migration. The calendar page has: header, month nav, calendar grid, day panel, monthly stats, FAB, and bottom sheet.

**Step 1: Migrate Calendar.tsx to Tailwind**

Key responsive changes:
- **Mobile (default):** current single-column layout
- **Tablet (md):** day panel and stats side by side below calendar
- **Desktop (lg):** two-column layout — calendar on left, day panel + stats on right. Header hidden (title is in sidebar).

Full replacement of the component with Tailwind classes. The logic stays identical, only className attributes change.

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getWorkoutsForMonth, getMonthlyStats, type Workout } from '@/lib/data';

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const weekdays = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export default function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const workouts = getWorkoutsForMonth(year, month);
  const stats = getMonthlyStats(year, month);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null); };
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null); };

  const getWorkoutsForDay = (day: number): Workout[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workouts.filter((w) => w.date === dateStr);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const formatDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  useEffect(() => {
    if (month === today.getMonth() && year === today.getFullYear()) {
      setSelectedDate(formatDateStr(today.getDate()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectDay = (day: number) => {
    const dateStr = formatDateStr(day);
    setSelectedDate(dateStr);
    setShowSheet(false);
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const selectedDay = selectedDate ? parseInt(selectedDate.split('-')[2]) : null;
  const selectedDayWorkouts = selectedDay ? getWorkoutsForDay(selectedDay) : [];
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;
  const selectedWeekday = selectedDateObj ? weekdays[selectedDateObj.getDay()] : '';
  const isTodaySelected = selectedDay !== null && isToday(selectedDay);

  return (
    <div>
      {/* Header — visible on mobile/tablet only, desktop has sidebar title */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-bg from-70% to-transparent px-5 pt-14 pb-3 lg:hidden">
        <h1 className="font-serif text-[28px] font-normal tracking-tight">
          Jupiter <span className="text-text-muted italic">Tracker</span>
        </h1>
      </div>

      {/* Desktop: two-column layout | Mobile/Tablet: single column */}
      <div className="px-5 pb-5 lg:flex lg:gap-8 lg:px-8 lg:pt-8 lg:max-w-6xl">

        {/* Left column: month nav + calendar grid */}
        <div className="lg:flex-1 lg:max-w-2xl">
          {/* Month navigation */}
          <div className="flex items-center justify-between py-4 pb-3 lg:pt-0">
            <button onClick={prevMonth}
              className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-[0.92] active:bg-bg-elevated text-base">
              &#8249;
            </button>
            <span className="text-[17px] font-semibold tracking-tight">{monthNames[month]} {year}</span>
            <button onClick={nextMonth}
              className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-[0.92] active:bg-bg-elevated text-base">
              &#8250;
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {dayNames.map((d) => (
              <span key={d} className="text-center text-[11px] font-medium text-text-muted uppercase tracking-wide py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[64px] md:min-h-[80px] lg:min-h-[90px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayWorkouts = getWorkoutsForDay(day);
              const hasVelo = dayWorkouts.some((w) => w.type === 'velo');
              const hasMuscu = dayWorkouts.some((w) => w.type === 'musculation');
              const hasBoth = hasVelo && hasMuscu;
              const dateStr = formatDateStr(day);
              const isTodayCell = isToday(day);
              const isSelected = selectedDate === dateStr;

              const bgClass = hasBoth
                ? 'bg-gradient-to-br from-cycling-soft/100 via-50% to-strength-soft/100'
                : hasVelo ? 'bg-cycling-soft' : hasMuscu ? 'bg-strength-soft' : '';

              return (
                <div
                  key={day}
                  onClick={() => selectDay(day)}
                  className={`min-h-[64px] md:min-h-[80px] lg:min-h-[90px] flex flex-col items-center justify-start rounded-sm text-[13px] cursor-pointer relative transition-all duration-150 active:scale-[0.93] p-1 gap-0.5 overflow-hidden
                    ${bgClass}
                    ${isTodayCell ? 'text-text font-bold border-[1.5px] border-border' : 'text-text-secondary'}
                    ${isSelected ? 'border-[1.5px] border-accent text-text font-semibold' : ''}
                    ${dayWorkouts.length > 0 && !isTodayCell && !isSelected ? 'text-text' : ''}`}
                >
                  <span className="text-[13px] leading-none mb-px">{day}</span>
                  {(hasVelo || hasMuscu) && (
                    <div className="flex flex-col gap-px w-full px-0.5">
                      {hasVelo && (
                        <span className={`text-[8px] font-semibold leading-tight py-0.5 px-[3px] rounded-[3px] text-center line-clamp-2 bg-cycling/20 text-cycling ${isSelected ? 'bg-cycling/30' : ''}`}>
                          🚴 Vélo
                        </span>
                      )}
                      {hasMuscu && (
                        <span className={`text-[8px] font-semibold leading-tight py-0.5 px-[3px] rounded-[3px] text-center line-clamp-2 bg-strength/20 text-strength ${isSelected ? 'bg-strength/30' : ''}`}>
                          🏋️ Muscu
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column (desktop) / Below calendar (mobile/tablet) */}
        <div className="lg:w-[360px] lg:shrink-0">
          {/* Day panel */}
          {selectedDate && (
            <div ref={panelRef} className="mt-5 lg:mt-0 bg-bg-card border border-border rounded-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[15px] font-semibold">{selectedDay} {monthNames[month]}</div>
                  <div className="text-xs text-text-muted capitalize">
                    {selectedWeekday}{isTodaySelected ? " — aujourd'hui" : ''}
                  </div>
                </div>
              </div>

              {selectedDayWorkouts.length > 0 ? (
                selectedDayWorkouts.map((w) => (
                  <Link
                    key={w.id}
                    href={w.type === 'velo' ? `/workout/cycling?date=${selectedDate}` : `/workout/strength?date=${selectedDate}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 bg-bg-elevated rounded-sm mb-1.5 cursor-pointer transition-all duration-150 active:scale-[0.98] no-underline text-inherit"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[15px] shrink-0 ${w.type === 'velo' ? 'bg-cycling-soft' : 'bg-strength-soft'}`}>
                      {w.type === 'velo' ? '🚴' : '🏋️'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{w.type === 'velo' ? 'Vélo' : 'Musculation'}</div>
                      <div className="text-xs text-text-muted">{w.detail}</div>
                    </div>
                    <span className="text-text-muted text-sm">›</span>
                  </Link>
                ))
              ) : (
                <div className="text-text-muted text-[13px] text-center py-3">Aucune séance</div>
              )}
            </div>
          )}

          {/* Monthly stats */}
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            {[
              { value: stats.strengthCount, label: 'Séances muscu', type: 'strength' },
              { value: stats.cyclingCount, label: 'Séances vélo', type: 'cycling' },
              { value: `${stats.totalDistanceKm.toLocaleString('fr-FR')}`, unit: 'km', label: 'Distance parcourue', type: 'cycling' },
              { value: `${stats.totalElevationM.toLocaleString('fr-FR')}`, unit: 'm', label: 'Dénivelé cumulé', type: 'cycling' },
            ].map((stat, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-card p-3.5 px-4 relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.type === 'strength' ? 'from-strength to-transparent' : 'from-cycling to-transparent'}`} />
                <div className={`text-[26px] font-bold tracking-tight leading-none ${stat.type === 'strength' ? 'text-strength' : 'text-cycling'}`}>
                  {stat.value}{stat.unit && <span className="text-sm font-normal opacity-60"> {stat.unit}</span>}
                </div>
                <div className="text-xs text-text-muted mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAB */}
      {selectedDate && (
        <button onClick={() => setShowSheet(true)}
          className="fixed bottom-[104px] lg:bottom-8 right-6 lg:right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-[#7c5ce0] border-none text-white text-[28px] font-light cursor-pointer shadow-[0_8px_32px_rgba(167,139,250,0.35)] flex items-center justify-center transition-all duration-200 active:scale-90 active:rotate-90 z-20">
          +
        </button>
      )}

      {/* Bottom sheet */}
      {showSheet && (
        <>
          <div onClick={() => setShowSheet(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed bottom-0 left-0 right-0 max-w-[430px] lg:max-w-lg mx-auto bg-bg-card rounded-t-3xl px-6 pt-7 pb-10 z-[51] animate-sheetUp">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
            <h3 className="font-serif text-[22px] font-normal mb-5">Nouvelle séance</h3>
            <div className="flex gap-3">
              <Link href={`/workout/cycling?date=${selectedDate}`}
                onClick={() => setShowSheet(false)}
                className="flex-1 py-5 px-4 rounded-card border-[1.5px] border-cycling-soft bg-bg text-center no-underline transition-all duration-200 active:scale-[0.96] hover:bg-cycling-soft hover:border-cycling block">
                <div className="text-[28px] mb-2">🚴</div>
                <div className="text-sm font-semibold text-text">Vélo</div>
              </Link>
              <Link href={`/workout/strength?date=${selectedDate}`}
                onClick={() => setShowSheet(false)}
                className="flex-1 py-5 px-4 rounded-card border-[1.5px] border-strength-soft bg-bg text-center no-underline transition-all duration-200 active:scale-[0.96] hover:bg-strength-soft hover:border-strength block">
                <div className="text-[28px] mb-2">🏋️</div>
                <div className="text-sm font-semibold text-text">Musculation</div>
              </Link>
            </div>
            <button onClick={() => setShowSheet(false)}
              className="block w-full mt-4 py-3 bg-transparent border-none text-text-muted text-sm cursor-pointer">
              Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 2: Verify at all breakpoints**

Run dev server, test at 375px, 768px, 1200px.
Expected: Mobile shows single column + bottom nav. Tablet shows wider cells. Desktop shows calendar left + day panel/stats right, no bottom nav.

**Step 3: Commit**

```bash
git add frontend/src/components/Calendar.tsx
git commit -m "refactor: migrate Calendar to Tailwind with responsive desktop/tablet layout"
```

---

### Task 4: Cycling Form — Tailwind Migration + Responsive

**Files:**
- Modify: `frontend/src/app/workout/cycling/page.tsx`

**Step 1: Migrate cycling form to Tailwind**

```tsx
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RIDE_TYPES } from '@/lib/data';

function CyclingWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';

  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [elevation, setElevation] = useState('');
  const [rideType, setRideType] = useState(RIDE_TYPES[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { router.push('/'); }, 300);
  };

  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <div className="px-5 pb-36 lg:max-w-xl lg:mx-auto lg:pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 pt-14 pb-5 lg:pt-8">
        <button onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer text-base transition-all duration-150 active:scale-90 shrink-0">
          &#8249;
        </button>
        <span className="font-serif text-[22px] font-normal">Séance vélo</span>
      </div>

      <div className="text-[13px] text-text-muted mb-6 pl-12 capitalize">{dateDisplay}</div>

      {/* Fields — 2 columns on tablet+ */}
      <div className="md:grid md:grid-cols-2 md:gap-4">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Type de sortie</label>
          <select value={rideType} onChange={(e) => setRideType(e.target.value)}
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent appearance-none">
            {RIDE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Durée (min)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="75"
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted" />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Distance (km)</label>
          <input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="42.5"
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted" />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Dénivelé (m)</label>
          <input type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} placeholder="680"
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted" />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-cycling text-white shadow-[0_4px_20px_rgba(59,158,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide">
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
}

export default function CyclingWorkout() {
  return (
    <Suspense fallback={<div className="p-5 text-text-muted">Chargement...</div>}>
      <CyclingWorkoutForm />
    </Suspense>
  );
}
```

**Step 2: Verify form renders on all breakpoints**

Expected: Fields stack on mobile, 2-column grid on tablet+, centered container on desktop.

**Step 3: Commit**

```bash
git add frontend/src/app/workout/cycling/page.tsx
git commit -m "refactor: migrate cycling form to Tailwind with responsive 2-column layout"
```

---

### Task 5: Strength Form — Tailwind Migration + Responsive

**Files:**
- Modify: `frontend/src/app/workout/strength/page.tsx`

**Step 1: Migrate strength form to Tailwind**

This is the most complex form. Key responsive changes:
- On tablet/desktop, exercise cards can sit in a 2-column grid
- Modals adapt width on desktop (centered, max-width)
- All custom CSS classes replaced with Tailwind utilities

```tsx
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EXERCISES, MUSCLE_GROUPS, DUMMY_WORKOUTS, getExerciseHistory, type Exercise } from '@/lib/data';

interface SetLog {
  setNumber: number;
  reps: string;
  weight: string;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: SetLog[];
  lastPerformance: { setNumber: number; reps: number; weight: number }[];
}

function StrengthWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';

  const existingWorkout = DUMMY_WORKOUTS.find(
    (w) => w.date === date && w.type === 'musculation' && w.exercises && w.exercises.length > 0
  );

  const initialEntries: ExerciseEntry[] = existingWorkout?.exercises
    ? existingWorkout.exercises.map((ex) => {
        const matchedExercise = EXERCISES.find((e) => e.name === ex.name) || {
          id: 0, name: ex.name, muscleGroup: ex.muscleGroup,
        };
        return {
          exercise: matchedExercise,
          sets: ex.sets.map((s) => ({
            setNumber: s.setNumber,
            reps: s.reps > 0 ? String(s.reps) : '',
            weight: s.weight > 0 ? String(s.weight) : '',
          })),
          lastPerformance: ex.lastPerformance || [],
        };
      })
    : [];

  const [exercises] = useState<Exercise[]>(EXERCISES);
  const [entries, setEntries] = useState<ExerciseEntry[]>(initialEntries);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [historyExercise, setHistoryExercise] = useState<string | null>(null);

  const addExercise = (exercise: Exercise) => {
    setEntries([...entries, { exercise, sets: [{ setNumber: 1, reps: '', weight: '' }], lastPerformance: [] }]);
    setShowExercisePicker(false);
  };

  const createAndAddExercise = () => {
    if (!newExerciseName || !newExerciseMuscle) return;
    const newEx: Exercise = { id: Date.now(), name: newExerciseName, muscleGroup: newExerciseMuscle };
    setNewExerciseName(''); setNewExerciseMuscle(''); setShowNewExercise(false);
    addExercise(newEx);
  };

  const updateSet = (entryIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => {
    const updated = [...entries];
    updated[entryIdx] = {
      ...updated[entryIdx],
      sets: updated[entryIdx].sets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s),
    };
    setEntries(updated);
  };

  const addSet = (entryIdx: number) => {
    const updated = [...entries];
    const nextNum = updated[entryIdx].sets.length + 1;
    updated[entryIdx] = {
      ...updated[entryIdx],
      sets: [...updated[entryIdx].sets, { setNumber: nextNum, reps: '', weight: '' }],
    };
    setEntries(updated);
  };

  const removeSet = (entryIdx: number, setIdx: number) => {
    const updated = [...entries];
    const newSets = updated[entryIdx].sets
      .filter((_, i) => i !== setIdx)
      .map((s, i) => ({ ...s, setNumber: i + 1 }));
    updated[entryIdx] = { ...updated[entryIdx], sets: newSets };
    setEntries(updated);
  };

  const removeExercise = (entryIdx: number) => {
    setEntries(entries.filter((_, i) => i !== entryIdx));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { router.push('/'); }, 300);
  };

  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <div className="px-5 pb-36 lg:max-w-4xl lg:mx-auto lg:pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 pt-14 pb-5 lg:pt-8">
        <button onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer text-base transition-all duration-150 active:scale-90 shrink-0">
          &#8249;
        </button>
        <span className="font-serif text-[22px] font-normal">Séance musculation</span>
      </div>
      <div className="text-[13px] text-text-muted mb-6 pl-12 capitalize">{dateDisplay}</div>

      {/* Exercise cards — 2 columns on desktop */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-4">
        {entries.map((entry, entryIdx) => (
          <div key={entryIdx} className="bg-bg-card border border-border rounded-card p-4 mb-3 lg:mb-0">
            {/* Exercise header */}
            <div className="flex items-start justify-between mb-3.5">
              <div>
                <div className="text-[15px] font-semibold">{entry.exercise.name}</div>
                <div className="text-[11px] text-strength font-medium mt-0.5">{entry.exercise.muscleGroup}</div>
              </div>
              <button onClick={() => removeExercise(entryIdx)} aria-label="Retirer"
                className="bg-transparent border-none cursor-pointer p-1 opacity-70 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
                  <path d="M7 7l6 6M13 7l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Sets header */}
            <div className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 mb-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Série</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Précéd.</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Reps</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Poids</span>
            </div>

            {/* Set rows */}
            {entry.sets.map((set, setIdx) => {
              const lastPerf = entry.lastPerformance.find((p) => p.setNumber === set.setNumber);
              const canDelete = set.setNumber > 1;
              const deleteKey = `${entryIdx}-${setIdx}`;
              const isDeleting = pendingDelete === deleteKey;
              return (
                <div key={setIdx} className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 mb-1.5 items-center">
                  {canDelete ? (
                    isDeleting ? (
                      <button onClick={() => { removeSet(entryIdx, setIdx); setPendingDelete(null); }}
                        aria-label="Confirmer suppression"
                        className="flex items-center justify-center w-7 h-7 mx-auto bg-danger/15 border border-danger/30 rounded-lg cursor-pointer p-0 animate-pulseDelete">
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                          <path d="M4.5 4.5h9M7.5 4.5V3a1.5 1.5 0 011.5-1.5h0A1.5 1.5 0 0110.5 3v1.5M6 7.5v6M9 7.5v6M12 7.5v6M5.25 4.5l.5 10a1.5 1.5 0 001.5 1.5h3.5a1.5 1.5 0 001.5-1.5l.5-10"
                            stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ) : (
                      <button onClick={() => setPendingDelete(deleteKey)}
                        className="text-center text-[13px] font-bold text-text bg-white/[0.08] border border-white/[0.15] rounded-lg w-7 h-7 leading-7 mx-auto cursor-pointer transition-all duration-200 p-0 font-inherit active:bg-white/[0.15]">
                        {set.setNumber}
                      </button>
                    )
                  ) : (
                    <div className="text-center text-[13px] font-semibold text-text-muted leading-10">{set.setNumber}</div>
                  )}
                  <div className="text-center text-[11px] text-text-muted bg-bg rounded-md h-10 leading-10 border border-transparent overflow-hidden text-ellipsis whitespace-nowrap">
                    {lastPerf ? `${lastPerf.reps} × ${lastPerf.weight}kg` : '-'}
                  </div>
                  <input type="number" value={set.reps}
                    onChange={(e) => updateSet(entryIdx, setIdx, 'reps', e.target.value)}
                    placeholder={lastPerf ? String(lastPerf.reps) : '0'}
                    className="w-full min-w-0 text-center text-sm font-medium text-text bg-bg border border-border rounded-md h-10 leading-10 font-inherit outline-none transition-colors duration-200 focus:border-strength p-0 box-border placeholder:text-text-muted" />
                  <input type="number" step="0.5" value={set.weight}
                    onChange={(e) => updateSet(entryIdx, setIdx, 'weight', e.target.value)}
                    placeholder={lastPerf ? String(lastPerf.weight) : '0'}
                    className="w-full min-w-0 text-center text-sm font-medium text-text bg-bg border border-border rounded-md h-10 leading-10 font-inherit outline-none transition-colors duration-200 focus:border-strength p-0 box-border placeholder:text-text-muted" />
                </div>
              );
            })}

            {/* Add set + history buttons */}
            <button onClick={() => addSet(entryIdx)}
              className="w-full py-2.5 mt-2 bg-transparent border border-dashed border-border rounded-lg text-text-muted text-[13px] font-inherit cursor-pointer transition-all duration-150 active:bg-bg-elevated">
              + Ajouter une série
            </button>
            <button onClick={() => setHistoryExercise(entry.exercise.name)}
              className="w-full py-2 mt-1 bg-transparent border-none text-accent text-xs font-medium font-inherit cursor-pointer opacity-70 transition-opacity duration-150 active:opacity-100">
              Voir l&apos;historique
            </button>
          </div>
        ))}
      </div>

      {/* Add exercise */}
      <button onClick={() => setShowExercisePicker(true)}
        className="w-full py-[18px] bg-transparent border-2 border-dashed border-border rounded-card text-text-muted text-sm font-medium font-inherit cursor-pointer mb-4 transition-all duration-200 active:border-strength active:text-strength mt-4 lg:mt-4">
        + Ajouter un exercice
      </button>

      {/* Save */}
      {entries.length > 0 && (
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-strength text-white shadow-[0_4px_20px_rgba(255,138,59,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide">
          {saving ? 'Sauvegarde...' : 'Sauvegarder la séance'}
        </button>
      )}

      {/* History modal */}
      {historyExercise && (() => {
        const history = getExerciseHistory(historyExercise, date);
        return (
          <>
            <div onClick={() => setHistoryExercise(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
            <div className="fixed bottom-0 left-0 right-0 max-w-[430px] lg:max-w-lg mx-auto bg-bg-card rounded-t-3xl px-6 pt-7 pb-10 z-[51] animate-sheetUp max-h-[70vh] overflow-y-auto">
              <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-normal m-0">{historyExercise}</h3>
                <button onClick={() => setHistoryExercise(null)}
                  className="bg-transparent border-none text-text-muted text-lg cursor-pointer py-1 px-2">✕</button>
              </div>
              {history.length === 0 ? (
                <div className="text-text-muted text-sm text-center py-6">Aucun historique disponible</div>
              ) : (
                history.map((entry, i) => {
                  const d = new Date(entry.date + 'T00:00:00');
                  const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                  return (
                    <div key={i} className="bg-bg border border-border rounded-sm p-3 mb-2.5">
                      <div className="text-[13px] font-semibold text-text mb-2 capitalize">{label}</div>
                      <div className="grid grid-cols-3 gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Série</span>
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Reps</span>
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Poids</span>
                      </div>
                      {entry.sets.map((s, j) => (
                        <div key={j} className="grid grid-cols-3 gap-1.5 py-1">
                          <span className="text-center text-[13px] font-semibold text-text-muted">{s.setNumber}</span>
                          <span className="text-center text-[13px] text-text-secondary">{s.reps}</span>
                          <span className="text-center text-[13px] text-text-secondary">{s.weight > 0 ? `${s.weight} kg` : '-'}</span>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </>
        );
      })()}

      {/* Exercise picker modal */}
      {showExercisePicker && (
        <>
          <div onClick={() => setShowExercisePicker(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed bottom-0 left-0 right-0 max-w-[430px] lg:max-w-lg mx-auto bg-bg-card rounded-t-3xl px-6 pt-7 pb-10 z-[51] animate-sheetUp max-h-[70vh] overflow-y-auto">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-[22px] font-normal m-0">Choisir un exercice</h3>
              <button onClick={() => setShowExercisePicker(false)}
                className="bg-transparent border-none text-text-muted text-lg cursor-pointer py-1 px-2">✕</button>
            </div>
            {MUSCLE_GROUPS.map((group) => {
              const groupExercises = exercises.filter((e) => e.muscleGroup === group);
              if (groupExercises.length === 0) return null;
              return (
                <div key={group}>
                  <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wide pt-3 pb-1.5 border-b border-border mb-1">
                    {group}
                  </div>
                  {groupExercises.map((ex) => (
                    <button key={ex.id} onClick={() => addExercise(ex)}
                      className="block w-full text-left py-3 px-2 bg-transparent border-none border-b border-border/50 text-text text-sm font-inherit cursor-pointer transition-all duration-100 active:bg-bg-elevated">
                      {ex.name}
                    </button>
                  ))}
                </div>
              );
            })}
            <div className="py-5">
              <button onClick={() => { setShowExercisePicker(false); setShowNewExercise(true); }}
                className="w-full py-[18px] bg-transparent border-2 border-dashed border-accent text-accent rounded-card text-sm font-medium font-inherit cursor-pointer transition-all duration-200">
                + Créer un nouvel exercice
              </button>
            </div>
          </div>
        </>
      )}

      {/* New exercise modal */}
      {showNewExercise && (
        <>
          <div onClick={() => setShowNewExercise(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed bottom-0 left-0 right-0 max-w-[430px] lg:max-w-lg mx-auto bg-bg-card rounded-t-3xl px-6 pt-7 pb-10 z-[51] animate-sheetUp">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
            <h3 className="font-serif text-[22px] font-normal mb-5">Nouvel exercice</h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Nom de l&apos;exercice
              </label>
              <input type="text" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="Ex: Développé couché"
                className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Groupe musculaire
              </label>
              <select value={newExerciseMuscle} onChange={(e) => setNewExerciseMuscle(e.target.value)}
                className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent appearance-none">
                <option value="">Choisir...</option>
                {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button onClick={createAndAddExercise}
              className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-strength text-white shadow-[0_4px_20px_rgba(255,138,59,0.3)]">
              Créer et ajouter
            </button>
            <button onClick={() => setShowNewExercise(false)}
              className="block w-full mt-4 py-3 bg-transparent border-none text-text-muted text-sm cursor-pointer">
              Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function StrengthWorkout() {
  return (
    <Suspense fallback={<div className="p-5 text-text-muted">Chargement...</div>}>
      <StrengthWorkoutForm />
    </Suspense>
  );
}
```

**Step 2: Verify form renders on all breakpoints**

Expected: Single column on mobile. 2-column exercise cards grid on desktop. Modals centered and max-width constrained on desktop.

**Step 3: Commit**

```bash
git add frontend/src/app/workout/strength/page.tsx
git commit -m "refactor: migrate strength form to Tailwind with responsive 2-column exercise cards"
```

---

### Task 6: Final Cleanup and Visual QA

**Files:**
- Modify: `frontend/src/app/globals.css` (verify nothing is left over)
- Modify: `frontend/src/app/layout.tsx` (remove any leftover inline styles)

**Step 1: Verify globals.css is minimal**

Ensure globals.css only contains:
- Tailwind directives
- Input spinner reset
- Tap highlight reset

No remaining custom class definitions.

**Step 2: Visual QA at all breakpoints**

Test all pages at:
- 375px (iPhone SE)
- 430px (iPhone 15 Pro Max)
- 768px (iPad)
- 1200px (Desktop)

Check:
- Calendar grid cell sizing scales up on larger screens
- Day panel appears to the right on desktop
- Bottom nav appears on mobile/tablet, sidebar on desktop
- FAB position correct at all sizes
- All modals display properly
- Exercise cards are 2 columns on desktop
- Cycling form fields are 2 columns on tablet+
- No horizontal overflow at any breakpoint

**Step 3: Final commit**

```bash
git add -A
git commit -m "refactor: complete Tailwind migration with responsive mobile/tablet/desktop layouts"
```
