'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  fetchMonthlyStats,
  fetchYearlyStats,
  fetchMedalsHistory,
  fetchDistanceByType,
  fetchStrengthVolume,
  type MedalHistory,
  type DistanceByType,
  type StrengthVolume,
} from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { WORKOUT_TYPES, WORKOUT_CONFIG, type WorkoutType } from '@/lib/data';

// --- Constants ---

const SPORT_COLORS: Record<string, string> = {
  velo: '#3b9eff',
  musculation: '#ff8a3b',
  course: '#34d399',
  natation: '#06b6d4',
  marche: '#f59e0b',
  custom: '#a78bfa',
};

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: '#1a1b1f',
  border: '1px solid #2a2b32',
  borderRadius: 10,
  color: '#f0eff4',
};

const TOOLTIP_LABEL_STYLE = { color: '#8b8a94' };

const AXIS_TICK_STYLE = { fill: '#8b8a94', fontSize: 11 };

// --- Types ---

type Mode = 'month' | 'year';

interface ParsedStats {
  totalCount: number;
  countsByType: Record<string, number>;
  totalDistanceKm: number;
  totalElevationM: number;
  activeDays: number;
}

interface DistanceBarData {
  period: string;
  [key: string]: string | number;
}

// --- Component ---

export default function StatsPage() {
  const { t, locale } = useI18n();
  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  const today = new Date();
  const [mode, setMode] = useState<Mode>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ParsedStats>({
    totalCount: 0,
    countsByType: {},
    totalDistanceKm: 0,
    totalElevationM: 0,
    activeDays: 0,
  });
  const [medalsHistory, setMedalsHistory] = useState<MedalHistory[]>([]);
  const [distanceData, setDistanceData] = useState<DistanceByType[]>([]);
  const [strengthData, setStrengthData] = useState<StrengthVolume>({ total_tonnage: 0, exercise_count: 0, total_sets: 0 });
  const [distanceFilter, setDistanceFilter] = useState<string | null>(null);

  const monthYear = currentMonth.getFullYear();
  const monthIdx = currentMonth.getMonth();
  const monthStr = `${monthYear}-${String(monthIdx + 1).padStart(2, '0')}`;
  const yearStr = String(currentYear);

  // --- Medals history (once on mount) ---
  useEffect(() => {
    fetchMedalsHistory()
      .then(setMedalsHistory)
      .catch(() => {});
  }, []);

  // --- Period data ---
  const loadPeriodData = useCallback(async () => {
    setLoading(true);
    try {
      const params = mode === 'month'
        ? { month: monthStr }
        : { year: yearStr };

      const [statsData, distData, strData] = await Promise.all([
        mode === 'month' ? fetchMonthlyStats(monthStr) : fetchYearlyStats(yearStr),
        fetchDistanceByType(params),
        fetchStrengthVolume(params),
      ]);

      setStats({
        totalCount: parseInt(statsData.total_count) || 0,
        countsByType: Object.fromEntries(
          Object.entries(statsData.counts_by_type || {}).map(([k, v]) => [k, parseInt(v as string) || 0])
        ),
        totalDistanceKm: parseFloat(statsData.total_distance_km) || 0,
        totalElevationM: parseInt(statsData.total_elevation_m) || 0,
        activeDays: parseInt(statsData.active_days) || 0,
      });
      setDistanceData(distData);
      setStrengthData(strData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }, [mode, monthStr, yearStr]);

  useEffect(() => {
    loadPeriodData();
  }, [loadPeriodData]);

  // Reset distance filter on period change
  useEffect(() => {
    setDistanceFilter(null);
  }, [mode, monthStr, yearStr]);

  // --- Derived data ---

  // Medal chart data with month labels
  const medalChartData = useMemo(() => {
    return medalsHistory.map((entry) => {
      const d = new Date(entry.week_start + 'T00:00:00');
      return {
        weekStart: entry.week_start,
        monthLabel: t.monthsShort[d.getMonth()],
        medals: entry.medals,
        cumulative: entry.cumulative,
      };
    });
  }, [medalsHistory, t.monthsShort]);

  // Deduplicate X-axis month labels for medal chart
  const medalTickFormatter = useCallback((_value: string, index: number) => {
    if (index === 0) return medalChartData[0]?.monthLabel || '';
    const prev = medalChartData[index - 1]?.monthLabel;
    const curr = medalChartData[index]?.monthLabel;
    return curr !== prev ? curr || '' : '';
  }, [medalChartData]);

  // Pie chart data
  const pieData = useMemo(() => {
    return WORKOUT_TYPES
      .filter((type) => (stats.countsByType[type] || 0) > 0)
      .map((type) => ({
        name: type,
        value: stats.countsByType[type],
        color: SPORT_COLORS[type],
      }));
  }, [stats.countsByType]);

  // Bar chart data
  const barChartData = useMemo((): DistanceBarData[] => {
    if (distanceData.length === 0) return [];

    // Group by period
    const grouped: Record<string, Record<string, number>> = {};
    distanceData.forEach((row) => {
      const key = String(row.period_num);
      if (!grouped[key]) grouped[key] = {};
      grouped[key][row.type] = parseFloat(String(row.distance)) || 0;
    });

    // Sort by period number and build data array
    const sortedKeys = Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b));
    return sortedKeys.map((periodNum, idx) => {
      const label = mode === 'month'
        ? `${t.weekLabel}${idx + 1}`
        : t.monthsShort[parseInt(periodNum) - 1] || periodNum;
      return {
        period: label,
        ...grouped[periodNum],
      };
    });
  }, [distanceData, mode, t.weekLabel, t.monthsShort]);

  // Sport types that have distance data for bar chart
  const barSportTypes = useMemo(() => {
    const types = new Set<string>();
    distanceData.forEach((row) => {
      if ((parseFloat(String(row.distance)) || 0) > 0) {
        types.add(row.type);
      }
    });
    return WORKOUT_TYPES.filter((type) => types.has(type));
  }, [distanceData]);

  // Visible bar types based on filter
  const visibleBarTypes = useMemo(() => {
    if (distanceFilter === null) return barSportTypes;
    return barSportTypes.filter((type) => type === distanceFilter);
  }, [barSportTypes, distanceFilter]);

  // --- Navigation ---
  const prevPeriod = () => {
    if (mode === 'month') {
      setCurrentMonth(new Date(monthYear, monthIdx - 1, 1));
    } else {
      setCurrentYear((y) => y - 1);
    }
  };

  const nextPeriod = () => {
    if (mode === 'month') {
      setCurrentMonth(new Date(monthYear, monthIdx + 1, 1));
    } else {
      setCurrentYear((y) => y + 1);
    }
  };

  const periodLabel = mode === 'month'
    ? `${t.months[monthIdx]} ${monthYear}`
    : yearStr;

  // --- Emoji breakdown for summary card ---
  const emojiBreakdown = useMemo(() => {
    return WORKOUT_TYPES
      .filter((type) => (stats.countsByType[type] || 0) > 0)
      .map((type) => ({
        type,
        emoji: WORKOUT_CONFIG[type].defaultEmoji,
        count: stats.countsByType[type],
        color: SPORT_COLORS[type],
      }));
  }, [stats.countsByType]);

  // --- Render ---
  return (
    <div className="px-5 pb-24 lg:max-w-3xl lg:mx-auto">
      {/* Page title */}
      <div className="pt-14 pb-4 lg:pt-8">
        <h1 className="font-serif text-[22px] font-normal">{t.statsTitle}</h1>
      </div>

      {/* Section 1: Period Selector */}
      <div className="mb-5">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-bg-card border border-border rounded-card p-1 w-fit mb-4">
          <button
            onClick={() => setMode('month')}
            className={`px-4 py-1.5 rounded-sm text-[13px] font-medium transition-all duration-150 cursor-pointer border-none font-inherit ${
              mode === 'month'
                ? 'bg-bg-elevated text-text border border-border shadow-sm'
                : 'bg-transparent text-text-secondary'
            }`}
          >
            {t.monthLabel}
          </button>
          <button
            onClick={() => setMode('year')}
            className={`px-4 py-1.5 rounded-sm text-[13px] font-medium transition-all duration-150 cursor-pointer border-none font-inherit ${
              mode === 'year'
                ? 'bg-bg-elevated text-text border border-border shadow-sm'
                : 'bg-transparent text-text-secondary'
            }`}
          >
            {t.yearLabel}
          </button>
        </div>

        {/* Period navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevPeriod}
            className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-[0.92] active:bg-bg-elevated text-base"
          >
            &#8249;
          </button>
          <span className="text-[17px] font-semibold tracking-tight">{periodLabel}</span>
          <button
            onClick={nextPeriod}
            className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-[0.92] active:bg-bg-elevated text-base"
          >
            &#8250;
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-muted text-sm">
          {t.loading}
        </div>
      ) : (
        <>
          {/* Section 2: Summary Cards */}
          <div className="flex overflow-x-auto gap-3 pb-2 mb-6 -mx-5 px-5 scrollbar-none">
            {/* Total sessions */}
            <div className="min-w-[140px] bg-bg-card rounded-card p-4 border border-border shrink-0">
              <div className="text-[26px] font-bold tracking-tight leading-none text-text">
                {stats.totalCount}
              </div>
              <div className="text-xs text-text-muted mt-1 font-medium">{t.totalSessions}</div>
              {emojiBreakdown.length > 0 && (
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {emojiBreakdown.map((item) => (
                    <div key={item.type} className="flex items-center gap-0.5">
                      <span className="text-[13px]">{item.emoji}</span>
                      <span className="text-[13px] font-semibold" style={{ color: item.color }}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Distance */}
            <div className="min-w-[140px] bg-bg-card rounded-card p-4 border border-border shrink-0">
              <div className="text-[26px] font-bold tracking-tight leading-none text-accent">
                {stats.totalDistanceKm.toLocaleString(numberLocale)}
                <span className="text-sm font-normal opacity-60"> km</span>
              </div>
              <div className="text-xs text-text-muted mt-1 font-medium">{t.distanceCovered}</div>
            </div>

            {/* Elevation */}
            <div className="min-w-[140px] bg-bg-card rounded-card p-4 border border-border shrink-0">
              <div className="text-[26px] font-bold tracking-tight leading-none text-accent">
                {stats.totalElevationM.toLocaleString(numberLocale)}
                <span className="text-sm font-normal opacity-60"> m</span>
              </div>
              <div className="text-xs text-text-muted mt-1 font-medium">{t.totalElevation}</div>
            </div>

            {/* Active days */}
            <div className="min-w-[140px] bg-bg-card rounded-card p-4 border border-border shrink-0">
              <div className="text-[26px] font-bold tracking-tight leading-none text-text">
                {stats.activeDays}
              </div>
              <div className="text-xs text-text-muted mt-1 font-medium">{t.activeDays}</div>
            </div>
          </div>

          {/* Section 3: Medal Progression */}
          {medalChartData.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-text-secondary mb-3">{t.medalProgression}</h2>
              <div className="bg-bg-card rounded-card p-4 border border-border">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={medalChartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="medalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#2a2b32" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="weekStart"
                      tickFormatter={medalTickFormatter}
                      tick={AXIS_TICK_STYLE}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={AXIS_TICK_STYLE}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_CONTENT_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      labelFormatter={(label) => {
                        const d = new Date(String(label) + 'T00:00:00');
                        return `${d.getDate()} ${t.months[d.getMonth()]} ${d.getFullYear()}`;
                      }}
                      formatter={(value, name) => {
                        if (name === 'cumulative') return [value ?? 0, t.totalMedals];
                        return [value ?? 0, t.medals];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#a78bfa"
                      strokeWidth={2}
                      fill="url(#medalGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Section 4: Type Distribution */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-text-secondary mb-3">{t.typeDistribution}</h2>
            <div className="bg-bg-card rounded-card p-4 border border-border">
              {pieData.length === 0 ? (
                <div className="text-text-muted text-sm text-center py-8">{t.noData}</div>
              ) : (
                <>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center total */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-[22px] font-bold text-text">{stats.totalCount}</div>
                      </div>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-2">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[12px] text-text-secondary font-medium">
                          {t.workoutTypeLabels[entry.name]} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 5: Distance by Sport */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-text-secondary mb-3">{t.distanceBySport}</h2>
            <div className="bg-bg-card rounded-card p-4 border border-border">
              {barChartData.length === 0 ? (
                <div className="text-text-muted text-sm text-center py-8">{t.noData}</div>
              ) : (
                <>
                  {/* Filter chips */}
                  <div className="flex overflow-x-auto gap-2 pb-3 -mx-1 px-1 scrollbar-none">
                    <button
                      onClick={() => setDistanceFilter(null)}
                      className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-all duration-150 cursor-pointer border-none font-inherit ${
                        distanceFilter === null
                          ? 'text-white'
                          : 'bg-bg-elevated text-text-secondary'
                      }`}
                      style={distanceFilter === null ? { backgroundColor: '#a78bfa' } : undefined}
                    >
                      {t.allSports}
                    </button>
                    {barSportTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setDistanceFilter(distanceFilter === type ? null : type)}
                        className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-all duration-150 cursor-pointer border-none font-inherit ${
                          distanceFilter === type
                            ? 'text-white'
                            : 'bg-bg-elevated text-text-secondary'
                        }`}
                        style={distanceFilter === type ? { backgroundColor: SPORT_COLORS[type] } : undefined}
                      >
                        {WORKOUT_CONFIG[type as WorkoutType]?.defaultEmoji} {t.workoutTypeLabels[type]}
                      </button>
                    ))}
                  </div>

                  {/* Bar chart */}
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barChartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <CartesianGrid stroke="#2a2b32" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        tick={AXIS_TICK_STYLE}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={AXIS_TICK_STYLE}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={TOOLTIP_CONTENT_STYLE}
                        labelStyle={TOOLTIP_LABEL_STYLE}
                        formatter={(value, name) => {
                          const label = t.workoutTypeLabels[String(name)] || String(name);
                          return [`${parseFloat(String(value ?? 0)).toFixed(1)} km`, label];
                        }}
                      />
                      {visibleBarTypes.map((type) => (
                        <Bar
                          key={type}
                          dataKey={type}
                          stackId="distance"
                          fill={SPORT_COLORS[type]}
                          radius={visibleBarTypes.indexOf(type) === visibleBarTypes.length - 1 ? [3, 3, 0, 0] : undefined}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>

          {/* Section 6: Strength Volume */}
          {strengthData.total_sets > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-text-secondary mb-3">{t.strengthVolume}</h2>
              <div className="bg-bg-card rounded-card p-4 border border-border">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-[20px] font-bold text-accent tracking-tight">
                      {strengthData.total_tonnage.toLocaleString(numberLocale)}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5 font-medium">{t.totalTonnage}</div>
                    <div className="text-[11px] text-text-muted">kg</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[20px] font-bold text-text tracking-tight">
                      {strengthData.exercise_count}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5 font-medium">{t.totalExercises}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[20px] font-bold text-text tracking-tight">
                      {strengthData.total_sets}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5 font-medium">{t.totalSets}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
