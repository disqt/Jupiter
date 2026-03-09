'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { fetchHomeData, type HomeData } from '@/lib/api';
import { WORKOUT_CONFIG, WORKOUT_TYPES, type WorkoutType } from '@/lib/data';
import { getDraftWorkouts, getDraftRoute, type DraftWorkout } from '@/lib/drafts';
import { getGuestWorkouts, type GuestWorkout } from '@/lib/guest-storage';
import BlurredOverlay from '@/components/BlurredOverlay';
import BottomSheet from './BottomSheet';

const SPORT_COLORS: Record<string, string> = {
  velo: 'rgba(59,158,255,0.4)',
  musculation: 'rgba(255,138,59,0.4)',
  course: 'rgba(52,211,153,0.4)',
  natation: 'rgba(6,182,212,0.4)',
  marche: 'rgba(245,158,11,0.4)',
  custom: 'rgba(167,139,250,0.4)',
};

const SPORT_COLORS_SOLID: Record<string, string> = {
  velo: '#3b9eff',
  musculation: '#ff8a3b',
  course: '#34d399',
  natation: '#06b6d4',
  marche: '#f59e0b',
  custom: '#a78bfa',
};

const ICON_BG: Record<string, string> = {
  velo: 'bg-cycling/15',
  musculation: 'bg-strength/15',
  course: 'bg-running/15',
  natation: 'bg-swimming/15',
  marche: 'bg-walking/15',
  custom: 'bg-custom-workout/15',
};

function getGreeting(t: ReturnType<typeof useI18n>['t']) {
  const h = new Date().getHours();
  if (h < 12) return t.goodMorning;
  if (h < 18) return t.goodAfternoon;
  return t.goodEvening;
}

function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function formatVolume(kg: number) {
  if (kg >= 1000) return { value: (kg / 1000).toFixed(1), unit: 't' };
  return { value: String(Math.round(kg)), unit: 'kg' };
}

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
}

function buildGuestTodayWorkout(w: GuestWorkout) {
  let duration: number | null = null;
  let distance: number | null = null;
  let exercise_count = 0;

  if (w.cycling_details) {
    duration = w.cycling_details.duration;
    distance = w.cycling_details.distance;
  } else if (w.workout_details) {
    duration = w.workout_details.duration;
    distance = w.workout_details.distance;
  } else if (w.exercise_logs && w.exercise_logs.length > 0) {
    const uniqueExercises = new Set(w.exercise_logs.map(l => l.exercise_id));
    exercise_count = uniqueExercises.size;
  }

  return {
    id: w.id as unknown as number,
    type: w.type,
    custom_emoji: w.custom_emoji,
    custom_name: w.custom_name,
    duration,
    distance,
    exercise_count,
  };
}

function buildGuestHomeData(guestWorkouts: GuestWorkout[], todayDate: string, weekDates: string[]): HomeData {
  const todayWorkouts = guestWorkouts
    .filter(w => w.date === todayDate)
    .map(buildGuestTodayWorkout);

  const weekWorkouts = guestWorkouts
    .filter(w => weekDates.includes(w.date))
    .map(w => ({ date: w.date, type: w.type }));

  return {
    today: todayWorkouts,
    week: weekWorkouts,
    medals: { total: 0, month: 0 },
    insights: {
      sessions: 0, distance_km: 0, duration_min: 0, volume_kg: 0,
      prev_sessions: 0, prev_distance_km: 0, prev_duration_min: 0, prev_volume_kg: 0,
    },
    streak: 0,
    best_streak: 0,
  };
}

export default function HomePage() {
  const { user, isGuest } = useAuth();
  const { t, locale } = useI18n();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const [showMedalInfo, setShowMedalInfo] = useState(false);
  const [todayDrafts, setTodayDrafts] = useState<DraftWorkout[]>([]);

  const weekDates = getWeekDates();
  const todayDate = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  })();

  useEffect(() => {
    if (isGuest) {
      const guestWorkouts = getGuestWorkouts();
      setData(buildGuestHomeData(guestWorkouts, todayDate, weekDates));
      setLoading(false);
    } else {
      fetchHomeData()
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest]);

  const todayStr = (() => {
    const now = new Date();
    const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
    return now.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' });
  })();

  // Scan drafts for today (exclude types already saved)
  useEffect(() => {
    if (!data) return;
    const savedTypes = new Set(data.today.map(w => w.type));
    const allDrafts = getDraftWorkouts(new Set([todayDate]));
    setTodayDrafts(allDrafts.filter(d => !savedTypes.has(d.type)));
  }, [data, todayDate]);

  // Group week workouts by date
  const weekByDay: Record<string, string[]> = {};
  if (data) {
    for (const w of data.week) {
      const d = w.date.split('T')[0];
      if (!weekByDay[d]) weekByDay[d] = [];
      weekByDay[d].push(w.type);
    }
  }

  const activeDays = Object.keys(weekByDay).length;
  const maxWorkoutsPerDay = Math.max(1, ...Object.values(weekByDay).map(types => types.length));

  if (loading) {
    return (
      <div className="page-container px-5 pb-36 lg:pb-20">
        <div className="pt-8 text-text-muted text-[13px] text-center">{t.loading}</div>
      </div>
    );
  }

  const ins = data?.insights;
  const distDiff = ins ? ins.distance_km - ins.prev_distance_km : 0;
  const sesDiff = ins ? ins.sessions - ins.prev_sessions : 0;
  const durDiff = ins ? ins.duration_min - ins.prev_duration_min : 0;
  const volDiff = ins ? ins.volume_kg - ins.prev_volume_kg : 0;

  return (
    <div className="page-container px-5 pb-36 lg:pb-20">
      {/* Greeting */}
      <div className="pt-8 mb-7 animate-fadeIn">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a96e] mb-1.5 capitalize">
          {todayStr} — {getGreeting(t)}
        </div>
        <h1 className="font-serif text-[32px] lg:text-[38px] font-normal leading-tight">
          {t.welcome}{!isGuest && user?.nickname ? <> <span className="text-[#e2c992]">{user.nickname}</span></> : null}
        </h1>
      </div>

      {/* Today's workouts */}
      <div className="bg-bg-card border border-border rounded-card p-[18px_20px] mb-4 relative overflow-hidden animate-fadeIn" style={{ animationDelay: '0.06s' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#c9a96e] via-[#e2c992] to-transparent" />
        <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-3">{t.todayLabel}</div>
        {data && data.today.length > 0 ? (
          <div className="flex gap-2.5">
            {data.today.map((w) => {
              const config = WORKOUT_CONFIG[w.type as WorkoutType];
              const emoji = w.custom_emoji || config?.defaultEmoji || '🎯';
              const name = w.custom_name || (t.workoutTypeLabels[w.type] ?? w.type);
              const parts: string[] = [];
              if (w.type === 'musculation' && w.exercise_count > 0) parts.push(`${w.exercise_count} ex.`);
              if (w.duration) parts.push(`${w.duration} min`);
              if (w.distance) parts.push(`${w.distance} km`);
              const detail = parts.join(' · ');

              return (
                <Link key={w.id} href={`${config?.route || '/'}?date=${todayDate}&id=${w.id}`}
                  className="flex items-center gap-2 bg-bg-elevated border border-border rounded-[10px] p-[10px_14px] flex-1 min-w-0 no-underline text-inherit transition-all duration-150 active:scale-[0.98]">
                  <div className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-base shrink-0 ${ICON_BG[w.type] || 'bg-bg'}`}>
                    {emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold truncate">{name}</div>
                    {detail && <div className="text-[11px] text-text-secondary mt-px truncate">{detail}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
        {todayDrafts.length > 0 && (
          <div className={`flex gap-2.5 ${data && data.today.length > 0 ? 'mt-2' : ''}`}>
            {todayDrafts.map((d) => (
              <Link key={`draft-${d.type}`} href={getDraftRoute(d)}
                className="flex items-center gap-2 bg-bg-elevated border border-dashed border-border rounded-[10px] p-[10px_14px] flex-1 min-w-0 no-underline text-inherit transition-all duration-150 active:scale-[0.98] opacity-50">
                <div className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-base shrink-0 ${ICON_BG[d.type] || 'bg-bg'}`}>
                  {d.emoji || '🎯'}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate">{d.name || t.workoutTypeLabels[d.type] || d.type}</div>
                  <div className="text-[11px] text-text-secondary mt-px truncate italic">{t.draft}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <button onClick={() => setShowSheet(true)}
          className={`w-full flex items-center justify-center gap-2 py-3 bg-[rgba(201,169,110,0.08)] border border-[rgba(201,169,110,0.15)] rounded-[10px] text-[#c9a96e] text-[13px] font-semibold font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98] ${data && data.today.length > 0 ? 'mt-2.5' : ''}`}>
          <span className="text-base">+</span>
          {t.startWorkout}
        </button>
      </div>

      {/* Weekly tracker */}
      <div className="bg-bg-card border border-border rounded-card p-5 mb-4 animate-fadeIn" style={{ animationDelay: '0.12s' }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{t.thisWeek}</span>
          <span className="text-[13px] font-semibold text-text-secondary">
            <strong className="text-[#e2c992] text-[15px]">{activeDays}</strong> / 7 {locale === 'fr' ? 'jours' : 'days'}
          </span>
        </div>
        <div className="flex justify-between gap-1.5">
          {weekDates.map((date, i) => {
            const types = weekByDay[date] || [];
            const isToday = date === todayDate;
            const barHeight = types.length > 0 ? Math.max(35, (types.length / maxWorkoutsPerDay) * 100) : 0;
            // Gradient from first workout color
            const firstColor = types.length > 0 ? (SPORT_COLORS[types[0]] || 'rgba(201,169,110,0.3)') : '';
            const secondColor = types.length > 1 ? (SPORT_COLORS[types[1]] || firstColor) : firstColor;

            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full h-16 bg-bg-elevated rounded-lg relative overflow-hidden flex flex-col justify-end">
                  {types.length > 0 && (
                    <div
                      className="w-full rounded-lg flex flex-col items-center justify-center gap-1 py-1.5 animate-barGrow"
                      style={{
                        '--target-height': `${barHeight}%`,
                        background: `linear-gradient(to top, ${firstColor}, ${secondColor.replace('0.4', '0.15')})`,
                        animationDelay: `${0.4 + i * 0.08}s`,
                      } as React.CSSProperties}
                    >
                      {types.map((type, j) => (
                        <div
                          key={j}
                          className="w-1.5 h-1.5 rounded-full animate-dotPop"
                          style={{
                            background: SPORT_COLORS_SOLID[type] || '#c9a96e',
                            animationDelay: `${0.6 + i * 0.08 + j * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? 'text-[#c9a96e]' : 'text-text-muted'}`}>
                  {t.daysInitials[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medals + Insights + Streak */}
      {isGuest ? (
        <BlurredOverlay>
          {/* Medals placeholder */}
          <div className="bg-bg-card border border-border rounded-card p-5 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(201,169,110,0.10) 0%, transparent 60%)' }} />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 border border-[rgba(201,169,110,0.2)]"
                style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.10), rgba(201,169,110,0.03))' }}>
                <span className="text-[26px]">🏅</span>
              </div>
              <div className="flex-1">
                <div className="font-serif text-4xl font-normal leading-none text-[#e2c992] tracking-tight">0</div>
                <div className="text-xs text-text-secondary mt-0.5 font-medium">{t.homeMedalsLabel}</div>
              </div>
            </div>
          </div>
          {/* Insights placeholder */}
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2.5">{t.weekSummary}</div>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <InsightCard icon="🏋️" value="0" unit={t.sessionsUnit} label={t.sessionsLabel} diff={0} diffLabel={t.vsLastWeek} stableLabel={t.stable} />
            <InsightCard icon="📏" value="0.0" unit="km" label={t.homeDistance} diff={0} diffLabel="0 km" stableLabel={t.stable} isDistance />
            <InsightCard icon="⏱️" value="0 min" unit="" label={t.activeTime} diff={0} diffLabel="0 min" stableLabel={t.stable} isDuration />
            <InsightCard icon="🔥" value="0" unit="kg" label={t.homeVolume} diff={0} diffLabel="0 kg" stableLabel={t.stable} />
          </div>
          {/* Streak placeholder */}
          <div className="bg-bg-card border border-border rounded-card p-[18px_20px] flex items-center gap-3.5">
            <span className="text-[28px] leading-none">🔥</span>
            <div className="flex-1">
              <div className="font-serif text-[22px] font-normal">
                <strong className="text-strength">0</strong> {t.consecutiveDays}
              </div>
            </div>
          </div>
        </BlurredOverlay>
      ) : (
        <>
          {/* Medals */}
          <div onClick={() => setShowMedalInfo(true)} className="bg-bg-card border border-border rounded-card p-5 mb-4 relative overflow-hidden animate-fadeIn cursor-pointer transition-all duration-150 active:scale-[0.98]" style={{ animationDelay: '0.18s' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(201,169,110,0.10) 0%, transparent 60%)' }} />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 border border-[rgba(201,169,110,0.2)]"
                style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.10), rgba(201,169,110,0.03))' }}>
                <span className="text-[26px]">🏅</span>
              </div>
              <div className="flex-1">
                <div className="font-serif text-4xl font-normal leading-none text-[#e2c992] tracking-tight">
                  {data?.medals.total ?? 0}
                </div>
                <div className="text-xs text-text-secondary mt-0.5 font-medium">{t.homeMedalsLabel}</div>
              </div>
              {data && data.medals.month > 0 && (
                <div className="text-[11px] font-semibold text-[#c9a96e] bg-[rgba(201,169,110,0.10)] border border-[rgba(201,169,110,0.15)] rounded-full py-1.5 px-3 whitespace-nowrap">
                  {t.monthMedals(data.medals.month)}
                </div>
              )}
            </div>
          </div>

          {/* Key insights */}
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2.5 animate-fadeIn" style={{ animationDelay: '0.24s' }}>
            {t.weekSummary}
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-4 animate-fadeIn" style={{ animationDelay: '0.26s' }}>
            <InsightCard icon="🏋️" value={String(ins?.sessions ?? 0)} unit={t.sessionsUnit} label={t.sessionsLabel} diff={sesDiff} diffLabel={t.vsLastWeek} stableLabel={t.stable} />
            <InsightCard icon="📏" value={(ins?.distance_km ?? 0).toFixed(1)} unit="km" label={t.homeDistance}
              diff={distDiff} diffLabel={`${Math.abs(distDiff).toFixed(1)} km`} stableLabel={t.stable} isDistance />
            <InsightCard icon="⏱️" value={formatDuration(ins?.duration_min ?? 0)} unit="" label={t.activeTime}
              diff={durDiff} diffLabel={`${Math.abs(durDiff)} min`} stableLabel={t.stable} isDuration />
            {(() => {
              const vol = formatVolume(ins?.volume_kg ?? 0);
              return (
                <InsightCard icon="🔥" value={vol.value} unit={vol.unit} label={t.homeVolume}
                  diff={volDiff} diffLabel={`${formatVolume(Math.abs(volDiff)).value} ${formatVolume(Math.abs(volDiff)).unit}`} stableLabel={t.stable} />
              );
            })()}
          </div>
        </>
      )}

      {/* Streak (authenticated only) */}
      {!isGuest && (data?.streak ?? 0) > 0 ? (
        <div className="bg-bg-card border border-border rounded-card p-[18px_20px] flex items-center gap-3.5 animate-fadeIn" style={{ animationDelay: '0.32s' }}>
          <span className="text-[28px] leading-none">🔥</span>
          <div className="flex-1">
            <div className="font-serif text-[22px] font-normal">
              <strong className="text-strength">{data?.streak}</strong> {t.consecutiveDays}
            </div>
            {(data?.best_streak ?? 0) > 0 && (
              <div className="text-[11px] text-text-muted font-medium mt-0.5">
                {t.bestStreak(data!.best_streak)}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Workout type picker modal */}
      <BottomSheet open={showSheet} onClose={() => setShowSheet(false)} desktopSidebarOffset>
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
              <Link key={type} href={`${config.route}?date=${todayDate}`}
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
      </BottomSheet>

      {/* Medal info modal */}
      {showMedalInfo && (
        <>
          <div onClick={() => setShowMedalInfo(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed inset-0 lg:left-[200px] z-[51] flex items-center justify-center px-8" onClick={() => setShowMedalInfo(false)}>
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
                {t.currentMedals(data?.medals.total ?? 0)}
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

function InsightCard({ icon, value, unit, label, diff, diffLabel, stableLabel, isDistance, isDuration }: {
  icon: string; value: string; unit: string; label: string;
  diff: number; diffLabel: string; stableLabel: string;
  isDistance?: boolean; isDuration?: boolean;
}) {
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className="bg-bg-card border border-border rounded-card p-4 relative overflow-hidden">
      <span className="text-lg mb-2.5 block">{icon}</span>
      <div className="font-serif text-[28px] font-normal leading-none tracking-tight">
        {value}
        {unit && <span className="font-sans text-[13px] font-medium text-text-secondary ml-0.5">{unit}</span>}
      </div>
      <div className="text-[11px] text-text-muted mt-1 font-medium">{label}</div>
      <div className={`inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-1.5 rounded mt-2 ${
        isUp ? 'text-running bg-running/10' : isDown ? 'text-text-muted bg-white/[0.05]' : 'text-text-muted bg-white/[0.05]'
      }`}>
        {isUp ? '↑' : isDown ? '↓' : '—'}
        {diff === 0 ? stableLabel : (
          isDistance || isDuration ? diffLabel : `${isUp ? '+' : ''}${diff} ${diffLabel}`
        )}
      </div>
    </div>
  );
}
