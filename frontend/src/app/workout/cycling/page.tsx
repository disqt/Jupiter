'use client';

import { Suspense } from 'react';
import { RIDE_TYPES } from '@/lib/data';
import { parseDuration, formatDuration } from '@/lib/duration';
import { useWorkoutForm } from '@/lib/useWorkoutForm';
import WorkoutFormShell from '@/components/WorkoutFormShell';
import TextInput from '@/components/TextInput';
import { useI18n } from '@/lib/i18n';

function CyclingWorkoutForm() {
  const { t } = useI18n();

  const form = useWorkoutForm({
    type: 'velo',
    storagePrefix: 'cycling',
    defaultFields: { duration: '', distance: '', elevation: '', rideType: RIDE_TYPES[0] },
    hasData: (f) => !!(f.duration || f.distance || f.elevation),
    buildPayload: (f) => ({
      cycling_details: {
        duration: f.duration ? parseDuration(f.duration) ?? undefined : undefined,
        distance: f.distance ? parseFloat(f.distance) : undefined,
        elevation: f.elevation ? parseInt(f.elevation) : undefined,
        ride_type: f.rideType,
      },
    }),
    validate: (f) => {
      if (f.duration && parseDuration(f.duration) === null) return { message: t.errorInvalidDuration, fields: ['duration'] };
      if (f.distance && (isNaN(parseFloat(f.distance)) || parseFloat(f.distance) < 0)) return { message: t.errorInvalidDistance, fields: ['distance'] };
      if (f.elevation && (isNaN(parseInt(f.elevation)) || parseInt(f.elevation) < 0)) return { message: t.errorInvalidElevation, fields: ['elevation'] };
      return null;
    },
    loadFromApi: (cd) => ({
      duration: cd.duration ? formatDuration(Number(cd.duration)) : '',
      distance: cd.distance ? String(cd.distance) : '',
      elevation: cd.elevation ? String(cd.elevation) : '',
      rideType: cd.ride_type ? String(cd.ride_type) : RIDE_TYPES[0],
    }),
  });

  return (
    <WorkoutFormShell form={form} color="cycling" shadowColor="rgba(59,158,255,0.3)" deleteMessage={t.deleteConfirmCycling}>
      <div className="md:grid md:grid-cols-2 md:gap-4">
        {/* Ride Type */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{t.rideType}</label>
          <select value={form.fields.rideType} onChange={(e) => form.setField('rideType', e.target.value)}
            disabled={form.readOnly}
            className={`w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent appearance-none ${form.readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {RIDE_TYPES.map((rt) => <option key={rt} value={rt}>{t.rideTypes[rt] || rt}</option>)}
          </select>
        </div>

        {/* Duration */}
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

        {/* Distance */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{t.distance}</label>
          <TextInput inputMode="decimal" value={form.fields.distance}
            onChange={(e) => { if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) form.setField('distance', e.target.value); }}
            placeholder="42.5"
            disabled={form.readOnly}
            error={form.fieldErrors.has('distance')} />
        </div>

        {/* Elevation */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{t.elevation}</label>
          <TextInput inputMode="numeric" value={form.fields.elevation}
            onChange={(e) => { if (/^[0-9]*$/.test(e.target.value)) form.setField('elevation', e.target.value); }}
            placeholder="680"
            disabled={form.readOnly}
            error={form.fieldErrors.has('elevation')} />
        </div>
      </div>
    </WorkoutFormShell>
  );
}

export default function CyclingWorkout() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="p-5 text-text-muted">{t.loading}</div>}>
      <CyclingWorkoutForm />
    </Suspense>
  );
}
