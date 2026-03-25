'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useI18n } from '@/lib/i18n';
import type { MuscleVolume } from '@/lib/api';

const MUSCLE_ORDER = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps',
  'Abdominaux', 'Quadriceps', 'Ischios', 'Fessiers', 'Mollets', 'Avant-bras',
];

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: '#1a1b1f',
  border: '1px solid #2a2b32',
  borderRadius: 10,
  color: '#f0eff4',
};

interface Props {
  data: MuscleVolume[];
  sessionCount: number;
  periodLabel: string;
}

export default function MuscleVolumeChart({ data, sessionCount, periodLabel }: Props) {
  const { t } = useI18n();
  const [mode, setMode] = useState<'sets' | 'reps'>('sets');

  // Sort data in canonical muscle order, only include groups that have data
  const chartData = MUSCLE_ORDER
    .map((mg) => data.find((d) => d.muscle_group === mg))
    .filter(Boolean) as MuscleVolume[];

  const modeLabel = mode === 'sets' ? t.statsSets : t.statsReps;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-secondary">{t.statsMuscleVolume}</h2>
        <div className="flex bg-bg-elevated rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setMode('sets')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              mode === 'sets' ? 'bg-[#ff8a3b] text-white' : 'text-text-muted'
            }`}
          >
            {t.statsSets}
          </button>
          <button
            onClick={() => setMode('reps')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              mode === 'reps' ? 'bg-[#ff8a3b] text-white' : 'text-text-muted'
            }`}
          >
            {t.statsReps}
          </button>
        </div>
      </div>
      <div className="bg-bg-card rounded-card p-3 border border-border min-w-0">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2b32" vertical={false} />
            <XAxis
              dataKey="muscle_group"
              tick={{ fill: '#8b8a94', fontSize: 10 }}
              tickFormatter={(val: string) => t.muscleGroupsShort[val] || val}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: '#8b8a94', fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT_STYLE}
              labelStyle={{ color: '#8b8a94' }}
              labelFormatter={(val: unknown) => {
                const s = String(val);
                return t.muscleGroups[s] || s;
              }}
              formatter={(value: number | undefined) => [value ?? 0, modeLabel]}
              cursor={{ fill: 'rgba(255,138,59,0.1)' }}
            />
            <Bar dataKey={mode} fill="#ff8a3b" radius={[4, 4, 0, 0]} animationDuration={400} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-text-muted text-center mt-1">
          {periodLabel} — {t.statsMuscleSessions(sessionCount)}
        </p>
      </div>
    </div>
  );
}
