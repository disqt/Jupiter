'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RecapData, REVEAL_TIMING, getVisibleBlocks } from '@/lib/workout-recap-data';
import { useI18n } from '@/lib/i18n';
import { WORKOUT_CONFIG } from '@/lib/data';

interface WorkoutRecapProps {
  data: RecapData;
  onComplete: () => void;
  isGuest: boolean;
}

// --- Formatting helpers ---

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatDistance(km: number): string {
  if (Number.isInteger(km)) return `${km} km`;
  return `${km.toFixed(1)} km`;
}

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const jsLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
  return d.toLocaleDateString(jsLocale, { weekday: 'long', day: 'numeric', month: 'long' });
}

// --- Divider component ---
function GoldDivider() {
  return (
    <div className="flex justify-center my-6">
      <div style={{ width: 48, height: 1, background: 'rgba(201,169,110,0.3)' }} />
    </div>
  );
}

// --- Main component ---
export default function WorkoutRecap({ data, onComplete, isGuest }: WorkoutRecapProps) {
  const { t, locale } = useI18n();
  const blocks = getVisibleBlocks(data, isGuest);
  // header is always visible — it's index 0, not counted in reveal countdown
  const revealableBlocks = blocks.filter((b) => b !== 'header' && b !== 'cta');
  const totalBlocks = revealableBlocks.length;

  const [revealedCount, setRevealedCount] = useState(0);
  const [levelBarWidth, setLevelBarWidth] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allRevealed = revealedCount >= totalBlocks;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= totalBlocks) {
          clearTimer();
          return prev;
        }
        return prev + 1;
      });
    }, REVEAL_TIMING.AUTO_DELAY);
  }, [clearTimer, totalBlocks]);

  // Start reveal after FIRST_DELAY
  useEffect(() => {
    const timeout = setTimeout(() => {
      setRevealedCount(1);
      startTimer();
    }, REVEAL_TIMING.FIRST_DELAY);
    return () => {
      clearTimeout(timeout);
      clearTimer();
    };
  }, [startTimer, clearTimer]);

  // Stop interval when all revealed
  useEffect(() => {
    if (allRevealed) clearTimer();
  }, [allRevealed, clearTimer]);

  // Level bar animation — trigger after level block is revealed
  useEffect(() => {
    const levelBlockIndex = revealableBlocks.indexOf('level');
    if (levelBlockIndex !== -1 && revealedCount > levelBlockIndex) {
      const timeout = setTimeout(() => {
        const pct = data.nextThreshold > data.currentThreshold
          ? ((data.medalsInLevel) / (data.nextThreshold - data.currentThreshold)) * 100
          : 100;
        setLevelBarWidth(Math.min(pct, 100));
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [revealedCount, revealableBlocks, data]);

  // Back button interception
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      setRevealedCount(totalBlocks);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [totalBlocks]);

  // Tap to accelerate
  const handleOverlayClick = () => {
    if (!allRevealed) {
      clearTimer();
      setRevealedCount((prev) => {
        const next = Math.min(prev + 1, totalBlocks);
        if (next < totalBlocks) {
          // restart timer after a short delay
          setTimeout(() => startTimer(), 100);
        }
        return next;
      });
    }
  };

  const config = WORKOUT_CONFIG[data.workoutType];
  const sportEmoji = data.customEmoji ?? config.defaultEmoji;

  const workoutLabel = (() => {
    if (data.workoutType === 'custom' && data.customName) return data.customName;
    return t.workoutTypeLabels[data.workoutType] ?? data.workoutType;
  })();

  // Helper: is block visible at given index in revealableBlocks?
  const isRevealed = (blockName: string) => {
    const idx = revealableBlocks.indexOf(blockName);
    return idx !== -1 && revealedCount > idx;
  };

  const revealClass = (blockName: string) =>
    `transition-all duration-[600ms] ${isRevealed(blockName) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`;

  const isCardio = ['velo', 'course', 'natation', 'marche'].includes(data.workoutType);
  const isMuscu = data.workoutType === 'musculation';

  const formatPRValue = (type: 'distance' | 'duration' | 'weight', value: number, exerciseName?: string): string => {
    if (type === 'distance') return `${formatDistance(value)} — ${t.recapLongestDistance}`;
    if (type === 'duration') return `${formatDuration(value)} — ${t.recapLongestDuration}`;
    if (type === 'weight') return `${value} kg — ${t.recapHeaviestWeight}${exerciseName ? ` — ${exerciseName}` : ''}`;
    return String(value);
  };

  const formatPRPrevious = (type: 'distance' | 'duration' | 'weight', previous: number): string => {
    const formatted = type === 'distance'
      ? formatDistance(previous)
      : type === 'duration'
      ? formatDuration(previous)
      : `${previous} kg`;
    return t.recapPrevious(formatted);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0a0a0a' }}
      onClick={handleOverlayClick}
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="flex flex-col items-center px-6 pt-12">

          {/* Header — always visible */}
          <div className="flex flex-col items-center mb-8">
            {/* Gold circle with checkmark */}
            <div
              className="flex items-center justify-center mb-5"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '1.5px solid rgba(201,169,110,0.6)',
                background: 'rgba(201,169,110,0.08)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M6 14.5L11.5 20L22 9"
                  stroke="#c9a96e"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Session complete label */}
            <p
              className="uppercase tracking-widest text-xs mb-3"
              style={{ color: '#555', letterSpacing: '0.15em' }}
            >
              {t.recapSessionComplete}
            </p>

            {/* Sport emoji + type + date */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{sportEmoji}</span>
              <span className="text-white font-medium text-base">{workoutLabel}</span>
              <span className="text-sm capitalize" style={{ color: '#666' }}>{formatDate(data.date, locale)}</span>
            </div>
          </div>

          {/* Block: stats */}
          <div className={revealClass('stats')} style={{ width: '100%', maxWidth: 320 }}>
            <div className="flex flex-col items-center gap-4 mb-2">
              {/* Primary metric */}
              {data.duration != null && (
                <div className="flex flex-col items-center">
                  <span
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 52, color: 'white', lineHeight: 1 }}
                  >
                    {formatDuration(data.duration)}
                  </span>
                  <span className="uppercase text-xs tracking-widest mt-1" style={{ color: '#555' }}>
                    {t.durationLabel}
                  </span>
                </div>
              )}

              {/* Secondary metrics row */}
              {isCardio && (data.distance != null || data.elevation != null) && (
                <div className="flex gap-8 justify-center">
                  {data.distance != null && (
                    <div className="flex flex-col items-center">
                      <span
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 28, color: 'white' }}
                      >
                        {formatDistance(data.distance)}
                      </span>
                      <span className="uppercase text-xs tracking-widest mt-0.5" style={{ color: '#555' }}>
                        {t.recapDistanceLabel}
                      </span>
                    </div>
                  )}
                  {data.elevation != null && data.elevation > 0 && (
                    <div className="flex flex-col items-center">
                      <span
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 28, color: 'white' }}
                      >
                        +{data.elevation} m
                      </span>
                      <span className="uppercase text-xs tracking-widest mt-0.5" style={{ color: '#555' }}>
                        {t.recapElevationLabel}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {isMuscu && (data.exerciseCount != null || data.totalVolume != null) && (
                <div className="flex gap-8 justify-center">
                  {data.exerciseCount != null && (
                    <div className="flex flex-col items-center">
                      <span
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 28, color: 'white' }}
                      >
                        {data.exerciseCount}
                      </span>
                      <span className="uppercase text-xs tracking-widest mt-0.5" style={{ color: '#555' }}>
                        {t.recapExercisesLabel}
                      </span>
                    </div>
                  )}
                  {data.totalVolume != null && data.totalVolume > 0 && (
                    <div className="flex flex-col items-center">
                      <span
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 28, color: 'white' }}
                      >
                        {data.totalVolume >= 1000
                          ? `${(data.totalVolume / 1000).toFixed(1)}t`
                          : `${data.totalVolume} kg`}
                      </span>
                      <span className="uppercase text-xs tracking-widest mt-0.5" style={{ color: '#555' }}>
                        {t.recapVolumeLabel}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Block: details */}
          {data.details.length > 0 && (
            <div className={revealClass('details')} style={{ width: '100%', maxWidth: 320 }}>
              <GoldDivider />
              <p className="text-center uppercase text-xs tracking-widest mb-4" style={{ color: '#555' }}>
                {t.recapDetails}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {data.details.map((chip, i) => (
                  <div
                    key={i}
                    className="rounded-full px-3.5 py-2 text-sm"
                    style={{
                      background: 'rgba(201,169,110,0.08)',
                      border: '1px solid rgba(201,169,110,0.15)',
                      color: '#d1d5db',
                    }}
                  >
                    <span style={{ color: '#c9a96e', fontWeight: 700 }}>{chip.value}</span>
                    {' '}
                    <span style={{ color: '#9ca3af', fontSize: 12 }}>{chip.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Block: records */}
          {data.records.length > 0 && (
            <div className={revealClass('records')} style={{ width: '100%', maxWidth: 320 }}>
              <GoldDivider />
              {data.records.map((pr, i) => (
                <div
                  key={i}
                  className="mb-3 rounded-2xl p-4"
                  style={{
                    background: 'rgba(201,169,110,0.06)',
                    border: '1px solid rgba(201,169,110,0.2)',
                    animation: isRevealed('records') ? 'recapPulse 0.6s ease-out' : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>⚡</span>
                    <span
                      className="uppercase text-xs tracking-widest font-bold"
                      style={{ color: '#c9a96e' }}
                    >
                      {t.recapNewRecord}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium">
                    {formatPRValue(pr.type, pr.value, pr.exerciseName)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#555' }}>
                    {pr.previous != null
                      ? formatPRPrevious(pr.type, pr.previous)
                      : t.recapFirstWorkout}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Block: streak */}
          {!isGuest && (
            <div className={revealClass('streak')} style={{ width: '100%', maxWidth: 320 }}>
              <GoldDivider />
              <div className="flex flex-col items-center gap-1">
                <span
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: 36,
                    color: '#c9a96e',
                    lineHeight: 1,
                  }}
                >
                  {data.weekCount}
                </span>
                <p className="text-white text-sm">
                  {t.recapWeekCount(data.weekCount)}
                </p>
                {data.consecutiveWeeks > 1 && (
                  <p className="text-sm mt-1" style={{ color: '#c9a96e' }}>
                    🔥 {t.recapConsecutiveWeeks(data.consecutiveWeeks)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Block: medal */}
          {!isGuest && data.medalsEarned > 0 && (
            <div className={revealClass('medal')} style={{ width: '100%', maxWidth: 320 }}>
              <GoldDivider />
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">🏅</span>
                <p className="text-white text-sm mt-1">
                  {t.recapMedalsEarned(data.medalsEarned)}
                </p>
              </div>
            </div>
          )}

          {/* Block: level */}
          {!isGuest && (
            <div className={revealClass('level')} style={{ width: '100%', maxWidth: 320 }}>
              <GoldDivider />
              <div className="flex flex-col items-center gap-3">
                {data.leveledUp ? (
                  <p className="font-bold text-base" style={{ color: '#c9a96e' }}>
                    {t.recapLevelUp(data.level)}
                  </p>
                ) : (
                  <p className="uppercase text-xs tracking-widest" style={{ color: '#555' }}>
                    {t.recapLevel(data.level)}
                  </p>
                )}

                {/* Progress bar */}
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 6, background: '#1a1a1a' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${levelBarWidth}%`,
                      background: 'linear-gradient(to right, #a0833a, #c9a96e)',
                      transition: `width ${REVEAL_TIMING.LEVEL_BAR_DURATION}ms ease-out`,
                    }}
                  />
                </div>

                <p className="text-xs" style={{ color: '#555' }}>
                  {t.recapMedalsToNext(data.medalsInLevel, data.nextThreshold - data.currentThreshold)}
                </p>
              </div>
            </div>
          )}

          {/* Bottom padding for CTA */}
          <div className="h-8" />
        </div>
      </div>

      {/* CTA — fixed at bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 flex flex-col items-center pb-8 pt-16 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #0a0a0a 40%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="pointer-events-auto rounded-xl font-bold text-[15px] px-10 py-4"
          style={{
            background: '#c9a96e',
            color: '#0a0a0a',
            opacity: allRevealed ? 1 : 0.5,
            transition: 'opacity 0.4s',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (allRevealed) onComplete();
          }}
        >
          {t.recapContinue}
        </button>
        {!allRevealed && (
          <p
            className="mt-3 text-xs pointer-events-none"
            style={{ color: '#444' }}
          >
            {t.recapTapToSkip}
          </p>
        )}
      </div>

      {/* CSS keyframe for PR pulse */}
      <style>{`
        @keyframes recapPulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
