'use client';

import { Suspense } from 'react';
import { parseDuration, formatDuration } from '@/lib/duration';
import { useWorkoutForm } from '@/lib/useWorkoutForm';
import WorkoutFormShell from '@/components/WorkoutFormShell';
import TextInput from '@/components/TextInput';
import { useI18n } from '@/lib/i18n';

function RunningWorkoutForm() {
  const { t } = useI18n();

  const form = useWorkoutForm({
    type: 'course',
    storagePrefix: 'running',
    defaultFields: { duration: '', distance: '' },
    buildPayload: (f) => ({
      workout_details: {
        duration: f.duration ? parseDuration(f.duration) ?? undefined : undefined,
        distance: f.distance ? parseFloat(f.distance) : undefined,
      },
    }),
    validate: (f) => {
      if (f.duration && parseDuration(f.duration) === null) return { message: t.errorInvalidDuration, fields: ['duration'] };
      if (f.distance && (isNaN(parseFloat(f.distance)) || parseFloat(f.distance) < 0)) return { message: t.errorInvalidDistance, fields: ['distance'] };
      return null;
    },
    loadFromApi: (wd) => ({
      duration: wd.duration ? formatDuration(Number(wd.duration)) : '',
      distance: wd.distance ? String(wd.distance) : '',
    }),
  });

  return (
    <WorkoutFormShell form={form} color="running" shadowColor="rgba(52,211,153,0.3)">
      <div className="md:grid md:grid-cols-2 md:gap-4">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{t.duration}</label>
          <TextInput value={form.fields.duration} onChange={(e) => form.setField('duration', e.target.value)}
            onBlur={() => {
              const mins = parseDuration(form.fields.duration);
              if (mins !== null) form.setField('duration', formatDuration(mins));
            }}
            placeholder={t.durationPlaceholder}
            disabled={form.readOnly}
            error={form.fieldErrors.has('duration')} />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{t.distance}</label>
          <TextInput inputMode="decimal" value={form.fields.distance}
            onChange={(e) => { const v = e.target.value.replace(',', '.'); if (/^[0-9]*\.?[0-9]{0,2}$/.test(v)) form.setField('distance', v); }}
            placeholder="10.5"
            disabled={form.readOnly}
            error={form.fieldErrors.has('distance')} />
        </div>
      </div>
    </WorkoutFormShell>
  );
}

export default function RunningWorkout() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="p-5 text-text-muted">{t.loading}</div>}>
      <RunningWorkoutForm />
    </Suspense>
  );
}
