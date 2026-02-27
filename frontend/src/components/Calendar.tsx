'use client';

import { useState, useEffect, useRef, useMemo, Suspense, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { fetchWorkouts, fetchMonthlyStats, fetchWeeklyProgress, fetchWeeklyMedals, type Workout, type WeeklyMedal } from '@/lib/api';
import WeeklyProgress from '@/components/WeeklyProgress';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { WORKOUT_CONFIG, WORKOUT_TYPES, type WorkoutType } from '@/lib/data';

export default function Calendar() {
  const { t, locale, setLocale } = useI18n();
  const { user } = useAuth();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState({ totalCount: 0, countsByType: {} as Record<string, number>, totalDistanceKm: 0, totalElevationM: 0 });
  const [totalMedals, setTotalMedals] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weeklyMedals, setWeeklyMedals] = useState<WeeklyMedal[]>([]);
  const [showMedalInfo, setShowMedalInfo] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [w, s, wm] = await Promise.all([
        fetchWorkouts(monthStr),
        fetchMonthlyStats(monthStr),
        fetchWeeklyMedals(monthStr),
      ]);
      setWorkouts(w);
      setWeeklyMedals(wm);
      setStats({
        totalCount: parseInt(s.total_count) || 0,
        countsByType: Object.fromEntries(
          Object.entries(s.counts_by_type || {}).map(([k, v]) => [k, parseInt(v as string) || 0])
        ),
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
      .then((wp) => {
        setTotalMedals(parseInt(wp.total_medals) || 0);
        setWeekCount(parseInt(wp.week_count) || 0);
      })
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
  const monthMedals = weeklyMedals.reduce((sum, w) => sum + w.medals, 0);
  const weekProgress = Math.min(weekCount / 3, 1);

  const getTypeBgClass = (type: string): string => {
    const map: Record<string, string> = {
      velo: 'bg-cycling-soft',
      musculation: 'bg-strength-soft',
      course: 'bg-running-soft',
      natation: 'bg-swimming-soft',
      marche: 'bg-walking-soft',
      custom: 'bg-custom-workout-soft',
    };
    return map[type] || '';
  };

  const getTypeTagClass = (type: string, isSelected: boolean): string => {
    const map: Record<string, string> = {
      velo: `bg-cycling/20 text-cycling ${isSelected ? 'bg-cycling/30' : ''}`,
      musculation: `bg-strength/20 text-strength ${isSelected ? 'bg-strength/30' : ''}`,
      course: `bg-running/20 text-running ${isSelected ? 'bg-running/30' : ''}`,
      natation: `bg-swimming/20 text-swimming ${isSelected ? 'bg-swimming/30' : ''}`,
      marche: `bg-walking/20 text-walking ${isSelected ? 'bg-walking/30' : ''}`,
      custom: `bg-custom-workout/20 text-custom-workout ${isSelected ? 'bg-custom-workout/30' : ''}`,
    };
    return map[type] || '';
  };

  const getTypeGradientClass = (type: string): string => {
    const map: Record<string, string> = {
      velo: 'from-cycling to-transparent',
      musculation: 'from-strength to-transparent',
      course: 'from-running to-transparent',
      natation: 'from-swimming to-transparent',
      marche: 'from-walking to-transparent',
      custom: 'from-custom-workout to-transparent',
    };
    return map[type] || 'from-accent to-transparent';
  };

  const getTypeTextClass = (type: string): string => {
    const map: Record<string, string> = {
      velo: 'text-cycling',
      musculation: 'text-strength',
      course: 'text-running',
      natation: 'text-swimming',
      marche: 'text-walking',
      custom: 'text-custom-workout',
    };
    return map[type] || 'text-accent';
  };

  // Compute the Monday (ISO week start) for a given day in the current month
  const getWeekMonday = (day: number): string => {
    const date = new Date(year, month, day);
    const dow = (date.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const monday = new Date(date);
    monday.setDate(date.getDate() - dow);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
  };

  // Build calendar rows (7 day cells + medal info per row)
  const calendarRows = useMemo(() => {
    const rows: { cells: (number | null)[]; medals: number }[] = [];
    let cells: (number | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
      if (cells.length === 7) {
        const refDay = cells.find(d => d !== null)!;
        const weekMonday = getWeekMonday(refDay);
        const weekData = weeklyMedals.find(w => w.week_start === weekMonday);
        rows.push({ cells: [...cells], medals: weekData?.medals ?? 0 });
        cells = [];
      }
    }

    if (cells.length > 0) {
      while (cells.length < 7) cells.push(null);
      const refDay = cells.find(d => d !== null)!;
      const weekMonday = getWeekMonday(refDay);
      const weekData = weeklyMedals.find(w => w.week_start === weekMonday);
      rows.push({ cells: [...cells], medals: weekData?.medals ?? 0 });
    }

    return rows;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstDayOfWeek, daysInMonth, year, month, weeklyMedals]);

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
          <div className="grid grid-cols-[repeat(7,1fr)_24px] gap-1 mb-1.5">
            {t.days.map((d) => (
              <span key={d} className="text-center text-[11px] font-medium text-text-muted uppercase tracking-wide py-1">
                {d}
              </span>
            ))}
            <span className="flex items-center justify-center text-accent">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
                <polygon points="12,5 13.5,8 17,8.5 14.5,11 15,14.5 12,13 9,14.5 9.5,11 7,8.5 10.5,8" fill="currentColor" />
                <path d="M8 14.5l-2 5.5 4-2M16 14.5l2 5.5-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          </div>

          {/* Calendar grid */}
          <div className="flex flex-col gap-1">
            {calendarRows.map((row, rowIdx) => {
              const hasMedals = row.medals > 0;
              return (
                <div key={rowIdx} className={`grid grid-cols-[repeat(7,1fr)_24px] gap-1 rounded-sm ${hasMedals ? 'bg-accent/[0.06]' : ''}`}>
                  {row.cells.map((day, colIdx) => {
                    if (day === null) {
                      return (
                        <div
                          key={`empty-${rowIdx}-${colIdx}`}
                          className="min-h-[64px] md:min-h-[80px] lg:min-h-[90px]"
                        />
                      );
                    }

                    const dayWorkouts = getWorkoutsForDay(day);
                    const typeSet = new Set(dayWorkouts.map(w => w.type));
                    const dateStr = formatDateStr(day);
                    const isTodayCell = isToday(day);
                    const isSelected = selectedDate === dateStr;

                    const bgClass = dayWorkouts.length === 0
                      ? ''
                      : typeSet.size > 1
                        ? 'bg-gradient-to-br from-cycling-soft to-strength-soft'
                        : getTypeBgClass(dayWorkouts[0].type);

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
                              <span key={w.id} className={`text-[8px] font-semibold leading-tight py-0.5 px-[3px] rounded-[3px] text-center line-clamp-1 ${getTypeTagClass(w.type, isSelected)}`}>
                                <span className="lg:hidden">{w.customEmoji || WORKOUT_CONFIG[w.type as WorkoutType]?.defaultEmoji || '🎯'}</span>
                                <span className="hidden lg:inline">{t.workoutTypeTags[w.type] || w.type}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Medal badge */}
                  <div className="flex items-center justify-center min-h-[64px] md:min-h-[80px] lg:min-h-[90px]">
                    {hasMedals && (
                      <div className="flex flex-col items-center gap-0.5 text-accent">
                        <span className="text-[11px] font-bold leading-none">{row.medals}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
                          <polygon points="12,5 13.5,8 17,8.5 14.5,11 15,14.5 12,13 9,14.5 9.5,11 7,8.5 10.5,8" fill="currentColor" />
                          <path d="M8 14.5l-2 5.5 4-2M16 14.5l2 5.5-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </div>
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
                selectedDayWorkouts.map((w) => {
                  const config = WORKOUT_CONFIG[w.type as WorkoutType];
                  const href = config
                    ? `${config.route}?date=${selectedDate}&id=${w.id}`
                    : `/workout/custom?date=${selectedDate}&id=${w.id}`;
                  return (
                    <Link
                      key={w.id}
                      href={href}
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-bg-elevated rounded-sm mb-1.5 cursor-pointer transition-all duration-150 active:scale-[0.98] no-underline text-inherit"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[15px] shrink-0 ${getTypeBgClass(w.type)}`}>
                        {w.customEmoji || config?.defaultEmoji || '🎯'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{w.customName || t.workoutTypeLabels[w.type] || w.type}</div>
                        <div className="text-xs text-text-muted">{w.detail}</div>
                      </div>
                      <span className="text-text-muted text-sm">›</span>
                    </Link>
                  );
                })
              ) : (
                <div className="text-text-muted text-[13px] text-center py-3">{t.noWorkout}</div>
              )}
            </div>
          )}

          {/* Monthly stats */}
          <h3 className="text-[15px] font-semibold mt-6 mb-2">{t.thisMonth}</h3>

          <div className="bg-bg-card border border-border rounded-card p-3.5 px-4 relative overflow-hidden mb-2.5 cursor-pointer" onClick={() => setShowMedalInfo(true)}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-transparent" />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[26px] font-bold tracking-tight leading-none text-accent">
                  {monthMedals}<span className="text-sm font-normal opacity-60"> 🏅</span>
                </div>
                <div className="text-xs text-text-muted mt-1 font-medium">{t.monthlyMedals}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-text-muted text-[11px] font-semibold shrink-0">i</div>
                <div className="text-[11px] text-text-muted font-medium">{t.weekCount(weekCount)}</div>
              </div>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden mt-2.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-accent to-[#8b5cf6] transition-all duration-500 ease-out ${weekCount >= 3 ? 'animate-progressGlow' : ''}`}
                style={{ width: `${weekProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Total sessions with type breakdown */}
          <div className="bg-bg-card border border-border rounded-card p-3.5 px-4 relative overflow-hidden mb-2.5">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-transparent" />
            <div className="text-[26px] font-bold tracking-tight leading-none text-text">
              {stats.totalCount}
            </div>
            <div className="text-xs text-text-muted mt-1 font-medium">{t.totalSessions}</div>
            {stats.totalCount > 0 && (
              <div className="flex items-center gap-2.5 mt-2.5">
                {WORKOUT_TYPES.filter(type => (stats.countsByType[type] || 0) > 0).map((type) => (
                  <div key={type} className="flex items-center gap-1">
                    <span className="text-[13px]">{WORKOUT_CONFIG[type].defaultEmoji}</span>
                    <span className={`text-[13px] font-semibold ${getTypeTextClass(type)}`}>
                      {stats.countsByType[type]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distance + Elevation */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { value: stats.totalDistanceKm.toLocaleString(numberLocale), unit: 'km', label: t.distanceCovered },
              { value: stats.totalElevationM.toLocaleString(numberLocale), unit: 'm', label: t.totalElevation },
            ].map((stat, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-card p-3.5 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-transparent" />
                <div className="text-[26px] font-bold tracking-tight leading-none text-accent">
                  {stat.value}<span className="text-sm font-normal opacity-60"> {stat.unit}</span>
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
            <div className="grid grid-cols-2 gap-3">
              {WORKOUT_TYPES.map((type) => {
                const config = WORKOUT_CONFIG[type];
                const borderSoftMap: Record<string, string> = {
                  velo: 'border-cycling-soft hover:bg-cycling-soft hover:border-cycling',
                  musculation: 'border-strength-soft hover:bg-strength-soft hover:border-strength',
                  course: 'border-running-soft hover:bg-running-soft hover:border-running',
                  natation: 'border-swimming-soft hover:bg-swimming-soft hover:border-swimming',
                  marche: 'border-walking-soft hover:bg-walking-soft hover:border-walking',
                  custom: 'border-custom-workout-soft hover:bg-custom-workout-soft hover:border-custom-workout',
                };
                return (
                  <Link key={type} href={`${config.route}?date=${selectedDate}`}
                    onClick={() => setShowSheet(false)}
                    className={`py-5 px-4 rounded-card border-[1.5px] bg-bg text-center no-underline transition-all duration-200 active:scale-[0.96] block ${borderSoftMap[type] || ''}`}>
                    <div className="text-[28px] mb-2">{config.defaultEmoji}</div>
                    <div className="text-sm font-semibold text-text">{t.workoutTypeLabels[type]}</div>
                  </Link>
                );
              })}
            </div>
            <button onClick={() => setShowSheet(false)}
              className="block w-full mt-4 py-3 bg-transparent border-none text-text-muted text-sm cursor-pointer font-inherit">
              {t.cancel}
            </button>
          </div>
        </>
      )}
      {/* Medal info modal */}
      {showMedalInfo && (
        <>
          <div onClick={() => setShowMedalInfo(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed inset-0 z-[51] flex items-center justify-center px-8" onClick={() => setShowMedalInfo(false)}>
            <div onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[320px] animate-fadeIn">
              <div className="flex items-center gap-2 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent shrink-0">
                  <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
                  <polygon points="12,5 13.5,8 17,8.5 14.5,11 15,14.5 12,13 9,14.5 9.5,11 7,8.5 10.5,8" fill="currentColor" />
                  <path d="M8 14.5l-2 5.5 4-2M16 14.5l2 5.5-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h3 className="text-[15px] font-semibold">{t.medals}</h3>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-3">
                {t.medalsDescription}
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-[52px] shrink-0 text-accent font-semibold">{t.sessions3}</span>
                  <span className="text-text-muted">&rarr;</span>
                  <span className="text-text-secondary">{t.medal1}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-[52px] shrink-0 text-accent font-semibold">{t.sessions4}</span>
                  <span className="text-text-muted">&rarr;</span>
                  <span className="text-text-secondary">{t.medals2}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-[52px] shrink-0 text-accent font-semibold">{t.sessions5}</span>
                  <span className="text-text-muted">&rarr;</span>
                  <span className="text-text-secondary">{t.medals3}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-[52px] shrink-0 text-accent font-semibold">{t.sessions6plus}</span>
                  <span className="text-text-muted">&rarr;</span>
                  <span className="text-text-secondary">{t.medalsExtra}</span>
                </div>
              </div>
              <p className="text-[11px] text-text-muted mt-3">
                {t.currentMedals(totalMedals)}
              </p>
              <button onClick={() => setShowMedalInfo(false)}
                className="w-full mt-4 py-2.5 bg-bg-elevated border border-border rounded-sm text-text text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
                {t.understood}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
