'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MUSCLE_GROUPS, WORKOUT_CONFIG } from '@/lib/data';
import { fetchExercises, fetchLastPerformance, fetchExerciseHistory, createExercise, createTemplate, deleteExercise, fetchTemplates, fetchWeeklyProgress, type Exercise, type HistorySet } from '@/lib/api';
import WorkoutRecap from '@/components/WorkoutRecap';
import { buildRecapData, type RecapData } from '@/lib/workout-recap-data';
import WorkoutFormHeader from '@/components/WorkoutFormHeader';
import BottomSheet from '@/components/BottomSheet';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { useI18n } from '@/lib/i18n';
import { useDataSource } from '@/lib/useDataSource';
import { useAuth } from '@/lib/auth';
import { getGuestWorkouts, getGuestTemplates, saveGuestTemplate } from '@/lib/guest-storage';
import { DEFAULT_EXERCISES } from '@/lib/default-exercises';
import ExerciseInfoModal from '@/components/ExerciseInfoModal';
import { EXERCISE_CATALOG, getCatalogExercise, getAllCatalogDetails, type CatalogDetails } from '@/lib/exercise-catalog';
import WorkoutGeneratorModal from '@/components/WorkoutGeneratorModal';
import { swapExercise, type GeneratedExercise, type GeneratorInput } from '@/lib/workout-generator';

const GUEST_EXERCISES_KEY = 'guest-exercises';

interface GuestExercise {
  id: number;
  name: string;
  muscle_group: string;
  default_mode?: string;
  catalog_id?: string | null;
}

function getGuestExercises(): GuestExercise[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(GUEST_EXERCISES_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  // Seed from defaults — include catalog_id
  const exercises = DEFAULT_EXERCISES.map((e, i) => ({
    id: i + 1,
    name: e.name,
    muscle_group: e.muscle_group,
    catalog_id: e.catalog_id,
  }));
  localStorage.setItem(GUEST_EXERCISES_KEY, JSON.stringify(exercises));
  return exercises;
}

function saveGuestExercise(name: string, muscleGroup: string, defaultMode: string = 'reps-weight', catalogId?: string): GuestExercise {
  const exercises = getGuestExercises();
  const maxId = exercises.reduce((max, e) => Math.max(max, e.id), 0);
  const newExercise = { id: maxId + 1, name, muscle_group: muscleGroup, default_mode: defaultMode, catalog_id: catalogId || null };
  exercises.push(newExercise);
  localStorage.setItem(GUEST_EXERCISES_KEY, JSON.stringify(exercises));
  return newExercise;
}

function getGuestLastPerformance(exerciseId: number): { sets: { set_number: number; reps: number; weight: string; mode?: string; duration?: number }[]; pinned_note: string | null } {
  const workouts = getGuestWorkouts();
  const sorted = workouts
    .filter(w => w.exercise_logs?.some(l => l.exercise_id === exerciseId))
    .sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return { sets: [], pinned_note: null };
  const sets = sorted[0].exercise_logs!
    .filter(l => l.exercise_id === exerciseId)
    .map(l => ({ set_number: l.set_number, reps: l.reps, weight: String(l.weight), mode: l.mode, duration: l.duration }));
  const pinnedNote = sorted[0].exercise_notes?.find(n => n.exercise_id === exerciseId && n.pinned)?.note || null;
  return { sets, pinned_note: pinnedNote };
}

function getGuestExerciseHistory(exerciseId: number): HistorySet[] {
  const workouts = getGuestWorkouts();
  return workouts
    .filter(w => w.exercise_logs?.some(l => l.exercise_id === exerciseId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .flatMap(w => {
      const note = w.exercise_notes?.find(n => n.exercise_id === exerciseId);
      return w.exercise_logs!
        .filter(l => l.exercise_id === exerciseId)
        .map(l => ({
          set_number: l.set_number,
          reps: l.reps,
          weight: String(l.weight),
          mode: l.mode || 'reps-weight',
          duration: l.duration || undefined,
          date: w.date,
          exercise_note: note?.note || null,
          note_pinned: note?.pinned || null,
        }));
    });
}

interface SetLog {
  setNumber: number;
  reps: string;
  weight: string;
  duration: string;
}

interface ExerciseEntry {
  exercise: { id: number; name: string; muscleGroup: string; catalogId?: string | null };
  sets: SetLog[];
  lastPerformance: { setNumber: number; reps: number; weight: number; mode?: string; duration?: number }[];
  mode: 'reps-weight' | 'time';
  note: string;
  notePinned: boolean;
  showNote: boolean;
}

function formatDurationSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${m}:00`;
}

function StrengthWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { isGuest } = useAuth();
  const dataSource = useDataSource();
  const date = searchParams.get('date') || '';
  const workoutId = searchParams.get('id');
  const templateMode = searchParams.get('templateMode') === '1';

  const storageKey = workoutId ? `strength-edit-${workoutId}` : `strength-draft-${date}`;

  const [exercises, setExercises] = useState<{ id: number; name: string; muscleGroup: string; defaultMode?: string; catalogId?: string | null }[]>([]);
  const [entries, setEntries] = useState<ExerciseEntry[]>(() => {
    if (workoutId) return []; // Will load from API (then check for edit draft)
    if (typeof window === 'undefined' || !date) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });
  const [hasDraft, setHasDraft] = useState(() => {
    if (workoutId || typeof window === 'undefined' || !date) return false;
    return !!localStorage.getItem(storageKey);
  });
  const [loadingWorkout, setLoadingWorkout] = useState(!!workoutId);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterMuscles, setFilterMuscles] = useState<Set<string>>(new Set());
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState('');
  const [newExerciseMode, setNewExerciseMode] = useState<'reps-weight' | 'time'>('reps-weight');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingRemoveExercise, setPendingRemoveExercise] = useState<number | null>(null);
  const [customEmoji, setCustomEmoji] = useState(() => {
    if (workoutId || typeof window === 'undefined' || !date) return '';
    try {
      const meta = localStorage.getItem(storageKey + '-meta');
      if (meta) return JSON.parse(meta).customEmoji || '';
    } catch { /* ignore */ }
    return '';
  });
  const [customName, setCustomName] = useState(() => {
    if (workoutId || typeof window === 'undefined' || !date) return '';
    try {
      const meta = localStorage.getItem(storageKey + '-meta');
      if (meta) return JSON.parse(meta).customName || '';
    } catch { /* ignore */ }
    return '';
  });
  const [historyExercise, setHistoryExercise] = useState<{ id: number; name: string } | null>(null);
  const [historyData, setHistoryData] = useState<HistorySet[]>([]);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [replacingExerciseIdx, setReplacingExerciseIdx] = useState<number | null>(null);
  const [showTrackingMode, setShowTrackingMode] = useState<number | null>(null);
  const [infoExercise, setInfoExercise] = useState<{ catalogId: string; name: string; muscleGroup: string } | null>(null);
  const [filterEquipment, setFilterEquipment] = useState<Set<string>>(new Set());
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showTemplateNameModal, setShowTemplateNameModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorInput, setGeneratorInput] = useState<GeneratorInput | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [showCoachTip, setShowCoachTip] = useState(false);
  const [pendingSwapIdx, setPendingSwapIdx] = useState<number | null>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close exercise menu on click outside
  useEffect(() => {
    if (openMenu === null) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  // Close header menu on click outside
  useEffect(() => {
    if (!showHeaderMenu) return;
    const handler = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) setShowHeaderMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showHeaderMenu]);

  // Load exercises from API or localStorage (guest)
  // API-side cleanup removes orphaned catalog exercises for authenticated users
  // Guest-side cleanup is done here
  useEffect(() => {
    if (isGuest) {
      const data = getGuestExercises();
      setExercises(data.map((e) => ({ id: e.id, name: e.name, muscleGroup: e.muscle_group, defaultMode: e.default_mode, catalogId: e.catalog_id })));
    } else {
      fetchExercises().then((data) => {
        setExercises(data.map((e) => ({ id: e.id, name: e.name, muscleGroup: e.muscle_group, defaultMode: e.default_mode, catalogId: e.catalog_id })));
      }).catch(console.error);
    }
  }, [isGuest]);

  // Load existing workout from API (or edit draft from localStorage)
  useEffect(() => {
    if (!workoutId || exercises.length === 0) return;
    // Check for edit draft first
    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        // Migrate old drafts without mode/duration
        const migrated = parsed.map((e: ExerciseEntry) => ({
          ...e,
          mode: e.mode || 'reps-weight',
          sets: e.sets.map((s: SetLog) => ({ ...s, duration: s.duration ?? '' })),
        }));
        setEntries(migrated);
        try {
          const meta = localStorage.getItem(storageKey + '-meta');
          if (meta) {
            const parsed = JSON.parse(meta);
            if (parsed.customEmoji) setCustomEmoji(parsed.customEmoji);
            if (parsed.customName) setCustomName(parsed.customName);
          }
        } catch { /* ignore */ }
        setHasDraft(true);
        setEditing(true);
        setLoadingWorkout(false);
        return;
      }
    } catch { /* ignore */ }
    setLoadingWorkout(true);
    const wId = isGuest ? workoutId : parseInt(workoutId);
    dataSource.fetchWorkout(wId).then((data) => {
      if (!data) { setLoadingWorkout(false); return; }
      if (data.exercise_logs && Array.isArray(data.exercise_logs)) {
        // Build notes lookup from exercise_notes
        const notesMap = new Map<number, { note: string; pinned: boolean }>();
        if (data.exercise_notes) {
          for (const en of data.exercise_notes) {
            notesMap.set(en.exercise_id, { note: en.note, pinned: en.pinned });
          }
        }
        // Group logs by exercise
        const grouped = new Map<number, { name: string; muscleGroup: string; mode: string; sets: { setNumber: number; reps: number; weight: string; duration?: number }[] }>();
        for (const log of data.exercise_logs) {
          const exId = (log as Record<string, unknown>).exercise_id as number;
          const exName = (log as Record<string, unknown>).exercise_name as string;
          const exGroup = (log as Record<string, unknown>).muscle_group as string;
          const logMode = ((log as Record<string, unknown>).mode as string) || 'reps-weight';
          if (!grouped.has(exId)) {
            grouped.set(exId, { name: exName, muscleGroup: exGroup, mode: logMode, sets: [] });
          }
          grouped.get(exId)!.sets.push({
            setNumber: (log as Record<string, unknown>).set_number as number,
            reps: (log as Record<string, unknown>).reps as number,
            weight: String((log as Record<string, unknown>).weight),
            duration: (log as Record<string, unknown>).duration as number | undefined,
          });
        }
        const loadedEntries: ExerciseEntry[] = [];
        grouped.forEach((val, exId) => {
          const noteData = notesMap.get(exId);
          const entryMode = (val.mode || 'reps-weight') as 'reps-weight' | 'time';
          loadedEntries.push({
            exercise: { id: exId, name: val.name, muscleGroup: val.muscleGroup },
            sets: val.sets.map((s) => ({ setNumber: s.setNumber, reps: String(s.reps), weight: s.weight, duration: s.duration != null ? String(s.duration) : '' })),
            lastPerformance: [],
            mode: entryMode,
            note: noteData?.note || '',
            notePinned: noteData?.pinned || false,
            showNote: !!(noteData?.note),
          });
        });
        setEntries(loadedEntries);
      }
      if (data.custom_emoji) setCustomEmoji(data.custom_emoji);
      if (data.custom_name) setCustomName(data.custom_name);
    }).catch(console.error).finally(() => setLoadingWorkout(false));
  }, [workoutId, exercises, storageKey]);

  // Apply template on mount
  const templateAppliedRef = useRef(false);
  useEffect(() => {
    if (templateAppliedRef.current) return;
    const templateParam = searchParams.get('template');
    if (!templateParam || exercises.length === 0) return;

    const raw = sessionStorage.getItem('apply-template');
    if (!raw) return;
    templateAppliedRef.current = true;
    sessionStorage.removeItem('apply-template');

    try {
      const template = JSON.parse(raw);
      if (!template.exercises || !Array.isArray(template.exercises)) return;

      const applyAsync = async () => {
        const newEntries: ExerciseEntry[] = [];

        for (const tplEx of template.exercises) {
          const exercise = exercises.find((e: { id: number }) => e.id === tplEx.exercise_id);
          if (!exercise) continue;

          // Fetch last performance
          let lastPerformance: { setNumber: number; reps: number; weight: number; mode?: string; duration?: number }[] = [];
          let pinnedNote = '';
          let notePinned = false;
          try {
            const lp = isGuest
              ? getGuestLastPerformance(exercise.id)
              : await fetchLastPerformance(exercise.id);
            lastPerformance = lp.sets.map((s: { set_number: number; reps: number; weight: string; mode?: string; duration?: number }) => ({
              setNumber: s.set_number,
              reps: s.reps,
              weight: parseFloat(s.weight),
              mode: s.mode,
              duration: s.duration,
            }));
            if (lp.pinned_note) {
              pinnedNote = lp.pinned_note;
              notePinned = true;
            }
          } catch { /* ignore */ }

          // Create empty sets based on template set_count
          const setCount = tplEx.set_count || 3;
          const sets: SetLog[] = Array.from({ length: setCount }, (_, i) => ({
            setNumber: i + 1,
            reps: '',
            weight: '',
            duration: '',
          }));

          // Template mode wins
          const mode = tplEx.mode || 'reps-weight';

          newEntries.push({
            exercise: { id: exercise.id, name: exercise.name, muscleGroup: exercise.muscleGroup, catalogId: exercise.catalogId },
            sets,
            lastPerformance,
            mode: mode as 'reps-weight' | 'time',
            note: pinnedNote,
            notePinned,
            showNote: !!pinnedNote,
          });
        }

        if (newEntries.length > 0) {
          setEntries(newEntries);
          // Clear existing draft so it gets replaced
          localStorage.removeItem(storageKey);
        }
      };

      applyAsync();

      // Strip template param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('template');
      window.history.replaceState({}, '', url.toString());
    } catch { /* ignore */ }
  }, [searchParams, exercises, isGuest, storageKey]);

  // Auto-save draft to localStorage (new + edit)
  useEffect(() => {
    if (!date && !workoutId) return;
    if (workoutId && !editing) return; // Don't save in read-only mode
    if (entries.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(entries));
      localStorage.setItem(storageKey + '-meta', JSON.stringify({ customEmoji, customName }));
      setHasDraft(true);
    } else {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey + '-meta');
      setHasDraft(false);
    }
  }, [entries, customEmoji, customName, storageKey, date, workoutId, editing]);

  const clearPendingDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  // Delay focus on search input so keyboard opens after modal is positioned
  useEffect(() => {
    if (showExercisePicker) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [showExercisePicker]);

  useEffect(() => {
    if (pendingDelete === null) return;
    document.addEventListener('click', clearPendingDelete);
    return () => document.removeEventListener('click', clearPendingDelete);
  }, [pendingDelete, clearPendingDelete]);

  // Collapse all exercises in view mode after loading
  useEffect(() => {
    if (!loadingWorkout && workoutId && !editing && entries.length > 0) {
      setCollapsed(new Set(entries.map((_, i) => i)));
    }
  }, [loadingWorkout]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open all when switching to edit mode
  useEffect(() => {
    if (editing) setCollapsed(new Set());
  }, [editing]);

  const toggleCollapse = (idx: number) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const entryHasData = (entry: ExerciseEntry) =>
    entry.sets.some(s => s.reps.trim() || s.weight.trim() || s.duration.trim());

  const getExerciseSummary = (entry: ExerciseEntry) => {
    if (entry.mode === 'time') {
      const filledSets = entry.sets.filter(s => s.duration.trim());
      const count = filledSets.length || entry.sets.length;
      if (filledSets.length === 0) return `${count} ${t.sets}`;
      const allSame = filledSets.every(s => s.duration === filledSets[0].duration);
      if (allSame) {
        const sec = parseInt(filledSets[0].duration);
        return `${filledSets.length}× ${formatDurationSeconds(sec)}`;
      }
      return `${filledSets.length} ${t.sets}`;
    }

    const filledSets = entry.sets.filter(s => s.reps);
    const count = filledSets.length || entry.sets.length;

    if (filledSets.length === 0) return `${count} ${t.sets}`;

    const allSameReps = filledSets.every(s => s.reps === filledSets[0].reps);
    const allSameWeight = filledSets.every(s => (s.weight || '0') === (filledSets[0].weight || '0'));

    if (allSameReps && allSameWeight) {
      const weight = parseFloat(filledSets[0].weight) || 0;
      return weight > 0
        ? `${filledSets.length}×${filledSets[0].reps} @ ${weight}kg`
        : `${filledSets.length}×${filledSets[0].reps}`;
    }

    return `${filledSets.length} ${t.sets}`;
  };

  const addExercise = async (exercise: { id: number; name: string; muscleGroup: string; defaultMode?: string; catalogId?: string | null }) => {
    // Fetch last performance + pinned note for this exercise
    let lastPerf: { setNumber: number; reps: number; weight: number; mode?: string; duration?: number }[] = [];
    let pinnedNote = '';
    try {
      const resp = isGuest
        ? getGuestLastPerformance(exercise.id)
        : await fetchLastPerformance(exercise.id);
      lastPerf = resp.sets.map((p) => ({
        setNumber: p.set_number,
        reps: p.reps,
        weight: parseFloat(p.weight),
        mode: p.mode,
        duration: p.duration,
      }));
      if (resp.pinned_note) pinnedNote = resp.pinned_note;
    } catch { /* no previous performance */ }

    const initialSets: SetLog[] = lastPerf.length > 0
      ? lastPerf.map((p) => ({ setNumber: p.setNumber, reps: '', weight: '', duration: '' }))
      : [{ setNumber: 1, reps: '', weight: '', duration: '' }];

    const mode = (exercise.defaultMode === 'time' ? 'time' : 'reps-weight') as 'reps-weight' | 'time';
    setEntries([...entries, {
      exercise, sets: initialSets, lastPerformance: lastPerf,
      mode,
      note: pinnedNote, notePinned: !!pinnedNote, showNote: !!pinnedNote,
    }]);
    setShowExercisePicker(false);
  };

  const handleGeneratorResult = async (generated: GeneratedExercise[], input: GeneratorInput) => {
    const newEntries: ExerciseEntry[] = [];
    const newExercises = [...exercises];

    for (const gen of generated) {
      const newEx = isGuest
        ? saveGuestExercise(gen.name, gen.muscleGroup, 'reps-weight', gen.catalogId)
        : await createExercise(gen.name, gen.muscleGroup, 'reps-weight', gen.catalogId);

      const mapped = { id: newEx.id, name: newEx.name, muscleGroup: newEx.muscle_group, defaultMode: newEx.default_mode, catalogId: gen.catalogId };
      newExercises.push(mapped);

      const sets: SetLog[] = Array.from({ length: gen.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: String(gen.reps),
        weight: '',
        duration: '',
      }));

      newEntries.push({
        exercise: mapped,
        sets,
        lastPerformance: [],
        mode: 'reps-weight',
        note: '',
        notePinned: false,
        showNote: false,
      });
    }

    setExercises(newExercises);
    setEntries(newEntries);
    setGeneratorInput(generated.length > 0 ? input : null);
    setShowCoachTip(generated.length > 0);
    setShowGenerator(false);
  };

  const handleSwapExercise = async (idx: number) => {
    if (!generatorInput) return;
    const entry = entries[idx];
    const catalogId = entry.exercise.catalogId;
    if (!catalogId) return;

    const allDetails = await getAllCatalogDetails();
    const det = allDetails[catalogId];
    const currentGen: GeneratedExercise = {
      catalogId,
      name: entry.exercise.name,
      muscleGroup: entry.exercise.muscleGroup,
      mechanic: (det?.mechanic as 'compound' | 'isolation' | null) || null,
      force: (det?.force as 'push' | 'pull' | 'static' | null) || null,
      sets: entry.sets.length,
      reps: parseInt(entry.sets[0]?.reps || '10'),
    };

    const allGen: GeneratedExercise[] = entries.map(e => {
      const cid = e.exercise.catalogId || '';
      const d = cid ? allDetails[cid] : undefined;
      return {
        catalogId: cid,
        name: e.exercise.name,
        muscleGroup: e.exercise.muscleGroup,
        mechanic: (d?.mechanic as 'compound' | 'isolation' | null) || null,
        force: (d?.force as 'push' | 'pull' | 'static' | null) || null,
        sets: e.sets.length,
        reps: 10,
      };
    });

    const swapped = swapExercise(currentGen, allGen, generatorInput, EXERCISE_CATALOG, allDetails);
    if (!swapped) return;

    const newEx = isGuest
      ? saveGuestExercise(swapped.name, swapped.muscleGroup, 'reps-weight', swapped.catalogId)
      : await createExercise(swapped.name, swapped.muscleGroup, 'reps-weight', swapped.catalogId);

    const mapped = { id: newEx.id, name: newEx.name, muscleGroup: newEx.muscle_group, defaultMode: newEx.default_mode, catalogId: swapped.catalogId };
    const newSets: SetLog[] = Array.from({ length: swapped.sets }, (_, i) => ({
      setNumber: i + 1,
      reps: String(swapped.reps),
      weight: '',
      duration: '',
    }));

    const newEntries = [...entries];
    newEntries[idx] = { ...newEntries[idx], exercise: mapped, sets: newSets, lastPerformance: [] };
    setEntries(newEntries);
    setExercises(prev => [...prev, mapped]);
  };

  const createAndAddExercise = async () => {
    if (!newExerciseName || !newExerciseMuscle) return;
    try {
      const newEx = isGuest
        ? saveGuestExercise(newExerciseName, newExerciseMuscle, newExerciseMode)
        : await createExercise(newExerciseName, newExerciseMuscle, newExerciseMode);
      const mapped = { id: newEx.id, name: newEx.name, muscleGroup: newEx.muscle_group, defaultMode: newEx.default_mode || newExerciseMode };
      setExercises([...exercises, mapped]);
      setNewExerciseName(''); setNewExerciseMuscle(''); setNewExerciseMode('reps-weight'); setShowNewExercise(false);
      if (replacingExerciseIdx !== null) {
        replaceExercise(replacingExerciseIdx, mapped);
      } else {
        addExercise(mapped);
      }
    } catch (err) {
      console.error('Failed to create exercise:', err);
    }
  };

  const updateSet = (entryIdx: number, setIdx: number, field: 'reps' | 'weight' | 'duration', value: string) => {
    const updated = [...entries];
    updated[entryIdx] = {
      ...updated[entryIdx],
      sets: updated[entryIdx].sets.map((s, i) => {
        if (i === setIdx) return { ...s, [field]: value };
        return s;
      }),
    };
    setEntries(updated);
  };

  // Auto-fill empty weight fields below on blur (not on every keystroke)
  const autoFillWeight = (entryIdx: number, setIdx: number) => {
    setEntries(prev => {
      const value = prev[entryIdx].sets[setIdx].weight;
      if (!value) return prev;
      const updated = [...prev];
      updated[entryIdx] = {
        ...updated[entryIdx],
        sets: updated[entryIdx].sets.map((s, i) => {
          if (i > setIdx && !s.weight) return { ...s, weight: value };
          return s;
        }),
      };
      return updated;
    });
  };

  const addSet = (entryIdx: number) => {
    const updated = [...entries];
    const sets = updated[entryIdx].sets;
    const lastWeight = sets.length > 0 ? sets[sets.length - 1].weight : '';
    const lastDuration = sets.length > 0 ? sets[sets.length - 1].duration : '';
    const nextNum = sets.length + 1;
    updated[entryIdx] = {
      ...updated[entryIdx],
      sets: [...sets, { setNumber: nextNum, reps: '', weight: lastWeight, duration: lastDuration }],
    };
    setEntries(updated);
  };

  const removeSet = (entryIdx: number, setIdx: number) => {
    const updated = [...entries];
    const newSets = updated[entryIdx].sets
      .filter((_, i) => i !== setIdx)
      .map((s, i) => ({ ...s, setNumber: i + 1 }));
    updated[entryIdx] = { ...updated[entryIdx], sets: newSets };
    setEntries(updated);
  };

  const removeExercise = (entryIdx: number) => {
    const removed = entries[entryIdx];
    setEntries(entries.filter((_, i) => i !== entryIdx));

    // Clean up unused catalog exercise: if it came from catalog and has no saved history or template usage, remove it
    if (removed?.exercise.catalogId) {
      const checkAndCleanup = async () => {
        try {
          // Check if exercise has saved workout history
          const lp = isGuest
            ? getGuestLastPerformance(removed.exercise.id)
            : await fetchLastPerformance(removed.exercise.id);
          if (lp.sets.length > 0) return; // Has history — keep it

          // Check if exercise is used in any template
          if (isGuest) {
            const templates = getGuestTemplates();
            if (templates.some(t => t.exercises.some(e => e.exercise_id === removed.exercise.id))) return;
            // Safe to remove from guest exercises
            const guestExercises = getGuestExercises();
            const filtered = guestExercises.filter(e => e.id !== removed.exercise.id);
            localStorage.setItem(GUEST_EXERCISES_KEY, JSON.stringify(filtered));
          } else {
            const templates = await fetchTemplates('musculation');
            if (templates.some(t => t.exercises.some(e => e.exercise_id === removed.exercise.id))) return;
            // Safe to remove
            await deleteExercise(removed.exercise.id);
          }
          setExercises(prev => prev.filter(e => e.id !== removed.exercise.id));
        } catch { /* ignore — keep the exercise */ }
      };
      checkAndCleanup();
    }
  };

  const openPickerForReplace = (entryIdx: number) => {
    const entry = entries[entryIdx];
    if (entry) {
      setFilterMuscles(new Set([entry.exercise.muscleGroup]));
      // Pre-apply equipment filter from the exercise's catalog entry
      const catalogEx = getCatalogExercise(entry.exercise.catalogId || '');
      if (catalogEx) {
        setFilterEquipment(new Set([catalogEx.equipment]));
      }
    }
    setShowExercisePicker(true);
  };

  const replaceExercise = async (entryIdx: number, exercise: { id: number; name: string; muscleGroup: string; defaultMode?: string; catalogId?: string | null }) => {
    let lastPerf: { setNumber: number; reps: number; weight: number; mode?: string; duration?: number }[] = [];
    let pinnedNote = '';
    try {
      const resp = isGuest
        ? getGuestLastPerformance(exercise.id)
        : await fetchLastPerformance(exercise.id);
      lastPerf = resp.sets.map((p) => ({
        setNumber: p.set_number,
        reps: p.reps,
        weight: parseFloat(p.weight),
        mode: p.mode,
        duration: p.duration,
      }));
      if (resp.pinned_note) pinnedNote = resp.pinned_note;
    } catch { /* no previous performance */ }

    const initialSets: SetLog[] = lastPerf.length > 0
      ? lastPerf.map((p) => ({ setNumber: p.setNumber, reps: '', weight: '', duration: '' }))
      : [{ setNumber: 1, reps: '', weight: '', duration: '' }];

    const newMode = (exercise.defaultMode === 'time' ? 'time' : 'reps-weight') as 'reps-weight' | 'time';
    const updated = [...entries];
    updated[entryIdx] = {
      exercise, sets: initialSets, lastPerformance: lastPerf,
      mode: newMode,
      note: pinnedNote, notePinned: !!pinnedNote, showNote: !!pinnedNote,
    };
    setEntries(updated);
    setShowExercisePicker(false);
    setReplacingExerciseIdx(null);
  };

  const autoFillDuration = (entryIdx: number, setIdx: number) => {
    setEntries(prev => {
      const value = prev[entryIdx].sets[setIdx].duration;
      if (!value) return prev;
      const updated = [...prev];
      updated[entryIdx] = {
        ...updated[entryIdx],
        sets: updated[entryIdx].sets.map((s, i) => {
          if (i > setIdx && !s.duration) return { ...s, duration: value };
          return s;
        }),
      };
      return updated;
    });
  };

  const toggleShowNote = (entryIdx: number) => {
    const updated = [...entries];
    updated[entryIdx] = { ...updated[entryIdx], showNote: !updated[entryIdx].showNote };
    setEntries(updated);
  };

  const updateNote = (entryIdx: number, value: string) => {
    const updated = [...entries];
    updated[entryIdx] = { ...updated[entryIdx], note: value };
    setEntries(updated);
  };

  const togglePin = (entryIdx: number) => {
    const updated = [...entries];
    updated[entryIdx] = { ...updated[entryIdx], notePinned: !updated[entryIdx].notePinned };
    setEntries(updated);
  };

  const [recapData, setRecapData] = useState<RecapData | null>(null);
  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    setSaveError('');

    // Validate every exercise has at least one valid set, and no set has invalid data
    for (const entry of entries) {
      let hasValidSet = false;
      for (const s of entry.sets) {
        if (entry.mode === 'time') {
          if (!s.duration.trim()) continue;
          const dur = parseInt(s.duration);
          if (isNaN(dur) || dur <= 0) {
            setSaveError(t.errorInvalidSetDuration);
            return;
          }
          hasValidSet = true;
        } else {
          if (!s.reps.trim()) continue;
          const reps = parseInt(s.reps);
          if (isNaN(reps) || reps <= 0) {
            setSaveError(t.errorInvalidReps);
            return;
          }
          if (s.weight.trim() && isNaN(parseFloat(s.weight))) {
            setSaveError(t.errorInvalidWeight);
            return;
          }
          hasValidSet = true;
        }
      }
      if (!hasValidSet) {
        setSaveError(t.errorNoValidSets(entry.exercise.name));
        return;
      }
    }

    setSaving(true);
    try {
      const exercise_logs = entries.flatMap((entry) =>
        entry.sets
          .filter((s) => entry.mode === 'time' ? s.duration.trim() : s.reps.trim())
          .map((s) => ({
            exercise_id: entry.exercise.id,
            exercise_name: entry.exercise.name,
            muscle_group: entry.exercise.muscleGroup,
            set_number: s.setNumber,
            reps: entry.mode === 'time' ? 0 : parseInt(s.reps),
            weight: entry.mode === 'time' ? 0 : (parseFloat(s.weight) || 0),
            mode: entry.mode,
            duration: entry.mode === 'time' ? parseInt(s.duration) : null,
          }))
      );

      const exercise_notes = entries
        .filter((entry) => entry.note)
        .map((entry) => ({
          exercise_id: entry.exercise.id,
          note: entry.note,
          pinned: entry.notePinned,
        }));

      const payload = {
        date,
        type: 'musculation' as const,
        custom_emoji: customEmoji || undefined,
        custom_name: customName || undefined,
        exercise_logs,
        exercise_notes: exercise_notes.length > 0 ? exercise_notes : undefined,
      };

      localStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey + '-meta');
      if (workoutId && editing) {
        const wId = isGuest ? workoutId : parseInt(workoutId);
        const result = await dataSource.updateWorkout(wId as any, payload);
        let weeklyProgress = null;
        if (!isGuest) {
          try { weeklyProgress = await fetchWeeklyProgress(); } catch {}
        }
        const previousTotalMedals = weeklyProgress
          ? parseInt(String(weeklyProgress.total_medals)) - Math.max(parseInt(String(weeklyProgress.week_count)) - 2, 0)
          : 0;
        const normalizedProgress1 = weeklyProgress ? {
          week_count: parseInt(String(weeklyProgress.week_count)),
          total_medals: parseInt(String(weeklyProgress.total_medals)),
          consecutive_weeks: weeklyProgress.consecutive_weeks,
        } : null;
        const recap = buildRecapData(
          { records: (result as any)?.records ?? [] },
          normalizedProgress1,
          payload,
          'musculation' as const,
          date,
          customEmoji || null,
          customName || null,
          previousTotalMedals,
        );
        setRecapData(recap);
      } else {
        const result = await dataSource.saveWorkout(payload);
        let weeklyProgress = null;
        if (!isGuest) {
          try { weeklyProgress = await fetchWeeklyProgress(); } catch {}
        }
        const previousTotalMedals = weeklyProgress
          ? parseInt(String(weeklyProgress.total_medals)) - Math.max(parseInt(String(weeklyProgress.week_count)) - 2, 0)
          : 0;
        const normalizedProgress2 = weeklyProgress ? {
          week_count: parseInt(String(weeklyProgress.week_count)),
          total_medals: parseInt(String(weeklyProgress.total_medals)),
          consecutive_weeks: weeklyProgress.consecutive_weeks,
        } : null;
        const recap = buildRecapData(
          { records: (result as any)?.records ?? [] },
          normalizedProgress2,
          payload,
          'musculation' as const,
          date,
          customEmoji || null,
          customName || null,
          previousTotalMedals,
        );
        setRecapData(recap);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(t.errorSaveFailed);
      setSaving(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim() || entries.length === 0) return;
    setSavingTemplate(true);
    try {
      const templateExercises = entries.map((entry, idx) => ({
        exercise_id: entry.exercise.id,
        exercise_name: entry.exercise.name,
        muscle_group: entry.exercise.muscleGroup,
        sort_order: idx,
        mode: entry.mode || 'reps-weight',
        set_count: entry.sets.length,
      }));

      if (isGuest) {
        saveGuestTemplate({
          name: templateName.trim(),
          workout_type: 'musculation',
          exercises: templateExercises,
        });
      } else {
        await createTemplate({
          name: templateName.trim(),
          workout_type: 'musculation',
          exercises: templateExercises.map(e => ({
            exercise_id: e.exercise_id,
            sort_order: e.sort_order,
            mode: e.mode,
            set_count: e.set_count,
          })),
        });
      }

      setShowTemplateNameModal(false);
      setTemplateName('');
      // Navigate back to templates page
      const params = new URLSearchParams({ type: 'musculation', date });
      router.push(`/workout/templates?${params.toString()}`);
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setSavingTemplate(false);
    }
  };

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString(dateLocale, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <div className="page-container px-5 pb-36 lg:pb-20">
      <WorkoutFormHeader
        emoji={customEmoji || WORKOUT_CONFIG.musculation.defaultEmoji}
        name={customName || t.strengthWorkout}
        defaultName={t.strengthWorkout}
        onEmojiChange={setCustomEmoji}
        onNameChange={setCustomName}
        onBack={() => router.push('/calendar')}
        dateDisplay={dateDisplay}
        hasDraft={hasDraft}
        onPersistMeta={workoutId ? (e, n) => { dataSource.patchWorkoutMeta(isGuest ? workoutId : parseInt(workoutId), { custom_emoji: e || null, custom_name: n || null }); } : undefined}
        headerRight={!loadingWorkout && (!workoutId || editing) ? (
          <div className="relative" ref={headerMenuRef}>
            <button
              onClick={() => setShowHeaderMenu(prev => !prev)}
              className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-90"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-text-secondary">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {showHeaderMenu && (
              <div className="absolute right-0 top-11 bg-bg-card border border-border rounded-xl shadow-lg z-50 min-w-[200px] overflow-hidden animate-fadeIn">
                <button
                  onClick={() => {
                    setShowHeaderMenu(false);
                    if (entries.length > 0) {
                      setShowOverwriteConfirm(true);
                    } else {
                      setShowGenerator(true);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] text-text cursor-pointer bg-transparent border-none font-inherit transition-colors hover:bg-bg-elevated active:bg-bg-elevated"
                >
                  <span className="shrink-0 text-[16px]">✨</span>
                  {t.generatorTitle}
                </button>
                <button
                  onClick={() => {
                    setShowHeaderMenu(false);
                    const params = new URLSearchParams({ type: 'musculation', date });
                    if (workoutId) params.set('from', workoutId);
                    router.push(`/workout/templates?${params.toString()}`);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] text-text cursor-pointer bg-transparent border-none font-inherit transition-colors hover:bg-bg-elevated active:bg-bg-elevated"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-strength shrink-0">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                  {t.templates}
                </button>
                {workoutId ? (
                  <button
                    onClick={() => { setShowHeaderMenu(false); setShowDeleteConfirm(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] text-red-400 cursor-pointer bg-transparent border-none font-inherit transition-colors hover:bg-bg-elevated active:bg-bg-elevated border-t border-t-border"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    {t.deleteWorkout}
                  </button>
                ) : hasDraft ? (
                  <button
                    onClick={() => {
                      setShowHeaderMenu(false);
                      localStorage.removeItem(storageKey);
                      localStorage.removeItem(storageKey + '-meta');
                      router.push('/calendar');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] text-red-400 cursor-pointer bg-transparent border-none font-inherit transition-colors hover:bg-bg-elevated active:bg-bg-elevated border-t border-t-border"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    {t.deleteDraft}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        ) : undefined}
      />

      {/* Coach tip — shown after generating a session */}
      {showCoachTip && generatorInput && entries.length > 0 && (
        <div className="relative mb-3 rounded-card overflow-hidden border border-strength/20 bg-strength/[0.06]">
          <div className="px-4 py-3.5 pr-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[15px]">💬</span>
              <span className="text-[13px] font-semibold text-strength uppercase tracking-wide">{t.coachTipTitle}</span>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">{t.coachTipText}</p>
          </div>
          <button
            onClick={() => setShowCoachTip(false)}
            className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full bg-transparent border-none cursor-pointer text-text-muted hover:text-text transition-colors duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Exercise cards — 2 columns on desktop */}
      {loadingWorkout ? (
        <div className="text-text-muted text-[13px] text-center py-8">{t.loadingWorkout}</div>
      ) : (
      <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
        {entries.map((entry, entryIdx) => {
          const isCollapsed = collapsed.has(entryIdx);
          return (
          <div key={entryIdx} className="bg-bg-card border border-border rounded-card p-4 mb-3 lg:mb-0">
            {/* Exercise header — chevron left, menu right */}
            <div className={`flex items-center gap-2.5 ${isCollapsed ? '' : 'mb-3.5'}`}>
              {/* Chevron + name: clickable to toggle collapse */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer" onClick={() => toggleCollapse(entryIdx)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`shrink-0 text-text-muted transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold">{entry.exercise.name}</div>
                  <div className="text-[11px] text-strength font-medium mt-0.5">
                    {t.muscleGroups[entry.exercise.muscleGroup] || entry.exercise.muscleGroup}
                    {isCollapsed && <span className="text-text-muted"> · {getExerciseSummary(entry)}</span>}
                  </div>
                </div>
              </div>
              {/* Swap button (only for generated sessions) */}
              {generatorInput && (!workoutId || editing) && (
                <button
                  onClick={(e) => { e.stopPropagation(); setPendingSwapIdx(entryIdx); }}
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-transparent border-none cursor-pointer transition-colors duration-150 active:bg-white/10 hover:bg-white/[0.06] text-text-muted hover:text-[#c9a96e]"
                  title={t.replaceExercise}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                  </svg>
                </button>
              )}
              {/* Three-dot menu */}
              <div className="relative shrink-0" ref={openMenu === entryIdx ? menuRef : undefined}>
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === entryIdx ? null : entryIdx); }}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent border-none cursor-pointer transition-colors duration-150 active:bg-white/10 hover:bg-white/[0.06]"
                  aria-label="Options"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-text-muted">
                    <circle cx="8" cy="3" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                    <circle cx="8" cy="13" r="1.5" />
                  </svg>
                </button>
                {openMenu === entryIdx && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-bg-card border border-border rounded-xl shadow-lg min-w-[180px] py-1.5 animate-fadeIn">
                    {/* History */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setOpenMenu(null);
                        setHistoryExercise({ id: entry.exercise.id, name: entry.exercise.name });
                        try {
                          const data = isGuest
                            ? getGuestExerciseHistory(entry.exercise.id)
                            : await fetchExerciseHistory(entry.exercise.id);
                          setHistoryData(data);
                        } catch { setHistoryData([]); }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 bg-transparent border-none text-text text-[13px] font-medium font-inherit cursor-pointer transition-colors duration-150 hover:bg-white/[0.06] active:bg-white/10 text-left"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-text-muted">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {t.viewHistory}
                    </button>
                    {/* Replace */}
                    {(!workoutId || editing) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(null);
                          if (entryHasData(entry)) {
                            setReplacingExerciseIdx(entryIdx);
                          } else {
                            setReplacingExerciseIdx(entryIdx);
                            openPickerForReplace(entryIdx);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 bg-transparent border-none text-text text-[13px] font-medium font-inherit cursor-pointer transition-colors duration-150 hover:bg-white/[0.06] active:bg-white/10 text-left"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-text-muted">
                          <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                        </svg>
                        {t.replaceExercise}
                      </button>
                    )}
                    {/* Tracking mode */}
                    {(!workoutId || editing) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(null); setShowTrackingMode(entryIdx); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 bg-transparent border-none text-text text-[13px] font-medium font-inherit cursor-pointer transition-colors duration-150 hover:bg-white/[0.06] active:bg-white/10 text-left"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-text-muted">
                          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                        </svg>
                        {t.trackingMode}
                      </button>
                    )}
                    {/* Note */}
                    {(!workoutId || editing) && !entry.showNote && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(null); toggleShowNote(entryIdx); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 bg-transparent border-none text-text text-[13px] font-medium font-inherit cursor-pointer transition-colors duration-150 hover:bg-white/[0.06] active:bg-white/10 text-left"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-text-muted">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        {t.addNote}
                      </button>
                    )}
                    {/* Remove */}
                    {(!workoutId || editing) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(null); setPendingRemoveExercise(entryIdx); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 bg-transparent border-none text-red-400 text-[13px] font-medium font-inherit cursor-pointer transition-colors duration-150 hover:bg-red-500/10 active:bg-red-500/15 text-left"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                        {t.remove}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible content */}
            <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}>
            {/* Sets header */}
            {entry.mode === 'time' ? (
              <div className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 mb-2">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.set}</span>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.previous}</span>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.durationLabel}</span>
              </div>
            ) : (
              <div className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 mb-2">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.set}</span>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.previous}</span>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.reps}</span>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.weight}</span>
              </div>
            )}

            {/* Set rows */}
            {entry.sets.map((set, setIdx) => {
              const lastPerf = entry.lastPerformance.find((p) => p.setNumber === set.setNumber);
              const canDelete = set.setNumber > 1;
              const deleteKey = `${entryIdx}-${setIdx}`;
              const isDeleting = pendingDelete === deleteKey;
              const setNumberCell = canDelete && (!workoutId || editing) ? (
                isDeleting ? (
                  <button onClick={(e) => { e.stopPropagation(); removeSet(entryIdx, setIdx); setPendingDelete(null); }}
                    aria-label="Confirmer suppression"
                    className="flex items-center justify-center w-7 h-7 mx-auto bg-danger/15 border border-danger/30 rounded-lg cursor-pointer p-0 animate-pulseDelete">
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                      <path d="M4.5 4.5h9M7.5 4.5V3a1.5 1.5 0 011.5-1.5h0A1.5 1.5 0 0110.5 3v1.5M6 7.5v6M9 7.5v6M12 7.5v6M5.25 4.5l.5 10a1.5 1.5 0 001.5 1.5h3.5a1.5 1.5 0 001.5-1.5l.5-10"
                        stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setPendingDelete(deleteKey); }}
                    className="text-center text-[13px] font-bold text-text bg-white/[0.08] border border-white/[0.15] rounded-lg w-7 h-7 leading-7 mx-auto cursor-pointer transition-all duration-200 p-0 font-inherit active:bg-white/[0.15]">
                    {set.setNumber}
                  </button>
                )
              ) : (
                <div className="text-center text-[13px] font-semibold text-text-muted leading-10">{set.setNumber}</div>
              );

              if (entry.mode === 'time') {
                return (
                  <div key={setIdx} className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 mb-1.5 items-center">
                    {setNumberCell}
                    <div className="text-center text-[11px] text-text-muted bg-bg rounded-md h-10 leading-10 border border-transparent overflow-hidden text-ellipsis whitespace-nowrap">
                      {lastPerf?.duration ? formatDurationSeconds(lastPerf.duration) : '-'}
                    </div>
                    <input type="text" inputMode="numeric" value={set.duration}
                      onChange={(e) => { if (/^[0-9]*$/.test(e.target.value)) updateSet(entryIdx, setIdx, 'duration', e.target.value); }}
                      onBlur={() => autoFillDuration(entryIdx, setIdx)}
                      disabled={!!workoutId && !editing}
                      placeholder={lastPerf?.duration ? String(lastPerf.duration) : t.durationSec}
                      className={`w-full min-w-0 text-center text-sm font-medium text-text bg-bg border border-border rounded-md h-10 leading-10 font-inherit outline-none transition-colors duration-200 focus:border-strength p-0 box-border placeholder:text-text-muted ${workoutId && !editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  </div>
                );
              }

              return (
                <div key={setIdx} className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 mb-1.5 items-center">
                  {setNumberCell}
                  <div className="text-center text-[11px] text-text-muted bg-bg rounded-md h-10 leading-10 border border-transparent overflow-hidden text-ellipsis whitespace-nowrap">
                    {lastPerf ? `${lastPerf.reps} × ${lastPerf.weight}kg` : '-'}
                  </div>
                  <input type="text" inputMode="numeric" value={set.reps}
                    onChange={(e) => { if (/^[0-9]*$/.test(e.target.value)) updateSet(entryIdx, setIdx, 'reps', e.target.value); }}
                    disabled={!!workoutId && !editing}
                    placeholder={lastPerf ? String(lastPerf.reps) : '0'}
                    className={`w-full min-w-0 text-center text-sm font-medium text-text bg-bg border border-border rounded-md h-10 leading-10 font-inherit outline-none transition-colors duration-200 focus:border-strength p-0 box-border placeholder:text-text-muted ${workoutId && !editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  <input type="text" inputMode="decimal" value={set.weight}
                    onChange={(e) => { if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) updateSet(entryIdx, setIdx, 'weight', e.target.value); }}
                    onBlur={() => autoFillWeight(entryIdx, setIdx)}
                    disabled={!!workoutId && !editing}
                    placeholder={lastPerf ? String(lastPerf.weight) : '0'}
                    className={`w-full min-w-0 text-center text-sm font-medium text-text bg-bg border border-border rounded-md h-10 leading-10 font-inherit outline-none transition-colors duration-200 focus:border-strength p-0 box-border placeholder:text-text-muted ${workoutId && !editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
                </div>
              );
            })}

            {/* Note section — edit mode */}
            {(!workoutId || editing) && (
              entry.showNote ? (
                <div className="relative mt-2 mb-1">
                  <input
                    type="text"
                    value={entry.note}
                    onChange={(e) => updateNote(entryIdx, e.target.value)}
                    placeholder={t.addNote}
                    className="w-full py-2.5 pl-3 pr-10 bg-bg border border-border rounded-lg text-text text-[13px] font-inherit outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted box-border"
                  />
                  <button
                    onClick={() => togglePin(entryIdx)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center"
                    aria-label={entry.notePinned ? t.unpin : t.pin}
                  >
                    {entry.notePinned ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9a96e" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 17v5M9 11V4a1 1 0 011-1h4a1 1 0 011 1v7" /><path d="M5 11h14l-1.5 6h-11z" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#55545e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 17v5M9 11V4a1 1 0 011-1h4a1 1 0 011 1v7" /><path d="M5 11h14l-1.5 6h-11z" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : null
            )}

            {/* Note section — view mode (read-only) */}
            {workoutId && !editing && entry.note && (
              <div className="mt-2 mb-1 flex items-center gap-1.5 px-3 py-2 bg-bg border border-border rounded-lg">
                {entry.notePinned && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a96e" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M12 17v5M9 11V4a1 1 0 011-1h4a1 1 0 011 1v7" /><path d="M5 11h14l-1.5 6h-11z" />
                  </svg>
                )}
                <span className="text-[13px] text-text-secondary">{entry.note}</span>
              </div>
            )}

            {(!workoutId || editing) && (
              <button onClick={() => addSet(entryIdx)}
                className="w-full py-2.5 mt-1 bg-transparent border border-dashed border-border rounded-lg text-text-muted text-[13px] font-inherit cursor-pointer transition-all duration-150 active:bg-bg-elevated">
                {t.addSet}
              </button>
            )}

            {/* Exercise info button — only when catalog_id exists */}
            {entry.exercise.catalogId && (
              <button
                onClick={() => setInfoExercise({
                  catalogId: entry.exercise.catalogId!,
                  name: entry.exercise.name,
                  muscleGroup: entry.exercise.muscleGroup,
                })}
                className="w-full py-2.5 mt-2 bg-transparent border border-border rounded-lg text-text-secondary text-[12px] font-medium font-inherit cursor-pointer transition-all duration-150 active:bg-bg-elevated flex items-center justify-center gap-1.5 tracking-wide"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                {t.exerciseInfo}
              </button>
            )}

            </div>
          </div>
          );
        })}
      </div>
      )}

      {/* Add exercise */}
      {(!workoutId || editing) && (
        <>
          {entries.length > 0 && (
            <button onClick={() => setShowExercisePicker(true)}
              className="w-full py-[18px] bg-transparent border-2 border-dashed border-border rounded-card text-text-muted text-sm font-medium font-inherit cursor-pointer mb-3 transition-all duration-200 active:border-strength active:text-strength mt-4">
              {t.addExercise}
            </button>
          )}
          {entries.length === 0 && !loadingWorkout && (
            <div className="flex flex-col items-center py-6 mb-4">
              {/* Illustration + text */}
              <div className="w-14 h-14 rounded-2xl bg-strength/10 flex items-center justify-center mb-4 cursor-pointer active:scale-[0.95] transition-transform" onClick={() => setShowExercisePicker(true)}>
                <span className="text-[28px] font-light text-strength leading-none">+</span>
              </div>
              <h3 className="text-[17px] font-semibold text-text mb-1">{t.generatorEmptyTitle}</h3>
              <p className="text-text-muted text-[13px] text-center max-w-[280px] mb-6">{t.generatorEmptySubtitle}</p>

              {/* 3 CTAs */}
              <div className="w-full flex flex-col gap-2.5">
                {/* Primary — Generate */}
                <button
                  onClick={() => setShowGenerator(true)}
                  className="w-full py-3.5 rounded-xl bg-strength text-white font-semibold text-[15px] flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(255,138,59,0.25)] transition-all duration-200 active:scale-[0.98] font-inherit cursor-pointer border-none"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v18M5 12l7-9 7 9M8 21h8" />
                  </svg>
                  {t.generatorEmptyCTA}
                </button>
                {/* Secondary — Templates */}
                <button
                  onClick={() => {
                    const params = new URLSearchParams({ type: 'musculation', date });
                    if (workoutId) params.set('from', workoutId);
                    router.push(`/workout/templates?${params.toString()}`);
                  }}
                  className="w-full py-3 flex items-center justify-center gap-2.5 bg-bg-card border border-border rounded-xl text-text text-[14px] font-medium font-inherit cursor-pointer transition-all duration-200 active:scale-[0.98]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                  {t.applyTemplate}
                </button>
                {/* Tertiary — From scratch */}
                <button
                  onClick={() => setShowExercisePicker(true)}
                  className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-muted text-[13px] font-medium font-inherit cursor-pointer bg-transparent transition-all duration-200 active:border-strength active:text-strength"
                >
                  {t.addExercise}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Save */}
      {saveError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-[13px] text-center">
          {saveError}
        </div>
      )}

      {entries.length > 0 && (!workoutId || editing) && (
        templateMode ? (
          <button onClick={() => setShowTemplateNameModal(true)}
            className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-strength text-white shadow-[0_4px_20px_rgba(255,138,59,0.3)] tracking-wide">
            {t.saveAsTemplate}
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving}
            className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-strength text-white shadow-[0_4px_20px_rgba(255,138,59,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide">
            {saving ? t.saving : t.saveWorkout}
          </button>
        )
      )}

      {/* Edit / Delete buttons for existing workout */}
      {workoutId && !editing && (
        <button onClick={() => setEditing(true)}
          className="w-full py-3.5 bg-bg-elevated border border-border rounded-card text-text text-[14px] font-medium font-inherit cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98]">
          {t.editWorkout}
        </button>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          setDeleting(true);
          try {
            await dataSource.deleteWorkout(isGuest ? workoutId! : parseInt(workoutId!));
            localStorage.removeItem(storageKey);
            localStorage.removeItem(storageKey + '-meta');
            router.push('/calendar');
          } catch (err) {
            console.error('Delete failed:', err);
            setDeleting(false);
            setShowDeleteConfirm(false);
          }
        }}
        deleting={deleting}
        message={t.deleteConfirmStrength}
      />

      {/* Remove exercise confirmation modal */}
      {pendingRemoveExercise !== null && (
        <>
          <div onClick={() => setPendingRemoveExercise(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed inset-0 z-[51] flex items-center justify-center px-8" onClick={() => setPendingRemoveExercise(null)}>
            <div onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[320px] animate-fadeIn">
              <h3 className="text-[15px] font-semibold mb-2">{t.removeExerciseConfirm}</h3>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
                {t.removeExerciseDesc}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPendingRemoveExercise(null)}
                  className="flex-1 py-2.5 bg-bg-elevated border border-border rounded-sm text-text text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
                  {t.cancel}
                </button>
                <button onClick={() => { removeExercise(pendingRemoveExercise); setPendingRemoveExercise(null); }}
                  className="flex-1 py-2.5 bg-red-500/15 border border-red-500/30 rounded-sm text-red-400 text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
                  {t.remove}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Replace exercise confirmation modal */}
      {replacingExerciseIdx !== null && !showExercisePicker && (
        <>
          <div onClick={() => setReplacingExerciseIdx(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed inset-0 z-[51] flex items-center justify-center px-8" onClick={() => setReplacingExerciseIdx(null)}>
            <div onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[320px] animate-fadeIn">
              <h3 className="text-[15px] font-semibold mb-2">{t.replaceExerciseConfirm}</h3>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
                {t.replaceExerciseDesc}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setReplacingExerciseIdx(null)}
                  className="flex-1 py-2.5 bg-bg-elevated border border-border rounded-sm text-text text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
                  {t.cancel}
                </button>
                <button onClick={() => openPickerForReplace(replacingExerciseIdx!)}
                  className="flex-1 py-2.5 bg-strength/15 border border-strength/30 rounded-sm text-strength text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
                  {t.replace}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tracking mode modal */}
      {showTrackingMode !== null && entries[showTrackingMode] && (
        <BottomSheet open={true} onClose={() => setShowTrackingMode(null)}>
          <h3 className="font-serif text-xl font-normal m-0 mb-4">{t.trackingMode}</h3>

          <button
            onClick={() => {
              const entry = entries[showTrackingMode];
              if (entry.mode === 'reps-weight') { setShowTrackingMode(null); return; }
              const updated = [...entries];
              updated[showTrackingMode] = {
                ...entry,
                mode: 'reps-weight',
                sets: entryHasData(entry) ? [{ setNumber: 1, reps: '', weight: '', duration: '' }] : entry.sets,
              };
              setEntries(updated);
              setShowTrackingMode(null);
            }}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 mb-3 bg-transparent cursor-pointer text-left font-inherit transition-all duration-150
              ${entries[showTrackingMode].mode === 'reps-weight' ? 'border-strength bg-strength/5' : 'border-border'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className={entries[showTrackingMode].mode === 'reps-weight' ? 'text-strength' : 'text-text-muted'}>
              <path d="M6 7v10M18 7v10M2 9v6M22 9v6M6 12h12M2 12h4M18 12h4" />
            </svg>
            <div>
              <div className="text-[15px] font-semibold text-text">{t.repsAndWeight}</div>
              <div className="text-[12px] text-text-muted mt-0.5">{t.repsAndWeightDesc}</div>
            </div>
          </button>

          <button
            onClick={() => {
              const entry = entries[showTrackingMode];
              if (entry.mode === 'time') { setShowTrackingMode(null); return; }
              const updated = [...entries];
              updated[showTrackingMode] = {
                ...entry,
                mode: 'time',
                sets: entryHasData(entry) ? [{ setNumber: 1, reps: '', weight: '', duration: '' }] : entry.sets,
              };
              setEntries(updated);
              setShowTrackingMode(null);
            }}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 mb-3 bg-transparent cursor-pointer text-left font-inherit transition-all duration-150
              ${entries[showTrackingMode].mode === 'time' ? 'border-strength bg-strength/5' : 'border-border'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className={entries[showTrackingMode].mode === 'time' ? 'text-strength' : 'text-text-muted'}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <div className="text-[15px] font-semibold text-text">{t.timeMode}</div>
              <div className="text-[12px] text-text-muted mt-0.5">{t.timeModeDesc}</div>
            </div>
          </button>

          {entryHasData(entries[showTrackingMode]) && (
            <p className="text-[12px] text-amber-400 text-center mt-1 mb-2">{t.trackingModeResetWarning}</p>
          )}

          <button onClick={() => setShowTrackingMode(null)}
            className="block w-full mt-2 py-3 bg-transparent border-none text-text-muted text-sm cursor-pointer font-inherit">
            {t.cancel}
          </button>
        </BottomSheet>
      )}

      {/* History modal */}
      {historyExercise && (() => {
        // Group history sets by date
        const grouped = new Map<string, { reps: number; weight: string; set_number: number; mode?: string; duration?: number; note?: string; pinned?: boolean }[]>();
        for (const row of historyData) {
          const d = row.date.includes('T')
            ? `${new Date(row.date).getFullYear()}-${String(new Date(row.date).getMonth() + 1).padStart(2, '0')}-${String(new Date(row.date).getDate()).padStart(2, '0')}`
            : row.date;
          if (!grouped.has(d)) grouped.set(d, []);
          grouped.get(d)!.push({ reps: row.reps, weight: row.weight, set_number: row.set_number, mode: row.mode, duration: row.duration, note: row.exercise_note || undefined, pinned: row.note_pinned || undefined });
        }
        const dateLocaleStr = locale === 'fr' ? 'fr-FR' : 'en-US';
        return (
          <BottomSheet open={true} onClose={() => setHistoryExercise(null)} className="max-h-[70vh] overflow-y-auto">
              <h3 className="font-serif text-xl font-normal m-0 mb-4">{historyExercise.name}</h3>
              {grouped.size === 0 ? (
                <div className="text-text-muted text-sm text-center py-6">{t.noHistory}</div>
              ) : (
                Array.from(grouped.entries()).map(([dateStr, sets]) => {
                  const d = new Date(dateStr + 'T00:00:00');
                  const label = d.toLocaleDateString(dateLocaleStr, { weekday: 'short', day: 'numeric', month: 'short' });
                  return (
                    <div key={dateStr} className="bg-bg border border-border rounded-sm p-3 mb-2.5">
                      <div className="text-[13px] font-semibold text-text mb-2 capitalize">{label}</div>
                      {sets[0]?.mode === 'time' ? (
                        <>
                          <div className="grid grid-cols-2 gap-1.5 mb-1">
                            <span className="text-center text-[10px] font-semibold text-text-muted uppercase">{t.set}</span>
                            <span className="text-center text-[10px] font-semibold text-text-muted uppercase">{t.durationLabel}</span>
                          </div>
                          {sets.map((s, j) => (
                            <div key={j} className="grid grid-cols-2 gap-1.5 py-1">
                              <span className="text-center text-[13px] font-semibold text-text-muted">{s.set_number}</span>
                              <span className="text-center text-[13px] text-text-secondary">{s.duration ? formatDurationSeconds(s.duration) : '-'}</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-1.5 mb-1">
                            <span className="text-center text-[10px] font-semibold text-text-muted uppercase">{t.set}</span>
                            <span className="text-center text-[10px] font-semibold text-text-muted uppercase">{t.reps}</span>
                            <span className="text-center text-[10px] font-semibold text-text-muted uppercase">{t.weight}</span>
                          </div>
                          {sets.map((s, j) => (
                            <div key={j} className="grid grid-cols-3 gap-1.5 py-1">
                              <span className="text-center text-[13px] font-semibold text-text-muted">{s.set_number}</span>
                              <span className="text-center text-[13px] text-text-secondary">{s.reps}</span>
                              <span className="text-center text-[13px] text-text-secondary">{parseFloat(s.weight) > 0 ? `${parseFloat(s.weight)} kg` : '-'}</span>
                            </div>
                          ))}
                        </>
                      )}
                      {sets[0]?.note && (
                        <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-border/50">
                          {sets[0].pinned && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#c9a96e" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                              <path d="M12 17v5M9 11V4a1 1 0 011-1h4a1 1 0 011 1v7" /><path d="M5 11h14l-1.5 6h-11z" />
                            </svg>
                          )}
                          <span className="text-[12px] text-text-muted italic">{sets[0].note}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <button onClick={() => setHistoryExercise(null)}
                className="block w-full mt-4 py-3 bg-transparent border-none text-text-muted text-sm cursor-pointer font-inherit">
                {t.cancel}
              </button>
          </BottomSheet>
        );
      })()}

      {/* Exercise picker modal */}
      {showExercisePicker && (() => {
        const query = exerciseSearch.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const activeFilterCount = (filterMuscles.size > 0 ? 1 : 0) + (filterLevel ? 1 : 0);
        const hasAdvancedFilters = activeFilterCount > 0;

        // Build list: user's existing exercises + catalog exercises not yet added
        const userExerciseNames = new Set(exercises.map(e => e.name.toLowerCase()));
        const catalogExercisesNotAdded = EXERCISE_CATALOG
          .filter(ce => !userExerciseNames.has((locale === 'fr' ? ce.name_fr : ce.name_en).toLowerCase()))
          .map(ce => ({
            id: -1, // sentinel: not yet a user exercise
            name: locale === 'fr' ? ce.name_fr : ce.name_en,
            muscleGroup: ce.muscle_group,
            catalogId: ce.id,
            equipment: ce.equipment,
            fromCatalog: true as const,
            defaultMode: undefined as string | undefined,
          }));
        const allPickerExercises = [
          ...exercises.map(e => ({ ...e, fromCatalog: false as const, equipment: getCatalogExercise(e.catalogId || '')?.equipment || '' })),
          ...catalogExercisesNotAdded,
        ];

        const filtered = allPickerExercises.filter((e) => {
          if (filterEquipment.size > 0 && !filterEquipment.has(e.equipment || '')) return false;
          if (filterMuscles.size > 0 && !filterMuscles.has(e.muscleGroup)) return false;
          // Advanced filter: level (read directly from catalog)
          if (filterLevel) {
            const cid = e.fromCatalog ? e.catalogId : (e as { catalogId?: string }).catalogId;
            const catalogEx = cid ? getCatalogExercise(cid) : undefined;
            if (!catalogEx || catalogEx.level !== filterLevel) return false;
          }
          if (!query) return true;
          return (
            e.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
            e.muscleGroup.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query)
          );
        });

        const handlePickerSelect = async (pickerExercise: typeof allPickerExercises[0]) => {
          if (pickerExercise.fromCatalog) {
            // Create from catalog
            const newEx = isGuest
              ? saveGuestExercise(pickerExercise.name, pickerExercise.muscleGroup, 'reps-weight', pickerExercise.catalogId)
              : await createExercise(pickerExercise.name, pickerExercise.muscleGroup, 'reps-weight', pickerExercise.catalogId);
            const mapped = { id: newEx.id, name: newEx.name, muscleGroup: newEx.muscle_group, defaultMode: newEx.default_mode, catalogId: newEx.catalog_id };
            setExercises([...exercises, mapped]);
            if (replacingExerciseIdx !== null) {
              replaceExercise(replacingExerciseIdx, mapped);
            } else {
              addExercise(mapped);
            }
          } else {
            // Existing user exercise — same as before
            if (replacingExerciseIdx !== null) {
              replaceExercise(replacingExerciseIdx, pickerExercise);
            } else {
              addExercise(pickerExercise);
            }
          }
          setExerciseSearch('');
        };

        return (
          <BottomSheet open={true} onClose={() => { setShowExercisePicker(false); setExerciseSearch(''); }} fullScreenMobile>
              {/* Sticky header + search + filters */}
              <div className="shrink-0 px-6 pt-[max(1.75rem,env(safe-area-inset-top))] pb-3 lg:pt-4">
                {/* Title row with "+ nouveau" button */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-[22px] font-normal m-0">{t.chooseExercise}</h3>
                  <button
                    onClick={() => { setShowExercisePicker(false); setExerciseSearch(''); setShowNewExercise(true); }}
                    className="px-3 py-1.5 bg-transparent border border-accent text-accent rounded-lg text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.97] hover:bg-accent/10"
                  >
                    {t.createExerciseShort}
                  </button>
                </div>
                {/* Search + filter button */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      ref={searchInputRef}
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      placeholder={t.search}
                      className="w-full py-3 pl-10 pr-3 bg-bg border border-border rounded-xl text-text text-[14px] font-inherit outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted box-border"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className={`relative shrink-0 w-[46px] flex items-center justify-center rounded-xl border transition-colors duration-150 ${
                      hasAdvancedFilters
                        ? 'bg-strength/15 border-strength text-strength'
                        : 'bg-bg border-border text-text-muted'
                    }`}
                    aria-label={t.filters}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
                      <circle cx="6" cy="6" r="2" fill={hasAdvancedFilters ? 'currentColor' : 'none'} /><circle cx="10" cy="12" r="2" fill={hasAdvancedFilters ? 'currentColor' : 'none'} /><circle cx="14" cy="18" r="2" fill={hasAdvancedFilters ? 'currentColor' : 'none'} />
                    </svg>
                    {hasAdvancedFilters && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-strength text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
                {/* Equipment filter pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mt-2 scrollbar-hide">
                  <button
                    onClick={() => setFilterEquipment(new Set())}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                      filterEquipment.size === 0
                        ? 'bg-strength text-white border-strength'
                        : 'bg-transparent text-text-secondary border-border'
                    }`}
                  >
                    {t.allEquipment}
                  </button>
                  {['body_only', 'barbell', 'dumbbell', 'cable', 'machine', 'kettlebells', 'bands'].map(eq => (
                    <button
                      key={eq}
                      onClick={() => setFilterEquipment(prev => {
                        const next = new Set(prev);
                        if (next.has(eq)) next.delete(eq); else next.add(eq);
                        return next;
                      })}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                        filterEquipment.has(eq)
                          ? 'bg-strength text-white border-strength'
                          : 'bg-transparent text-text-secondary border-border'
                      }`}
                    >
                      {t.equipmentLabels?.[eq] || eq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable exercise list */}
              <div className="flex-1 overflow-y-auto px-6 pb-10 overscroll-contain" data-bottom-sheet-scroll>
                {(() => {
                  const userFiltered = filtered.filter(e => !e.fromCatalog);
                  const catalogFiltered = filtered.filter(e => e.fromCatalog);

                  const renderGroup = (groupExercises: typeof filtered, group: string) => (
                    <div key={group}>
                      <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wide pt-3 pb-1.5 border-b border-border mb-1">
                        {t.muscleGroups[group] || group}
                      </div>
                      {groupExercises.map((ex) => {
                        const catalogEntry = ex.fromCatalog ? getCatalogExercise(ex.catalogId || String(ex.id)) : (ex.catalogId ? getCatalogExercise(ex.catalogId) : null);
                        const hasCatalogInfo = !!catalogEntry;
                        return (
                          <div key={`${ex.id}-${ex.name}`} className="flex items-center border-b border-border/50">
                            <button onClick={() => handlePickerSelect(ex)}
                              className="flex-1 text-left py-3 px-2 bg-transparent border-none text-text text-sm font-inherit cursor-pointer transition-all duration-100 active:bg-bg-elevated min-w-0">
                              <span className="truncate block">{ex.name}</span>
                            </button>
                            {hasCatalogInfo && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setInfoExercise({ catalogId: catalogEntry!.id, name: ex.name, muscleGroup: ex.muscleGroup }); }}
                                className="shrink-0 flex items-center justify-center w-11 h-11 bg-transparent border-none cursor-pointer -mr-2"
                                aria-label="Info"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );

                  const renderSection = (items: typeof filtered) =>
                    MUSCLE_GROUPS.map((group) => {
                      const groupExercises = items.filter((e) => e.muscleGroup === group).sort((a, b) => a.name.localeCompare(b.name, locale));
                      if (groupExercises.length === 0) return null;
                      return renderGroup(groupExercises, group);
                    });

                  if (filtered.length === 0) {
                    return <div className="text-text-muted text-sm text-center py-8">{t.noExerciseFound}</div>;
                  }

                  return (
                    <>
                      {/* User's exercises */}
                      {userFiltered.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2.5 pt-3 pb-2">
                            <div className="w-1 h-4 bg-strength rounded-full" />
                            <span className="text-[13px] font-semibold text-text tracking-wide">{t.myExercises}</span>
                            <span className="text-[11px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded-md font-medium">{userFiltered.length}</span>
                          </div>
                          {renderSection(userFiltered)}
                        </div>
                      )}

                      {/* Catalog exercises */}
                      {catalogFiltered.length > 0 && (
                        <div className={userFiltered.length > 0 ? 'mt-2' : ''}>
                          {userFiltered.length > 0 && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-border" />
                              <span className="text-[10px] text-text-muted uppercase tracking-widest">catalogue</span>
                              <div className="flex-1 h-px bg-border" />
                            </div>
                          )}
                          <div className="flex items-center gap-2.5 pb-2">
                            <div className="w-1 h-4 bg-text-muted rounded-full" />
                            <span className="text-[13px] font-semibold text-text tracking-wide">{t.catalogExercises}</span>
                            <span className="text-[11px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded-md font-medium">{catalogFiltered.length}</span>
                          </div>
                          {renderSection(catalogFiltered)}
                        </div>
                      )}
                    </>
                  );
                })()}
                <button onClick={() => { setShowExercisePicker(false); setReplacingExerciseIdx(null); setExerciseSearch(''); }}
                  className="block w-full py-3 bg-transparent border-none text-text-muted text-sm cursor-pointer font-inherit">
                  {t.cancel}
                </button>
              </div>
          </BottomSheet>
        );
      })()}

      {/* Advanced filter modal (overlay on top of exercise picker) */}
      {showFilterModal && (() => {
        const toggleMuscle = (m: string) => {
          setFilterMuscles(prev => {
            const next = new Set(prev);
            if (next.has(m)) next.delete(m); else next.add(m);
            return next;
          });
        };

        const filterSection = (
          title: string,
          options: { value: string; label: string }[],
          current: string,
          onChange: (v: string) => void,
        ) => (
          <div className="mb-5">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">{title}</div>
            <div className="flex flex-wrap gap-2">
              {options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange(current === opt.value ? '' : opt.value)}
                  className={`px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-all duration-150 active:scale-[0.97] ${
                    current === opt.value
                      ? 'bg-strength/15 border-strength text-strength'
                      : 'bg-bg border-border text-text-secondary hover:border-text-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );

        return (
          <>
            <div
              onClick={() => setShowFilterModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-overlayIn"
            />
            <div className="fixed inset-x-0 bottom-0 z-[61] flex items-end justify-center">
              <div className="w-full max-w-[430px] lg:max-w-lg bg-bg-card rounded-t-3xl animate-sheetUp max-h-[75dvh] flex flex-col">
                {/* Filter modal header */}
                <div className="shrink-0 px-6 pt-5 pb-3">
                  <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-serif text-[20px] font-normal m-0">{t.filters}</h4>
                    <button
                      onClick={() => {
                        setFilterMuscles(new Set());
                        setFilterLevel('');
                      }}
                      className="text-[13px] text-text-muted font-medium bg-transparent border-none cursor-pointer font-inherit hover:text-text-secondary transition-colors"
                    >
                      {t.resetFilters}
                    </button>
                  </div>
                </div>

                {/* Filter content */}
                <div className="flex-1 overflow-y-auto px-6 pb-6" data-bottom-sheet-scroll>
                  {/* Muscle groups — chip grid */}
                  <div className="mb-5">
                    <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">{t.muscleFilter}</div>
                    <div className="flex flex-wrap gap-2">
                      {MUSCLE_GROUPS.map(m => (
                        <button
                          key={m}
                          onClick={() => toggleMuscle(m)}
                          className={`px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-all duration-150 active:scale-[0.97] ${
                            filterMuscles.has(m)
                              ? 'bg-strength/15 border-strength text-strength'
                              : 'bg-bg border-border text-text-secondary hover:border-text-muted'
                          }`}
                        >
                          {t.muscleGroups[m] || m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Level */}
                  {filterSection(t.level, [
                    { value: 'beginner', label: t.levelLabels?.beginner || 'Beginner' },
                    { value: 'intermediate', label: t.levelLabels?.intermediate || 'Intermediate' },
                    { value: 'expert', label: t.levelLabels?.expert || 'Expert' },
                  ], filterLevel, setFilterLevel)}
                </div>

                {/* Apply button */}
                <div className="shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="w-full py-3.5 bg-strength text-white rounded-xl text-[15px] font-semibold border-none cursor-pointer font-inherit transition-all duration-150 active:scale-[0.98]"
                  >
                    {t.applyFilters}
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* Workout recap */}
      {recapData && <WorkoutRecap data={recapData} onComplete={() => router.push('/calendar')} isGuest={isGuest} />}

      {/* Exercise info modal */}
      {infoExercise && (
        <ExerciseInfoModal
          catalogId={infoExercise.catalogId}
          exerciseName={infoExercise.name}
          muscleGroup={infoExercise.muscleGroup}
          open={!!infoExercise}
          onClose={() => setInfoExercise(null)}
        />
      )}

      {/* New exercise modal */}
      <BottomSheet open={showNewExercise} onClose={() => setShowNewExercise(false)}>
        <h3 className="font-serif text-[22px] font-normal mb-5">{t.newExercise}</h3>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            {t.exerciseName}
          </label>
          <input type="text" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)}
            placeholder="Ex: Développé couché"
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted" />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            {t.muscleGroup}
          </label>
          <select value={newExerciseMuscle} onChange={(e) => setNewExerciseMuscle(e.target.value)}
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent appearance-none">
            <option value="">{t.choose}</option>
            {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{t.muscleGroups[g] || g}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            {t.trackingMode}
          </label>
          <div className="flex gap-2">
            <button onClick={() => setNewExerciseMode('reps-weight')}
              className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 bg-transparent cursor-pointer text-left font-inherit transition-all duration-150
                ${newExerciseMode === 'reps-weight' ? 'border-strength bg-strength/5' : 'border-border'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className={newExerciseMode === 'reps-weight' ? 'text-strength' : 'text-text-muted'}>
                <path d="M6 7v10M18 7v10M2 9v6M22 9v6M6 12h12M2 12h4M18 12h4" />
              </svg>
              <span className={`text-[13px] font-medium ${newExerciseMode === 'reps-weight' ? 'text-text' : 'text-text-muted'}`}>{t.repsAndWeight}</span>
            </button>
            <button onClick={() => setNewExerciseMode('time')}
              className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 bg-transparent cursor-pointer text-left font-inherit transition-all duration-150
                ${newExerciseMode === 'time' ? 'border-strength bg-strength/5' : 'border-border'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className={newExerciseMode === 'time' ? 'text-strength' : 'text-text-muted'}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span className={`text-[13px] font-medium ${newExerciseMode === 'time' ? 'text-text' : 'text-text-muted'}`}>{t.timeMode}</span>
            </button>
          </div>
        </div>
        <button onClick={createAndAddExercise}
          className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-strength text-white shadow-[0_4px_20px_rgba(255,138,59,0.3)]">
          {t.createAndAdd}
        </button>
        <button onClick={() => setShowNewExercise(false)}
          className="block w-full mt-4 py-3 bg-transparent border-none text-text-muted text-sm cursor-pointer font-inherit">
          {t.cancel}
        </button>
      </BottomSheet>

      {/* Template name modal */}
      <BottomSheet open={showTemplateNameModal} onClose={() => setShowTemplateNameModal(false)}>
        <div className="px-1 pb-2">
          <h3 className="text-[17px] font-semibold text-text mb-4">{t.createTemplate}</h3>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && templateName.trim()) handleSaveAsTemplate(); }}
            placeholder={t.templateNamePlaceholder}
            maxLength={100}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-[15px] placeholder:text-text-muted/50 outline-none focus:border-strength transition-colors mb-4"
          />
          <button
            onClick={handleSaveAsTemplate}
            disabled={!templateName.trim() || savingTemplate}
            className="w-full py-3.5 rounded-xl bg-strength text-white text-[15px] font-semibold cursor-pointer border-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,138,59,0.3)]"
          >
            {savingTemplate ? t.saving : t.saveTemplate}
          </button>
        </div>
      </BottomSheet>

      {/* Workout Generator Modal */}
      <WorkoutGeneratorModal
        open={showGenerator}
        onClose={() => setShowGenerator(false)}
        onGenerate={handleGeneratorResult}
      />

      {/* Swap confirmation */}
      {pendingSwapIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPendingSwapIdx(null)}>
          <div className="bg-bg-card border border-border rounded-2xl p-6 mx-4 max-w-sm" onClick={e => e.stopPropagation()}>
            <p className="text-text text-center mb-2 text-[15px] font-semibold">{entries[pendingSwapIdx]?.exercise.name}</p>
            <p className="text-text-secondary text-center mb-5 text-[13px]">{t.swapConfirm}</p>
            <div className="flex gap-3">
              <button onClick={() => setPendingSwapIdx(null)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary text-[14px] font-medium bg-transparent cursor-pointer font-inherit transition-all duration-150 active:scale-[0.98]">
                {t.cancel}
              </button>
              <button onClick={() => { const idx = pendingSwapIdx; setPendingSwapIdx(null); handleSwapExercise(idx); }} className="flex-1 py-2.5 rounded-xl bg-strength text-white text-[14px] font-semibold border-none cursor-pointer font-inherit transition-all duration-150 active:scale-[0.98]">
                {t.replaceExercise}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overwrite confirmation */}
      {showOverwriteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowOverwriteConfirm(false)}>
          <div className="bg-bg-card border border-border rounded-2xl p-6 mx-4 max-w-sm" onClick={e => e.stopPropagation()}>
            <p className="text-text text-center mb-5 text-[15px]">{t.generatorOverwriteConfirm}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowOverwriteConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary text-[14px] font-medium bg-transparent cursor-pointer font-inherit transition-all duration-150 active:scale-[0.98]">
                {t.cancel}
              </button>
              <button onClick={() => { setShowOverwriteConfirm(false); setShowGenerator(true); }} className="flex-1 py-2.5 rounded-xl bg-strength text-white text-[14px] font-semibold border-none cursor-pointer font-inherit transition-all duration-150 active:scale-[0.98]">
                {t.generatorNext}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StrengthWorkout() {
  return (
    <Suspense fallback={<div className="p-5 text-text-muted">Loading...</div>}>
      <StrengthWorkoutForm />
    </Suspense>
  );
}
