'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { fetchWorkouts, fetchMonthlyStats, fetchWeeklyProgress, type Workout } from '@/lib/api';
import WeeklyProgress from '@/components/WeeklyProgress';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

export default function Calendar() {
  const { t, locale, setLocale } = useI18n();
  const { user } = useAuth();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState({ cyclingCount: 0, strengthCount: 0, totalDistanceKm: 0, totalElevationM: 0 });
  const [totalMedals, setTotalMedals] = useState(0);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [w, s] = await Promise.all([
        fetchWorkouts(monthStr),
        fetchMonthlyStats(monthStr),
      ]);
      setWorkouts(w);
      setStats({
        cyclingCount: parseInt(s.cycling_count) || 0,
        strengthCount: parseInt(s.strength_count) || 0,
        totalDistanceKm: parseFloat(s.total_distance_km) || 0,
        totalElevationM: parseInt(s.total_elevation_m) || 0,
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [monthStr]);

  useEffect(() => {
    fetchWeeklyProgress()
      .then((wp) => setTotalMedals(parseInt(wp.total_medals) || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
  const selectedWeekday = selectedDateObj ? t.weekdays[selectedDateObj.getDay()] : '';
  const isTodaySelected = selectedDay !== null && isToday(selectedDay);

  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <div>
      {/* Header — visible on mobile/tablet only */}
      <div className="sticky top-0 z-10 bg-bg px-5 pt-14 pb-3 rounded-b-2xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="shrink-0">
            <h1 className="font-serif text-[28px] font-normal tracking-tight leading-none">
              <span className="text-accent">Jupiter</span> <span className="text-text-muted italic">Tracker</span>
            </h1>
            {user && (
              <Link href="/profile" className="text-xs text-text-muted no-underline hover:text-accent transition-colors">
                {user.nickname}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-[130px]">
              <Suspense fallback={null}>
                <WeeklyProgress />
              </Suspense>
            </div>
            <button
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="text-[11px] font-bold text-text-muted bg-bg-card border border-border rounded-md px-1.5 py-1 cursor-pointer transition-all duration-150 active:scale-95 uppercase tracking-wide shrink-0"
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: two-column | Mobile: single column */}
      <div className="px-5 pb-5 lg:flex lg:gap-8 lg:px-8 lg:pt-8 lg:max-w-6xl">

        {/* Left column: month nav + calendar */}
        <div className="lg:flex-1 lg:max-w-2xl">
          {/* Month navigation */}
          <div className="flex items-center justify-between py-4 pb-3 lg:pt-0">
            <button onClick={prevMonth}
              className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-[0.92] active:bg-bg-elevated text-base">
              &#8249;
            </button>
            <span className="text-[17px] font-semibold tracking-tight">{t.months[month]} {year}</span>
            <button onClick={nextMonth}
              className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-[0.92] active:bg-bg-elevated text-base">
              &#8250;
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {t.days.map((d) => (
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
                ? 'bg-gradient-to-br from-cycling-soft to-strength-soft'
                : hasVelo ? 'bg-cycling-soft' : hasMuscu ? 'bg-strength-soft' : '';

              return (
                <div
                  key={day}
                  onClick={() => selectDay(day)}
                  className={`min-h-[64px] md:min-h-[80px] lg:min-h-[90px] flex flex-col items-center justify-start rounded-sm text-[13px] cursor-pointer relative transition-all duration-150 active:scale-[0.93] p-1 gap-0.5 overflow-hidden
                    ${bgClass}
                    ${isTodayCell ? 'text-text font-bold border-2 border-accent/60' : 'text-text-secondary'}
                    ${isSelected ? 'border-2 border-accent text-text font-semibold' : ''}
                    ${dayWorkouts.length > 0 && !isTodayCell && !isSelected ? 'text-text' : ''}`}
                >
                  <div className="flex items-center gap-0.5">
                    <span className="text-[13px] leading-none">{day}</span>
                    {isTodayCell && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                  </div>
                  {dayWorkouts.length > 0 && (
                    <div className="flex flex-col gap-px w-full px-0.5">
                      {dayWorkouts.map((w) => (
                        <span key={w.id} className={`text-[8px] font-semibold leading-tight py-0.5 px-[3px] rounded-[3px] text-center line-clamp-1 ${
                          w.type === 'velo'
                            ? `bg-cycling/20 text-cycling ${isSelected ? 'bg-cycling/30' : ''}`
                            : `bg-strength/20 text-strength ${isSelected ? 'bg-strength/30' : ''}`
                        }`}>
                          <span className="lg:hidden">{w.type === 'velo' ? '🚴' : '🏋️'}</span>
                          <span className="hidden lg:inline">{w.type === 'velo' ? t.cyclingTag : t.strengthTag}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column (desktop) / Below calendar (mobile) */}
        <div className="lg:w-[360px] lg:shrink-0">
          {/* Day panel */}
          {selectedDate && (
            <div ref={panelRef} className="mt-5 lg:mt-0 bg-bg-card border border-border rounded-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[15px] font-semibold">{selectedDay} {t.months[month]}</div>
                  <div className="text-xs text-text-muted capitalize">
                    {selectedWeekday}{isTodaySelected ? ` — ${t.today}` : ''}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-text-muted text-[13px] text-center py-3">{t.loading}</div>
              ) : selectedDayWorkouts.length > 0 ? (
                selectedDayWorkouts.map((w) => (
                  <Link
                    key={w.id}
                    href={w.type === 'velo' ? `/workout/cycling?date=${selectedDate}&id=${w.id}` : `/workout/strength?date=${selectedDate}&id=${w.id}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 bg-bg-elevated rounded-sm mb-1.5 cursor-pointer transition-all duration-150 active:scale-[0.98] no-underline text-inherit"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[15px] shrink-0 ${w.type === 'velo' ? 'bg-cycling-soft' : 'bg-strength-soft'}`}>
                      {w.type === 'velo' ? '🚴' : '🏋️'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{w.type === 'velo' ? t.cycling : t.strength}</div>
                      <div className="text-xs text-text-muted">{w.detail}</div>
                    </div>
                    <span className="text-text-muted text-sm">›</span>
                  </Link>
                ))
              ) : (
                <div className="text-text-muted text-[13px] text-center py-3">{t.noWorkout}</div>
              )}
            </div>
          )}

          {/* Monthly stats */}
          <h3 className="text-[15px] font-semibold mt-6 mb-2">{t.thisMonth}</h3>

          <div className="bg-bg-card border border-border rounded-card p-3.5 px-4 relative overflow-hidden mb-2.5">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-transparent" />
            <div className="text-[26px] font-bold tracking-tight leading-none text-accent">
              {totalMedals}<span className="text-sm font-normal opacity-60"> 🏅</span>
            </div>
            <div className="text-xs text-text-muted mt-1 font-medium">{t.totalMedals}</div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { value: stats.strengthCount, label: t.strengthSessions, type: 'strength' as const },
              { value: stats.cyclingCount, label: t.cyclingSessions, type: 'cycling' as const },
              { value: stats.totalDistanceKm.toLocaleString(numberLocale), unit: 'km', label: t.distanceCovered, type: 'cycling' as const },
              { value: stats.totalElevationM.toLocaleString(numberLocale), unit: 'm', label: t.totalElevation, type: 'cycling' as const },
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
          className="fixed bottom-[104px] lg:bottom-8 right-6 lg:right-8 w-14 h-14 rounded-full bg-gradient-to-br from-accent to-[#7c5ce0] border-none text-white text-[28px] font-light cursor-pointer shadow-[0_8px_32px_rgba(167,139,250,0.35)] flex items-center justify-center transition-all duration-200 active:scale-90 active:rotate-90 z-20">
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
            <h3 className="font-serif text-[22px] font-normal mb-5">{t.newWorkout}</h3>
            <div className="flex gap-3">
              <Link href={`/workout/cycling?date=${selectedDate}`}
                onClick={() => setShowSheet(false)}
                className="flex-1 py-5 px-4 rounded-card border-[1.5px] border-cycling-soft bg-bg text-center no-underline transition-all duration-200 active:scale-[0.96] hover:bg-cycling-soft hover:border-cycling block">
                <div className="text-[28px] mb-2">🚴</div>
                <div className="text-sm font-semibold text-text">{t.cycling}</div>
              </Link>
              <Link href={`/workout/strength?date=${selectedDate}`}
                onClick={() => setShowSheet(false)}
                className="flex-1 py-5 px-4 rounded-card border-[1.5px] border-strength-soft bg-bg text-center no-underline transition-all duration-200 active:scale-[0.96] hover:bg-strength-soft hover:border-strength block">
                <div className="text-[28px] mb-2">🏋️</div>
                <div className="text-sm font-semibold text-text">{t.strength}</div>
              </Link>
            </div>
            <button onClick={() => setShowSheet(false)}
              className="block w-full mt-4 py-3 bg-transparent border-none text-text-muted text-sm cursor-pointer font-inherit">
              {t.cancel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
