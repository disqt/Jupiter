'use client';

import { Suspense } from 'react';
import { parseDuration, formatDuration } from '@/lib/duration';
import { useWorkoutForm } from '@/lib/useWorkoutForm';
import WorkoutFormShell from '@/components/WorkoutFormShell';
import TextInput from '@/components/TextInput';
import { useI18n } from '@/lib/i18n';

function CustomWorkoutForm() {
  const { t } = useI18n();

  const form = useWorkoutForm({
    type: 'custom',
    storagePrefix: 'custom',
    defaultFields: { duration: '', distance: '', elevation: '', _activeFields: '' },
    buildPayload: (f) => {
      const active = new Set(f._activeFields ? f._activeFields.split(',') : []);
      return {
        workout_details: {
          duration: f.duration ? parseDuration(f.duration) ?? undefined : undefined,
          distance: active.has('distance') && f.distance ? parseFloat(f.distance) : undefined,
          elevation: active.has('elevation') && f.elevation ? parseInt(f.elevation) : undefined,
        },
      };
    },
    validate: (f) => {
      if (f.duration && parseDuration(f.duration) === null) return { message: t.errorInvalidDuration, fields: ['duration'] };
      const active = new Set(f._activeFields ? f._activeFields.split(',') : []);
      if (active.has('distance') && f.distance && (isNaN(parseFloat(f.distance)) || parseFloat(f.distance) < 0)) return { message: t.errorInvalidDistance, fields: ['distance'] };
      if (active.has('elevation') && f.elevation && (isNaN(parseInt(f.elevation)) || parseInt(f.elevation) < 0)) return { message: t.errorInvalidElevation, fields: ['elevation'] };
      return null;
    },
    loadFromApi: (wd) => {
      const activeList: string[] = [];
      if (wd.distance) activeList.push('distance');
      if (wd.elevation) activeList.push('elevation');
      return {
        duration: wd.duration ? formatDuration(Number(wd.duration)) : '',
        distance: wd.distance ? String(wd.distance) : '',
        elevation: wd.elevation ? String(wd.elevation) : '',
        _activeFields: activeList.join(','),
      };
    },
    hasData: (f) => !!(f.duration || f.distance || f.elevation),
  });

  const activeFields = new Set(form.fields._activeFields ? form.fields._activeFields.split(',') : []);

  const toggleField = (field: string) => {
    const next = new Set(activeFields);
    if (next.has(field)) {
      next.delete(field);
      if (field === 'distance') form.setField('distance', '');
      if (field === 'elevation') form.setField('elevation', '');
    } else {
      next.add(field);
    }
    form.setField('_activeFields', Array.from(next).join(','));
  };

  return (
    <WorkoutFormShell form={form} color="custom-workout" shadowColor="rgba(167,139,250,0.3)">
      {/* Duration — always visible */}
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

      {/* Active optional fields */}
      {activeFields.has('distance') && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide">{t.distance}</label>
            {!form.readOnly && (
              <button type="button" onClick={() => toggleField('distance')}
                className="text-[11px] text-text-muted hover:text-red-400 transition-colors">{t.removeField}</button>
            )}
          </div>
          <TextInput inputMode="decimal" value={form.fields.distance}
            onChange={(e) => { const v = e.target.value.replace(',', '.'); if (/^[0-9]*\.?[0-9]{0,2}$/.test(v)) form.setField('distance', v); }}
            placeholder="10.5"
            disabled={form.readOnly}
            error={form.fieldErrors.has('distance')} />
        </div>
      )}

      {activeFields.has('elevation') && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide">{t.elevation}</label>
            {!form.readOnly && (
              <button type="button" onClick={() => toggleField('elevation')}
                className="text-[11px] text-text-muted hover:text-red-400 transition-colors">{t.removeField}</button>
            )}
          </div>
          <TextInput inputMode="numeric" value={form.fields.elevation}
            onChange={(e) => { if (/^[0-9]*$/.test(e.target.value)) form.setField('elevation', e.target.value); }}
            placeholder="680"
            disabled={form.readOnly}
            error={form.fieldErrors.has('elevation')} />
        </div>
      )}

      {/* Add field buttons */}
      {!form.readOnly && (!activeFields.has('distance') || !activeFields.has('elevation')) ? (
        <div className="mb-4">
          <div className="flex gap-2">
            {!activeFields.has('distance') && (
              <button type="button" onClick={() => toggleField('distance')}
                className="py-2 px-3 bg-bg-card border border-border rounded-sm text-text-secondary text-[13px] font-medium transition-all duration-150 active:scale-[0.96]">
                + {t.distance}
              </button>
            )}
            {!activeFields.has('elevation') && (
              <button type="button" onClick={() => toggleField('elevation')}
                className="py-2 px-3 bg-bg-card border border-border rounded-sm text-text-secondary text-[13px] font-medium transition-all duration-150 active:scale-[0.96]">
                + {t.elevation}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </WorkoutFormShell>
  );
}

export default function CustomWorkout() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="p-5 text-text-muted">{t.loading}</div>}>
      <CustomWorkoutForm />
    </Suspense>
  );
}
