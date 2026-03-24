'use client';

import { Suspense } from 'react';
import { SESSION_TYPES } from '@/lib/data';
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
    defaultFields: { duration: '', distance: '', sessionType: '', _activeFields: '' },
    hasData: (f) => !!(f.duration || f.distance),
    buildPayload: (f) => {
      const active = new Set(f._activeFields ? f._activeFields.split(',') : []);
      return {
        workout_details: {
          duration: f.duration ? parseDuration(f.duration) ?? undefined : undefined,
          distance: f.distance ? parseFloat(f.distance) : undefined,
          session_type: active.has('sessionType') && f.sessionType ? f.sessionType : undefined,
        },
      };
    },
    validate: (f) => {
      if (!f.duration || parseDuration(f.duration) === null) return { message: t.errorInvalidDuration, fields: ['duration'] };
      if (f.distance && (isNaN(parseFloat(f.distance)) || parseFloat(f.distance) < 0)) return { message: t.errorInvalidDistance, fields: ['distance'] };
      return null;
    },
    loadFromApi: (wd) => {
      const activeList: string[] = [];
      if (wd.session_type) activeList.push('sessionType');
      return {
        duration: wd.duration ? formatDuration(Number(wd.duration)) : '',
        distance: wd.distance ? String(wd.distance) : '',
        sessionType: wd.session_type ? String(wd.session_type) : '',
        _activeFields: activeList.join(','),
      };
    },
  });

  const activeFields = new Set(form.fields._activeFields ? form.fields._activeFields.split(',') : []);

  const toggleField = (field: string) => {
    const next = new Set(activeFields);
    if (next.has(field)) {
      next.delete(field);
      if (field === 'sessionType') form.setField('sessionType', '');
    } else {
      next.add(field);
    }
    form.setField('_activeFields', Array.from(next).join(','));
  };

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

      {/* Session type (optional toggle) */}
      {activeFields.has('sessionType') && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-text-muted uppercase tracking-wide">{t.sessionType}</label>
            {!form.readOnly && (
              <button type="button" onClick={() => toggleField('sessionType')}
                className="text-xs text-text-muted">{t.removeField}</button>
            )}
          </div>
          <select value={form.fields.sessionType}
            onChange={(e) => form.setField('sessionType', e.target.value)}
            disabled={form.readOnly}
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-[15px] text-text disabled:opacity-50">
            <option value="">{t.sessionType}</option>
            {SESSION_TYPES.course.map((st) => (
              <option key={st} value={st}>{t.sessionTypes[st]}</option>
            ))}
          </select>
        </div>
      )}

      {/* + Type de séance button */}
      {!form.readOnly && !activeFields.has('sessionType') && (
        <div className="mb-4">
          <button type="button" onClick={() => toggleField('sessionType')}
            className="py-2 px-3 bg-bg-card border border-border rounded-sm text-text-secondary text-[13px] font-medium transition-all duration-150 active:scale-[0.96]">
            {t.addSessionType}
          </button>
        </div>
      )}
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
