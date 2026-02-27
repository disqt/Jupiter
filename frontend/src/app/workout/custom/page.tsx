'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WORKOUT_CONFIG } from '@/lib/data';
import { createWorkout, updateWorkout, fetchWorkout, deleteWorkout } from '@/lib/api';
import SaveAnimation from '@/components/SaveAnimation';
import WorkoutFormHeader from '@/components/WorkoutFormHeader';
import { useI18n } from '@/lib/i18n';

// --- Duration parsing utilities ---

function parseDuration(input: string): number | null {
  const s = input.trim();
  if (!s) return null;

  // "2h30", "2h30min", "2h", "2 h 30"
  const hm = s.match(/^(\d+)\s*h\s*(\d+)?\s*(min)?$/i);
  if (hm) {
    const h = parseInt(hm[1]);
    const m = hm[2] ? parseInt(hm[2]) : 0;
    return h * 60 + m;
  }

  // "1:45"
  const colon = s.match(/^(\d+):(\d{1,2})$/);
  if (colon) {
    return parseInt(colon[1]) * 60 + parseInt(colon[2]);
  }

  // "30min", "30m"
  const mOnly = s.match(/^(\d+)\s*(min|m)$/i);
  if (mOnly) {
    return parseInt(mOnly[1]);
  }

  // Plain number = minutes
  if (/^\d+$/.test(s)) {
    return parseInt(s);
  }

  return null;
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, '0')}min`;
}

function CustomWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const date = searchParams.get('date') || '';
  const workoutId = searchParams.get('id');

  const storageKey = workoutId ? `custom-edit-${workoutId}` : `custom-draft-${date}`;

  // Load draft from localStorage for new workouts
  const loadedDraft = (() => {
    if (workoutId || typeof window === 'undefined' || !date) return null;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  })();

  const [duration, setDuration] = useState(loadedDraft?.duration || '');
  const [distance, setDistance] = useState(loadedDraft?.distance || '');
  const [elevation, setElevation] = useState(loadedDraft?.elevation || '');
  const [activeFields, setActiveFields] = useState<Set<string>>(
    new Set(loadedDraft?.activeFields || [])
  );
  const [customEmoji, setCustomEmoji] = useState(loadedDraft?.customEmoji || '');
  const [customName, setCustomName] = useState(loadedDraft?.customName || '');
  const [saving, setSaving] = useState(false);
  const [loadingWorkout, setLoadingWorkout] = useState(!!workoutId);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  const toggleField = (field: string) => {
    setActiveFields(prev => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
        // Clear the field value too
        if (field === 'distance') setDistance('');
        if (field === 'elevation') setElevation('');
      } else {
        next.add(field);
      }
      return next;
    });
  };

  // Load existing workout from API (or edit draft from localStorage)
  useEffect(() => {
    if (!workoutId) return;
    // Check for edit draft first
    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        setDuration(parsed.duration || '');
        setDistance(parsed.distance || '');
        setElevation(parsed.elevation || '');
        setActiveFields(new Set(parsed.activeFields || []));
        setCustomEmoji(parsed.customEmoji || '');
        setCustomName(parsed.customName || '');
        setHasDraft(true);
        setEditing(true);
        setLoadingWorkout(false);
        return;
      }
    } catch { /* ignore */ }
    setLoadingWorkout(true);
    fetchWorkout(parseInt(workoutId)).then((data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wd = (data as any).workout_details as Record<string, unknown> | undefined;
      if (wd) {
        if (wd.duration) setDuration(formatDuration(Number(wd.duration)));
        const restoredFields = new Set<string>();
        if (wd.distance) {
          setDistance(String(wd.distance));
          restoredFields.add('distance');
        }
        if (wd.elevation) {
          setElevation(String(wd.elevation));
          restoredFields.add('elevation');
        }
        setActiveFields(restoredFields);
      }
      if (data.custom_emoji) setCustomEmoji(data.custom_emoji);
      if (data.custom_name) setCustomName(data.custom_name);
    }).catch(console.error).finally(() => setLoadingWorkout(false));
  }, [workoutId, storageKey]);

  // Auto-save draft to localStorage (new + edit)
  useEffect(() => {
    if (!date && !workoutId) return;
    if (workoutId && !editing) return;
    const data = { duration, distance, elevation, activeFields: Array.from(activeFields), customEmoji, customName };
    const hasData = duration || distance || elevation;
    if (hasData) {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [duration, distance, elevation, activeFields, customEmoji, customName, storageKey, date, workoutId, editing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        date,
        type: 'custom' as const,
        workout_details: {
          duration: duration ? parseDuration(duration) ?? undefined : undefined,
          distance: activeFields.has('distance') && distance ? parseFloat(distance) : undefined,
          elevation: activeFields.has('elevation') && elevation ? parseInt(elevation) : undefined,
        },
        custom_emoji: customEmoji || undefined,
        custom_name: customName || undefined,
      };

      localStorage.removeItem(storageKey);
      if (workoutId && editing) {
        await updateWorkout(parseInt(workoutId), payload);
        router.push('/');
      } else {
        await createWorkout(payload);
        setShowSaveAnimation(true);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaving(false);
    }
  };

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString(dateLocale, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <div className="px-5 pb-36 lg:max-w-xl lg:mx-auto lg:pb-20">
      <WorkoutFormHeader
        emoji={customEmoji || WORKOUT_CONFIG.custom.defaultEmoji}
        name={customName || t.customWorkoutTitle}
        defaultName={t.customWorkoutTitle}
        onEmojiChange={setCustomEmoji}
        onNameChange={setCustomName}
        onBack={() => router.push('/')}
        dateDisplay={dateDisplay}
        hasDraft={hasDraft}
      />

      {/* Duration — always visible */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{t.duration}</label>
        <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
          onBlur={() => {
            const mins = parseDuration(duration);
            if (mins !== null) setDuration(formatDuration(mins));
          }}
          placeholder={t.durationPlaceholder}
          disabled={!!workoutId && !editing}
          className={`w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted ${workoutId && !editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
      </div>

      {/* Active optional fields */}
      {activeFields.has('distance') && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide">{t.distance}</label>
            {(!workoutId || editing) && (
              <button type="button" onClick={() => toggleField('distance')}
                className="text-[11px] text-text-muted hover:text-red-400 transition-colors">{t.removeField}</button>
            )}
          </div>
          <input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="10.5"
            disabled={!!workoutId && !editing}
            className={`w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted ${workoutId && !editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
        </div>
      )}

      {activeFields.has('elevation') && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide">{t.elevation}</label>
            {(!workoutId || editing) && (
              <button type="button" onClick={() => toggleField('elevation')}
                className="text-[11px] text-text-muted hover:text-red-400 transition-colors">{t.removeField}</button>
            )}
          </div>
          <input type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} placeholder="680"
            disabled={!!workoutId && !editing}
            className={`w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted ${workoutId && !editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
        </div>
      )}

      {/* Add field buttons */}
      {(!workoutId || editing) && (!activeFields.has('distance') || !activeFields.has('elevation')) ? (
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

      {loadingWorkout && (
        <div className="text-text-muted text-[13px] text-center py-8">{t.loadingWorkout}</div>
      )}

      {showSaveAnimation && <SaveAnimation onComplete={() => router.push('/?saved=1')} />}

      {(!workoutId || editing) && (
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-custom-workout text-white shadow-[0_4px_20px_rgba(167,139,250,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide">
          {saving ? t.saving : t.save}
        </button>
      )}

      {/* Edit / Delete buttons for existing workout */}
      {workoutId && !editing && (
        <button onClick={() => setEditing(true)}
          className="w-full py-3.5 bg-bg-elevated border border-border rounded-card text-text text-[14px] font-medium font-inherit cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98]">
          {t.editWorkout}
        </button>
      )}
      {workoutId && (
        <button onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-3.5 bg-transparent border border-border rounded-card text-red-400 text-[14px] font-medium font-inherit cursor-pointer mt-3 transition-all duration-200 active:scale-[0.98] active:bg-red-500/10">
          {t.deleteWorkout}
        </button>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div onClick={() => setShowDeleteConfirm(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed inset-0 z-[51] flex items-center justify-center px-8" onClick={() => setShowDeleteConfirm(false)}>
            <div onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[320px] animate-fadeIn">
              <h3 className="text-[15px] font-semibold mb-2">{t.deleteConfirmTitle}</h3>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
                {t.deleteConfirmGeneric}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-bg-elevated border border-border rounded-sm text-text text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
                  {t.cancel}
                </button>
                <button onClick={async () => {
                  setDeleting(true);
                  try {
                    await deleteWorkout(parseInt(workoutId!));
                    localStorage.removeItem(storageKey);
                    router.push('/');
                  } catch (err) {
                    console.error('Delete failed:', err);
                    setDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }} disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500/15 border border-red-500/30 rounded-sm text-red-400 text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-50">
                  {deleting ? t.deleting : t.delete}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
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
