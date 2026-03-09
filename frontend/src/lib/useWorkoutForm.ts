'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WORKOUT_CONFIG, type WorkoutType } from '@/lib/data';
import { createWorkout, updateWorkout, fetchWorkout, deleteWorkout, patchWorkoutMeta } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export interface ValidationError<F> {
  message: string;
  fields?: (keyof F)[];
}

interface UseWorkoutFormOptions<F extends Record<string, string>> {
  type: WorkoutType;
  storagePrefix: string;
  defaultFields: F;
  buildPayload: (fields: F) => Record<string, unknown>;
  validate: (fields: F) => ValidationError<F> | null;
  loadFromApi: (apiData: Record<string, unknown>) => Partial<F>;
  hasData?: (fields: F) => boolean;
}

export interface UseWorkoutFormReturn<F extends Record<string, string>> {
  fields: F;
  setField: (name: keyof F, value: string) => void;
  setFields: (updates: Partial<F>) => void;
  handleSave: () => Promise<void>;
  saving: boolean;
  editing: boolean;
  setEditing: (v: boolean) => void;
  readOnly: boolean;
  saveError: string;
  fieldErrors: Set<keyof F>;
  loadingWorkout: boolean;
  showSaveAnimation: boolean;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;
  confirmDelete: () => Promise<void>;
  deleteDraft: () => void;
  deleting: boolean;
  dateDisplay: string;
  customEmoji: string;
  setCustomEmoji: (v: string) => void;
  customName: string;
  setCustomName: (v: string) => void;
  hasDraft: boolean;
  workoutId: string | null;
  date: string;
  headerProps: {
    emoji: string;
    name: string;
    defaultName: string;
    onEmojiChange: (emoji: string) => void;
    onNameChange: (name: string) => void;
    onBack: () => void;
    dateDisplay: string;
    hasDraft: boolean;
    onPersistMeta?: (emoji: string, name: string) => void;
  };
}

export function useWorkoutForm<F extends Record<string, string>>(
  options: UseWorkoutFormOptions<F>
): UseWorkoutFormReturn<F> {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useI18n();

  const date = searchParams.get('date') || '';
  const workoutId = searchParams.get('id');
  const storageKey = workoutId
    ? `${options.storagePrefix}-edit-${workoutId}`
    : `${options.storagePrefix}-draft-${date}`;

  const loadedDraft = (() => {
    if (workoutId || typeof window === 'undefined' || !date) return null;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  })();

  const [fieldsState, setFieldsState] = useState<F>(
    loadedDraft?.fields || options.defaultFields
  );
  const [customEmoji, setCustomEmoji] = useState<string>(loadedDraft?.customEmoji || '');
  const [customName, setCustomName] = useState<string>(loadedDraft?.customName || '');
  const [saving, setSaving] = useState(false);
  const [loadingWorkout, setLoadingWorkout] = useState(!!workoutId);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasDraft, setHasDraft] = useState(!!loadedDraft);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Set<keyof F>>(new Set());

  // Load existing workout
  useEffect(() => {
    if (!workoutId) return;
    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        setFieldsState(parsed.fields || options.defaultFields);
        setCustomEmoji(parsed.customEmoji || '');
        setCustomName(parsed.customName || '');
        setHasDraft(true);
        setEditing(true);
        setLoadingWorkout(false);
        return;
      }
    } catch { /* ignore */ }
    setLoadingWorkout(true);
    fetchWorkout(parseInt(workoutId))
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const details = options.type === 'velo'
          ? ((data as any).cycling_details as Record<string, unknown> || {})
          : ((data as any).workout_details as Record<string, unknown> || {});
        const loaded = options.loadFromApi(details);
        setFieldsState(prev => ({ ...prev, ...loaded }));
        if ((data as any).custom_emoji) setCustomEmoji((data as any).custom_emoji);
        if ((data as any).custom_name) setCustomName((data as any).custom_name);
      })
      .catch(console.error)
      .finally(() => setLoadingWorkout(false));
  }, [workoutId, storageKey]);

  // Auto-save draft
  useEffect(() => {
    if (!date && !workoutId) return;
    if (workoutId && !editing) return;
    const data = { fields: fieldsState, customEmoji, customName };
    const checkHasData = options.hasData || ((f: F) => Object.values(f).some(v => v !== ''));
    if (checkHasData(fieldsState)) {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setHasDraft(true);
    } else {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
    }
  }, [fieldsState, customEmoji, customName, storageKey, date, workoutId, editing]);

  const setField = (name: keyof F, value: string) => {
    setFieldsState(prev => ({ ...prev, [name]: value }));
    if (fieldErrors.has(name)) {
      setFieldErrors(prev => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      if (saveError) setSaveError('');
    }
  };

  const setFields = (updates: Partial<F>) => {
    setFieldsState(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setSaveError('');
    setFieldErrors(new Set());
    const error = options.validate(fieldsState);
    if (error) {
      setSaveError(error.message);
      if (error.fields) setFieldErrors(new Set(error.fields));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date,
        type: options.type,
        ...options.buildPayload(fieldsState),
        custom_emoji: customEmoji || undefined,
        custom_name: customName || undefined,
      };
      localStorage.removeItem(storageKey);
      if (workoutId && editing) {
        await updateWorkout(parseInt(workoutId), payload);
        router.push('/calendar');
      } else {
        await createWorkout(payload);
        setShowSaveAnimation(true);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(t.errorSaveFailed);
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteWorkout(parseInt(workoutId!));
      localStorage.removeItem(storageKey);
      router.push('/calendar');
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const deleteDraft = () => {
    localStorage.removeItem(storageKey);
    router.push('/calendar');
  };

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString(dateLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const readOnly = !!workoutId && !editing;

  const workoutNames: Record<string, string> = {
    velo: t.cyclingWorkout,
    course: t.runningWorkout,
    natation: t.swimmingWorkout,
    marche: t.walkingWorkout,
    custom: t.customWorkoutTitle,
  };
  const defaultName = workoutNames[options.type] || options.type;

  const headerProps = {
    emoji: customEmoji || WORKOUT_CONFIG[options.type].defaultEmoji,
    name: customName || defaultName,
    defaultName,
    onEmojiChange: setCustomEmoji,
    onNameChange: setCustomName,
    onBack: () => router.push('/calendar'),
    dateDisplay,
    hasDraft,
    onPersistMeta: workoutId
      ? (e: string, n: string) => {
          patchWorkoutMeta(parseInt(workoutId), {
            custom_emoji: e || null,
            custom_name: n || null,
          });
        }
      : undefined,
  };

  return {
    fields: fieldsState,
    setField,
    setFields,
    handleSave,
    saving,
    editing,
    setEditing,
    readOnly,
    saveError,
    fieldErrors,
    loadingWorkout,
    showSaveAnimation,
    showDeleteConfirm,
    setShowDeleteConfirm,
    confirmDelete,
    deleteDraft,
    deleting,
    dateDisplay,
    customEmoji,
    setCustomEmoji,
    customName,
    setCustomName,
    hasDraft,
    workoutId,
    date,
    headerProps,
  };
}
