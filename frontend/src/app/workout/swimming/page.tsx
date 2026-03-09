'use client';

import { Suspense } from 'react';
import { parseDuration, formatDuration } from '@/lib/duration';
import { useWorkoutForm } from '@/lib/useWorkoutForm';
import WorkoutFormShell from '@/components/WorkoutFormShell';
import { useI18n } from '@/lib/i18n';

function SwimmingWorkoutForm() {
  const { t } = useI18n();

  const form = useWorkoutForm({
    type: 'natation',
    storagePrefix: 'swimming',
    defaultFields: { duration: '', laps: '' },
    buildPayload: (f) => ({
      workout_details: {
        duration: f.duration ? parseDuration(f.duration) ?? undefined : undefined,
        laps: f.laps ? parseInt(f.laps) : undefined,
      },
    }),
    validate: (f) => {
      if (f.duration && parseDuration(f.duration) === null) return t.errorInvalidDuration;
      if (f.laps && (isNaN(parseInt(f.laps)) || parseInt(f.laps) < 0)) return t.errorInvalidLaps;
      return null;
    },
    loadFromApi: (wd) => ({
      duration: wd.duration ? formatDuration(Number(wd.duration)) : '',
      laps: wd.laps ? String(wd.laps) : '',
    }),
  });

  return (
    <WorkoutFormShell form={form} color="swimming" shadowColor="rgba(6,182,212,0.3)">
      <div className="md:grid md:grid-cols-2 md:gap-4">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{t.duration}</label>
          <input type="text" value={form.fields.duration} onChange={(e) => form.setField('duration', e.target.value)}
            onBlur={() => {
              const mins = parseDuration(form.fields.duration);
              if (mins !== null) form.setField('duration', formatDuration(mins));
            }}
            placeholder={t.durationPlaceholder}
            disabled={form.readOnly}
            className={`w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted ${form.readOnly ? 'opacity-50 cursor-not-allowed' : ''}`} />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{t.laps}</label>
          <input type="text" inputMode="numeric" value={form.fields.laps}
            onChange={(e) => { if (/^[0-9]*$/.test(e.target.value)) form.setField('laps', e.target.value); }}
            placeholder={t.lapsPlaceholder}
            disabled={form.readOnly}
            className={`w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted ${form.readOnly ? 'opacity-50 cursor-not-allowed' : ''}`} />
        </div>
      </div>
    </WorkoutFormShell>
  );
}

export default function SwimmingWorkout() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="p-5 text-text-muted">{t.loading}</div>}>
      <SwimmingWorkoutForm />
    </Suspense>
  );
}
