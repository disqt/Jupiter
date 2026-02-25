'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MUSCLE_GROUPS, UPPER_BODY_GROUPS, LOWER_BODY_GROUPS } from '@/lib/data';
import { fetchExercises, fetchLastPerformance, fetchExerciseHistory, fetchWorkout, createWorkout, updateWorkout, createExercise, deleteWorkout, type Exercise, type HistorySet } from '@/lib/api';
import SaveAnimation from '@/components/SaveAnimation';
import { useI18n } from '@/lib/i18n';

interface SetLog {
  setNumber: number;
  reps: string;
  weight: string;
}

interface ExerciseEntry {
  exercise: { id: number; name: string; muscleGroup: string };
  sets: SetLog[];
  lastPerformance: { setNumber: number; reps: number; weight: number }[];
  note: string;
  notePinned: boolean;
  showNote: boolean;
}

function StrengthWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const date = searchParams.get('date') || '';
  const workoutId = searchParams.get('id');

  const storageKey = `strength-draft-${date}`;

  const [exercises, setExercises] = useState<{ id: number; name: string; muscleGroup: string }[]>([]);
  const [entries, setEntries] = useState<ExerciseEntry[]>(() => {
    if (workoutId) return []; // Will load from API
    if (typeof window === 'undefined' || !date) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });
  const [loadingWorkout, setLoadingWorkout] = useState(!!workoutId);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [filterUpper, setFilterUpper] = useState(true);
  const [filterLower, setFilterLower] = useState(true);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [historyExercise, setHistoryExercise] = useState<{ id: number; name: string } | null>(null);
  const [historyData, setHistoryData] = useState<HistorySet[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load exercises from API
  useEffect(() => {
    fetchExercises().then((data) => {
      setExercises(data.map((e) => ({ id: e.id, name: e.name, muscleGroup: e.muscle_group })));
    }).catch(console.error);
  }, []);

  // Load existing workout from API
  useEffect(() => {
    if (!workoutId || exercises.length === 0) return;
    setLoadingWorkout(true);
    fetchWorkout(parseInt(workoutId)).then((data) => {
      if (data.exercise_logs && Array.isArray(data.exercise_logs)) {
        // Group logs by exercise
        const grouped = new Map<number, { name: string; muscleGroup: string; sets: { setNumber: number; reps: number; weight: string }[] }>();
        for (const log of data.exercise_logs) {
          const exId = (log as Record<string, unknown>).exercise_id as number;
          const exName = (log as Record<string, unknown>).exercise_name as string;
          const exGroup = (log as Record<string, unknown>).muscle_group as string;
          if (!grouped.has(exId)) {
            grouped.set(exId, { name: exName, muscleGroup: exGroup, sets: [] });
          }
          grouped.get(exId)!.sets.push({
            setNumber: (log as Record<string, unknown>).set_number as number,
            reps: (log as Record<string, unknown>).reps as number,
            weight: String((log as Record<string, unknown>).weight),
          });
        }
        const loadedEntries: ExerciseEntry[] = [];
        grouped.forEach((val, exId) => {
          loadedEntries.push({
            exercise: { id: exId, name: val.name, muscleGroup: val.muscleGroup },
            sets: val.sets.map((s) => ({ setNumber: s.setNumber, reps: String(s.reps), weight: s.weight })),
            lastPerformance: [],
            note: '',
            notePinned: false,
            showNote: false,
          });
        });
        setEntries(loadedEntries);
      }
    }).catch(console.error).finally(() => setLoadingWorkout(false));
  }, [workoutId, exercises]);

  // Auto-save draft to localStorage (only for new workouts)
  useEffect(() => {
    if (!date || workoutId) return;
    if (entries.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [entries, storageKey, date, workoutId]);

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

  const addExercise = async (exercise: { id: number; name: string; muscleGroup: string }) => {
    // Fetch last performance for this exercise
    let lastPerf: { setNumber: number; reps: number; weight: number }[] = [];
    try {
      const perf = await fetchLastPerformance(exercise.id);
      lastPerf = perf.map((p) => ({
        setNumber: p.set_number,
        reps: p.reps,
        weight: parseFloat(p.weight),
      }));
    } catch { /* no previous performance */ }

    const initialSets: SetLog[] = lastPerf.length > 0
      ? lastPerf.map((p) => ({ setNumber: p.setNumber, reps: '', weight: '' }))
      : [{ setNumber: 1, reps: '', weight: '' }];

    setEntries([...entries, { exercise, sets: initialSets, lastPerformance: lastPerf, note: '', notePinned: false, showNote: false }]);
    setShowExercisePicker(false);
  };

  const createAndAddExercise = async () => {
    if (!newExerciseName || !newExerciseMuscle) return;
    try {
      const newEx = await createExercise(newExerciseName, newExerciseMuscle);
      const mapped = { id: newEx.id, name: newEx.name, muscleGroup: newEx.muscle_group };
      setExercises([...exercises, mapped]);
      setNewExerciseName(''); setNewExerciseMuscle(''); setShowNewExercise(false);
      addExercise(mapped);
    } catch (err) {
      console.error('Failed to create exercise:', err);
    }
  };

  const updateSet = (entryIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => {
    const updated = [...entries];
    updated[entryIdx] = {
      ...updated[entryIdx],
      sets: updated[entryIdx].sets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s),
    };
    setEntries(updated);
  };

  const addSet = (entryIdx: number) => {
    const updated = [...entries];
    const nextNum = updated[entryIdx].sets.length + 1;
    updated[entryIdx] = {
      ...updated[entryIdx],
      sets: [...updated[entryIdx].sets, { setNumber: nextNum, reps: '', weight: '' }],
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
    setEntries(entries.filter((_, i) => i !== entryIdx));
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

  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const exercise_logs = entries.flatMap((entry) =>
        entry.sets
          .filter((s) => s.reps && s.weight)
          .map((s) => ({
            exercise_id: entry.exercise.id,
            set_number: s.setNumber,
            reps: parseInt(s.reps),
            weight: parseFloat(s.weight),
          }))
      );

      const payload = { date, type: 'musculation' as const, exercise_logs };

      if (workoutId && editing) {
        await updateWorkout(parseInt(workoutId), payload);
        router.push('/');
      } else {
        await createWorkout(payload);
        localStorage.removeItem(storageKey);
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
    <div className="px-5 pb-36 lg:max-w-4xl lg:mx-auto lg:pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 pt-14 pb-5 lg:pt-8">
        <button onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer text-base transition-all duration-150 active:scale-90 shrink-0">
          &#8249;
        </button>
        <span className="font-serif text-[22px] font-normal">{t.strengthWorkout}</span>
      </div>
      <div className="text-[13px] text-text-muted mb-6 pl-12 capitalize">{dateDisplay}</div>

      {/* Exercise cards — 2 columns on desktop */}
      {loadingWorkout ? (
        <div className="text-text-muted text-[13px] text-center py-8">{t.loadingWorkout}</div>
      ) : (
      <div className="lg:grid lg:grid-cols-2 lg:gap-4">
        {entries.map((entry, entryIdx) => (
          <div key={entryIdx} className="bg-bg-card border border-border rounded-card p-4 mb-3 lg:mb-0">
            {/* Exercise header */}
            <div className="flex items-start justify-between mb-3.5">
              <div>
                <div className="text-[15px] font-semibold">{entry.exercise.name}</div>
                <div className="text-[11px] text-strength font-medium mt-0.5">{t.muscleGroups[entry.exercise.muscleGroup] || entry.exercise.muscleGroup}</div>
              </div>
              {(!workoutId || editing) && (
                <button onClick={() => removeExercise(entryIdx)} aria-label="Retirer"
                  className="bg-transparent border-none cursor-pointer p-1 opacity-70 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
                    <path d="M7 7l6 6M13 7l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sets header */}
            <div className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 mb-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.set}</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.previous}</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.reps}</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">{t.weight}</span>
            </div>

            {/* Set rows */}
            {entry.sets.map((set, setIdx) => {
              const lastPerf = entry.lastPerformance.find((p) => p.setNumber === set.setNumber);
              const canDelete = set.setNumber > 1;
              const deleteKey = `${entryIdx}-${setIdx}`;
              const isDeleting = pendingDelete === deleteKey;
              return (
                <div key={setIdx} className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 mb-1.5 items-center">
                  {canDelete && (!workoutId || editing) ? (
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
                  )}
                  <div className="text-center text-[11px] text-text-muted bg-bg rounded-md h-10 leading-10 border border-transparent overflow-hidden text-ellipsis whitespace-nowrap">
                    {lastPerf ? `${lastPerf.reps} × ${lastPerf.weight}kg` : '-'}
                  </div>
                  <input type="number" value={set.reps}
                    onChange={(e) => updateSet(entryIdx, setIdx, 'reps', e.target.value)}
                    disabled={!!workoutId && !editing}
                    placeholder={lastPerf ? String(lastPerf.reps) : '0'}
                    className={`w-full min-w-0 text-center text-sm font-medium text-text bg-bg border border-border rounded-md h-10 leading-10 font-inherit outline-none transition-colors duration-200 focus:border-strength p-0 box-border placeholder:text-text-muted ${workoutId && !editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  <input type="number" step="0.5" value={set.weight}
                    onChange={(e) => updateSet(entryIdx, setIdx, 'weight', e.target.value)}
                    disabled={!!workoutId && !editing}
                    placeholder={lastPerf ? String(lastPerf.weight) : '0'}
                    className={`w-full min-w-0 text-center text-sm font-medium text-text bg-bg border border-border rounded-md h-10 leading-10 font-inherit outline-none transition-colors duration-200 focus:border-strength p-0 box-border placeholder:text-text-muted ${workoutId && !editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
                </div>
              );
            })}

            {/* Note section */}
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#a78bfa" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 17v5M9 11V4a1 1 0 011-1h4a1 1 0 011 1v7" /><path d="M5 11h14l-1.5 6h-11z" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#55545e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 17v5M9 11V4a1 1 0 011-1h4a1 1 0 011 1v7" /><path d="M5 11h14l-1.5 6h-11z" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <button onClick={() => toggleShowNote(entryIdx)}
                  className="w-full py-2 mt-2 bg-transparent border-none text-text-muted text-xs font-medium font-inherit cursor-pointer opacity-70 transition-opacity duration-150 active:opacity-100 flex items-center justify-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  {t.note}
                </button>
              )
            )}

            {(!workoutId || editing) && (
              <button onClick={() => addSet(entryIdx)}
                className="w-full py-2.5 mt-1 bg-transparent border border-dashed border-border rounded-lg text-text-muted text-[13px] font-inherit cursor-pointer transition-all duration-150 active:bg-bg-elevated">
                {t.addSet}
              </button>
            )}

            <button onClick={async () => {
              setHistoryExercise({ id: entry.exercise.id, name: entry.exercise.name });
              try {
                const data = await fetchExerciseHistory(entry.exercise.id);
                setHistoryData(data);
              } catch { setHistoryData([]); }
            }}
              className="w-full py-2 mt-1 bg-transparent border-none text-accent text-xs font-medium font-inherit cursor-pointer opacity-70 transition-opacity duration-150 active:opacity-100">
              {t.viewHistory}
            </button>
          </div>
        ))}
      </div>
      )}

      {/* Add exercise */}
      {(!workoutId || editing) && (
        <button onClick={() => setShowExercisePicker(true)}
          className="w-full py-[18px] bg-transparent border-2 border-dashed border-border rounded-card text-text-muted text-sm font-medium font-inherit cursor-pointer mb-4 transition-all duration-200 active:border-strength active:text-strength mt-4">
          {t.addExercise}
        </button>
      )}

      {/* Save */}
      {entries.length > 0 && (!workoutId || editing) && (
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-strength text-white shadow-[0_4px_20px_rgba(255,138,59,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide">
          {saving ? t.saving : t.saveWorkout}
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
                {t.deleteConfirmStrength}
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

      {/* History modal */}
      {historyExercise && (() => {
        // Group history sets by date
        const grouped = new Map<string, { reps: number; weight: string; set_number: number }[]>();
        for (const row of historyData) {
          const d = row.date.includes('T')
            ? `${new Date(row.date).getFullYear()}-${String(new Date(row.date).getMonth() + 1).padStart(2, '0')}-${String(new Date(row.date).getDate()).padStart(2, '0')}`
            : row.date;
          if (!grouped.has(d)) grouped.set(d, []);
          grouped.get(d)!.push({ reps: row.reps, weight: row.weight, set_number: row.set_number });
        }
        const dateLocaleStr = locale === 'fr' ? 'fr-FR' : 'en-US';
        return (
          <>
            <div onClick={() => setHistoryExercise(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
            <div className="fixed bottom-0 left-0 right-0 max-w-[430px] lg:max-w-lg mx-auto bg-bg-card rounded-t-3xl px-6 pt-7 pb-10 z-[51] animate-sheetUp max-h-[70vh] overflow-y-auto">
              <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-normal m-0">{historyExercise.name}</h3>
                <button onClick={() => setHistoryExercise(null)}
                  className="bg-transparent border-none text-text-muted text-lg cursor-pointer py-1 px-2">✕</button>
              </div>
              {grouped.size === 0 ? (
                <div className="text-text-muted text-sm text-center py-6">{t.noHistory}</div>
              ) : (
                Array.from(grouped.entries()).map(([dateStr, sets]) => {
                  const d = new Date(dateStr + 'T00:00:00');
                  const label = d.toLocaleDateString(dateLocaleStr, { weekday: 'short', day: 'numeric', month: 'short' });
                  return (
                    <div key={dateStr} className="bg-bg border border-border rounded-sm p-3 mb-2.5">
                      <div className="text-[13px] font-semibold text-text mb-2 capitalize">{label}</div>
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
                    </div>
                  );
                })
              )}
            </div>
          </>
        );
      })()}

      {/* Exercise picker modal */}
      {showExercisePicker && (() => {
        const query = exerciseSearch.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const allowedGroups = [
          ...(filterUpper ? UPPER_BODY_GROUPS : []),
          ...(filterLower ? LOWER_BODY_GROUPS : []),
        ];
        const filtered = exercises.filter((e) => {
          if (!allowedGroups.includes(e.muscleGroup)) return false;
          if (!query) return true;
          return (
            e.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
            e.muscleGroup.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query)
          );
        });
        return (
          <>
            <div onClick={() => { setShowExercisePicker(false); setExerciseSearch(''); }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
            <div className="fixed inset-0 max-w-[430px] lg:max-w-lg mx-auto bg-bg-card z-[51] animate-sheetUp flex flex-col lg:inset-x-0 lg:bottom-0 lg:top-auto lg:rounded-t-3xl lg:max-h-[85dvh]">
              {/* Sticky header + search + filters */}
              <div className="shrink-0 px-6 pt-[max(1.75rem,env(safe-area-inset-top))] pb-3 lg:pt-7">
                <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5 hidden lg:block" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-[22px] font-normal m-0">{t.chooseExercise}</h3>
                  <button onClick={() => { setShowExercisePicker(false); setExerciseSearch(''); }}
                    className="bg-transparent border-none text-text-muted text-lg cursor-pointer py-1 px-2">✕</button>
                </div>
                <div className="relative">
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
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      if (filterUpper && !filterLower) { setFilterUpper(true); setFilterLower(true); }
                      else { setFilterUpper(true); setFilterLower(false); }
                    }}
                    className={`flex-1 py-2 rounded-lg border text-[13px] font-medium cursor-pointer transition-all duration-150 active:scale-[0.97] ${
                      filterUpper
                        ? 'bg-bg-elevated border-accent text-accent'
                        : 'bg-transparent border-border text-text-muted'
                    }`}
                  >
                    Upper
                  </button>
                  <button
                    onClick={() => {
                      if (filterLower && !filterUpper) { setFilterUpper(true); setFilterLower(true); }
                      else { setFilterLower(true); setFilterUpper(false); }
                    }}
                    className={`flex-1 py-2 rounded-lg border text-[13px] font-medium cursor-pointer transition-all duration-150 active:scale-[0.97] ${
                      filterLower
                        ? 'bg-bg-elevated border-accent text-accent'
                        : 'bg-transparent border-border text-text-muted'
                    }`}
                  >
                    Lower
                  </button>
                </div>
              </div>

              {/* Scrollable exercise list */}
              <div className="flex-1 overflow-y-auto px-6 pb-10 overscroll-contain">
                {!filterUpper && !filterLower ? (
                  <div className="text-text-muted text-sm text-center py-8">{t.enableFilter}</div>
                ) : filtered.length === 0 ? (
                  <div className="text-text-muted text-sm text-center py-8">{t.noExerciseFound}</div>
                ) : (
                  MUSCLE_GROUPS.map((group) => {
                    const groupExercises = filtered.filter((e) => e.muscleGroup === group);
                    if (groupExercises.length === 0) return null;
                    return (
                      <div key={group}>
                        <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wide pt-3 pb-1.5 border-b border-border mb-1">
                          {t.muscleGroups[group] || group}
                        </div>
                        {groupExercises.map((ex) => (
                          <button key={ex.id} onClick={() => { addExercise(ex); setExerciseSearch(''); }}
                            className="block w-full text-left py-3 px-2 bg-transparent border-none border-b border-border/50 text-text text-sm font-inherit cursor-pointer transition-all duration-100 active:bg-bg-elevated">
                            {ex.name}
                          </button>
                        ))}
                      </div>
                    );
                  })
                )}
                <div className="py-5">
                  <button onClick={() => { setShowExercisePicker(false); setExerciseSearch(''); setShowNewExercise(true); }}
                    className="w-full py-[18px] bg-transparent border-2 border-dashed border-accent text-accent rounded-card text-sm font-medium font-inherit cursor-pointer transition-all duration-200">
                    {t.createExercise}
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* Save animation */}
      {showSaveAnimation && <SaveAnimation onComplete={() => router.push('/?saved=1')} />}

      {/* New exercise modal */}
      {showNewExercise && (
        <>
          <div onClick={() => setShowNewExercise(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed bottom-0 left-0 right-0 max-w-[430px] lg:max-w-lg mx-auto bg-bg-card rounded-t-3xl px-6 pt-7 pb-10 z-[51] animate-sheetUp">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
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
            <button onClick={createAndAddExercise}
              className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-strength text-white shadow-[0_4px_20px_rgba(255,138,59,0.3)]">
              {t.createAndAdd}
            </button>
            <button onClick={() => setShowNewExercise(false)}
              className="block w-full mt-4 py-3 bg-transparent border-none text-text-muted text-sm cursor-pointer font-inherit">
              {t.cancel}
            </button>
          </div>
        </>
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
