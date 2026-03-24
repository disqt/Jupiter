'use client';

import { Suspense } from 'react';
import { parseDuration, formatDuration } from '@/lib/duration';
import { useWorkoutForm } from '@/lib/useWorkoutForm';
import WorkoutFormShell from '@/components/WorkoutFormShell';
import CardioHeaderMenu from '@/components/CardioHeaderMenu';
import SessionTypeCard from '@/components/SessionTypeCard';
import TextInput from '@/components/TextInput';
import { useI18n } from '@/lib/i18n';

function WalkingWorkoutForm() {
  const { t } = useI18n();

  const form = useWorkoutForm({
    type: 'marche',
    storagePrefix: 'walking',
    defaultFields: { duration: '', distance: '', sessionType: '' },
    hasData: (f) => !!(f.duration || f.distance),
    buildPayload: (f) => ({
      workout_details: {
        duration: f.duration ? parseDuration(f.duration) ?? undefined : undefined,
        distance: f.distance ? parseFloat(f.distance) : undefined,
        session_type: f.sessionType || undefined,
      },
    }),
    validate: (f) => {
      if (!f.duration || parseDuration(f.duration) === null) return { message: t.errorInvalidDuration, fields: ['duration'] };
      if (f.distance && (isNaN(parseFloat(f.distance)) || parseFloat(f.distance) < 0)) return { message: t.errorInvalidDistance, fields: ['distance'] };
      return null;
    },
    loadFromApi: (wd) => ({
      duration: wd.duration ? formatDuration(Number(wd.duration)) : '',
      distance: wd.distance ? String(wd.distance) : '',
      sessionType: wd.session_type ? String(wd.session_type) : '',
    }),
  });

  return (
    <WorkoutFormShell form={form} color="walking" shadowColor="rgba(245,158,11,0.3)"
      headerRight={!form.loadingWorkout && (!form.workoutId || form.editing) ? <CardioHeaderMenu sportType="marche" /> : undefined}>
      <SessionTypeCard sportType="marche" value={form.fields.sessionType}
        onChange={(v) => form.setField('sessionType', v)} disabled={form.readOnly} accentColorClass="text-walking" />
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
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{t.distance} <span className="normal-case tracking-normal font-normal">{t.optionalField}</span></label>
          <TextInput inputMode="decimal" value={form.fields.distance}
            onChange={(e) => { const v = e.target.value.replace(',', '.'); if (/^[0-9]*\.?[0-9]{0,2}$/.test(v)) form.setField('distance', v); }}
            placeholder="5.0"
            disabled={form.readOnly}
            error={form.fieldErrors.has('distance')} />
        </div>
      </div>
    </WorkoutFormShell>
  );
}

export default function WalkingWorkout() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="p-5 text-text-muted">{t.loading}</div>}>
      <WalkingWorkoutForm />
    </Suspense>
  );
}
