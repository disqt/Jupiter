'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EXERCISES, MUSCLE_GROUPS, DUMMY_WORKOUTS, getExerciseHistory, type Exercise } from '@/lib/data';
import SaveAnimation from '@/components/SaveAnimation';

interface SetLog {
  setNumber: number;
  reps: string;
  weight: string;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: SetLog[];
  lastPerformance: { setNumber: number; reps: number; weight: number }[];
  note: string;
  notePinned: boolean;
  showNote: boolean;
}

function StrengthWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';

  const existingWorkout = DUMMY_WORKOUTS.find(
    (w) => w.date === date && w.type === 'musculation' && w.exercises && w.exercises.length > 0
  );

  const initialEntries: ExerciseEntry[] = existingWorkout?.exercises
    ? existingWorkout.exercises.map((ex) => {
        const matchedExercise = EXERCISES.find((e) => e.name === ex.name) || {
          id: 0, name: ex.name, muscleGroup: ex.muscleGroup,
        };
        return {
          exercise: matchedExercise,
          sets: ex.sets.map((s) => ({
            setNumber: s.setNumber,
            reps: s.reps > 0 ? String(s.reps) : '',
            weight: s.weight > 0 ? String(s.weight) : '',
          })),
          lastPerformance: ex.lastPerformance || [],
          note: '',
          notePinned: false,
          showNote: false,
        };
      })
    : [];

  const storageKey = `strength-draft-${date}`;

  const [exercises] = useState<Exercise[]>(EXERCISES);
  const [entries, setEntries] = useState<ExerciseEntry[]>(() => {
    if (typeof window === 'undefined' || !date) return initialEntries;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return initialEntries;
  });
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [historyExercise, setHistoryExercise] = useState<string | null>(null);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!date) return;
    if (entries.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [entries, storageKey, date]);

  const clearPendingDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  useEffect(() => {
    if (pendingDelete === null) return;
    document.addEventListener('click', clearPendingDelete);
    return () => document.removeEventListener('click', clearPendingDelete);
  }, [pendingDelete, clearPendingDelete]);

  const addExercise = (exercise: Exercise) => {
    setEntries([...entries, { exercise, sets: [{ setNumber: 1, reps: '', weight: '' }], lastPerformance: [], note: '', notePinned: false, showNote: false }]);
    setShowExercisePicker(false);
  };

  const createAndAddExercise = () => {
    if (!newExerciseName || !newExerciseMuscle) return;
    const newEx: Exercise = { id: Date.now(), name: newExerciseName, muscleGroup: newExerciseMuscle };
    setNewExerciseName(''); setNewExerciseMuscle(''); setShowNewExercise(false);
    addExercise(newEx);
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

  const handleSave = () => {
    localStorage.removeItem(storageKey);
    setSaving(true);
    setShowSaveAnimation(true);
  };

  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
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
        <span className="font-serif text-[22px] font-normal">Séance musculation</span>
      </div>
      <div className="text-[13px] text-text-muted mb-6 pl-12 capitalize">{dateDisplay}</div>

      {/* Exercise cards — 2 columns on desktop */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-4">
        {entries.map((entry, entryIdx) => (
          <div key={entryIdx} className="bg-bg-card border border-border rounded-card p-4 mb-3 lg:mb-0">
            {/* Exercise header */}
            <div className="flex items-start justify-between mb-3.5">
              <div>
                <div className="text-[15px] font-semibold">{entry.exercise.name}</div>
                <div className="text-[11px] text-strength font-medium mt-0.5">{entry.exercise.muscleGroup}</div>
              </div>
              <button onClick={() => removeExercise(entryIdx)} aria-label="Retirer"
                className="bg-transparent border-none cursor-pointer p-1 opacity-70 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
                  <path d="M7 7l6 6M13 7l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* History link */}
            <button onClick={() => setHistoryExercise(entry.exercise.name)}
              className="w-full py-1.5 mb-3 bg-transparent border-none text-accent text-xs font-medium font-inherit cursor-pointer opacity-70 transition-opacity duration-150 active:opacity-100 text-left flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Voir l&apos;historique
            </button>

            {/* Sets header */}
            <div className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 mb-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Série</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Précéd.</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Reps</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Poids</span>
            </div>

            {/* Set rows */}
            {entry.sets.map((set, setIdx) => {
              const lastPerf = entry.lastPerformance.find((p) => p.setNumber === set.setNumber);
              const canDelete = set.setNumber > 1;
              const deleteKey = `${entryIdx}-${setIdx}`;
              const isDeleting = pendingDelete === deleteKey;
              return (
                <div key={setIdx} className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 mb-1.5 items-center">
                  {canDelete ? (
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
                    placeholder={lastPerf ? String(lastPerf.reps) : '0'}
                    className="w-full min-w-0 text-center text-sm font-medium text-text bg-bg border border-border rounded-md h-10 leading-10 font-inherit outline-none transition-colors duration-200 focus:border-strength p-0 box-border placeholder:text-text-muted" />
                  <input type="number" step="0.5" value={set.weight}
                    onChange={(e) => updateSet(entryIdx, setIdx, 'weight', e.target.value)}
                    placeholder={lastPerf ? String(lastPerf.weight) : '0'}
                    className="w-full min-w-0 text-center text-sm font-medium text-text bg-bg border border-border rounded-md h-10 leading-10 font-inherit outline-none transition-colors duration-200 focus:border-strength p-0 box-border placeholder:text-text-muted" />
                </div>
              );
            })}

            {/* Note section */}
            {entry.showNote ? (
              <div className="relative mt-2 mb-1">
                <input
                  type="text"
                  value={entry.note}
                  onChange={(e) => updateNote(entryIdx, e.target.value)}
                  placeholder="Ajouter une note..."
                  className="w-full py-2.5 pl-3 pr-10 bg-bg border border-border rounded-lg text-text text-[13px] font-inherit outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted box-border"
                />
                <button
                  onClick={() => togglePin(entryIdx)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center"
                  aria-label={entry.notePinned ? 'Désépingler' : 'Épingler'}
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
                Note
              </button>
            )}

            <button onClick={() => addSet(entryIdx)}
              className="w-full py-2.5 mt-1 bg-transparent border border-dashed border-border rounded-lg text-text-muted text-[13px] font-inherit cursor-pointer transition-all duration-150 active:bg-bg-elevated">
              + Ajouter une série
            </button>
          </div>
        ))}
      </div>

      {/* Add exercise */}
      <button onClick={() => setShowExercisePicker(true)}
        className="w-full py-[18px] bg-transparent border-2 border-dashed border-border rounded-card text-text-muted text-sm font-medium font-inherit cursor-pointer mb-4 transition-all duration-200 active:border-strength active:text-strength mt-4">
        + Ajouter un exercice
      </button>

      {/* Save */}
      {entries.length > 0 && (
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-strength text-white shadow-[0_4px_20px_rgba(255,138,59,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide">
          {saving ? 'Sauvegarde...' : 'Sauvegarder la séance'}
        </button>
      )}

      {/* History modal */}
      {historyExercise && (() => {
        const history = getExerciseHistory(historyExercise, date);
        return (
          <>
            <div onClick={() => setHistoryExercise(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
            <div className="fixed bottom-0 left-0 right-0 max-w-[430px] lg:max-w-lg mx-auto bg-bg-card rounded-t-3xl px-6 pt-7 pb-10 z-[51] animate-sheetUp max-h-[70vh] overflow-y-auto">
              <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-normal m-0">{historyExercise}</h3>
                <button onClick={() => setHistoryExercise(null)}
                  className="bg-transparent border-none text-text-muted text-lg cursor-pointer py-1 px-2">✕</button>
              </div>
              {history.length === 0 ? (
                <div className="text-text-muted text-sm text-center py-6">Aucun historique disponible</div>
              ) : (
                history.map((entry, i) => {
                  const d = new Date(entry.date + 'T00:00:00');
                  const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                  return (
                    <div key={i} className="bg-bg border border-border rounded-sm p-3 mb-2.5">
                      <div className="text-[13px] font-semibold text-text mb-2 capitalize">{label}</div>
                      <div className="grid grid-cols-3 gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Série</span>
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Reps</span>
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide text-center">Poids</span>
                      </div>
                      {entry.sets.map((s, j) => (
                        <div key={j} className="grid grid-cols-3 gap-1.5 py-1">
                          <span className="text-center text-[13px] font-semibold text-text-muted">{s.setNumber}</span>
                          <span className="text-center text-[13px] text-text-secondary">{s.reps}</span>
                          <span className="text-center text-[13px] text-text-secondary">{s.weight > 0 ? `${s.weight} kg` : '-'}</span>
                        </div>
                      ))}
                      {entry.note && (
                        <div className="flex items-start gap-1.5 mt-2 py-1.5 px-2 bg-accent/10 rounded-md">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-[11px] text-accent leading-tight">{entry.note}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        );
      })()}

      {/* Exercise picker modal */}
      {showExercisePicker && (
        <>
          <div onClick={() => setShowExercisePicker(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed bottom-0 left-0 right-0 max-w-[430px] lg:max-w-lg mx-auto bg-bg-card rounded-t-3xl px-6 pt-7 pb-10 z-[51] animate-sheetUp max-h-[70vh] overflow-y-auto">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-[22px] font-normal m-0">Choisir un exercice</h3>
              <button onClick={() => setShowExercisePicker(false)}
                className="bg-transparent border-none text-text-muted text-lg cursor-pointer py-1 px-2">✕</button>
            </div>
            {MUSCLE_GROUPS.map((group) => {
              const groupExercises = exercises.filter((e) => e.muscleGroup === group);
              if (groupExercises.length === 0) return null;
              return (
                <div key={group}>
                  <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wide pt-3 pb-1.5 border-b border-border mb-1">
                    {group}
                  </div>
                  {groupExercises.map((ex) => (
                    <button key={ex.id} onClick={() => addExercise(ex)}
                      className="block w-full text-left py-3 px-2 bg-transparent border-none border-b border-border/50 text-text text-sm font-inherit cursor-pointer transition-all duration-100 active:bg-bg-elevated">
                      {ex.name}
                    </button>
                  ))}
                </div>
              );
            })}
            <div className="py-5">
              <button onClick={() => { setShowExercisePicker(false); setShowNewExercise(true); }}
                className="w-full py-[18px] bg-transparent border-2 border-dashed border-accent text-accent rounded-card text-sm font-medium font-inherit cursor-pointer transition-all duration-200">
                + Créer un nouvel exercice
              </button>
            </div>
          </div>
        </>
      )}

      {/* Save animation */}
      {showSaveAnimation && <SaveAnimation onComplete={() => router.push('/?saved=1')} />}

      {/* New exercise modal */}
      {showNewExercise && (
        <>
          <div onClick={() => setShowNewExercise(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed bottom-0 left-0 right-0 max-w-[430px] lg:max-w-lg mx-auto bg-bg-card rounded-t-3xl px-6 pt-7 pb-10 z-[51] animate-sheetUp">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
            <h3 className="font-serif text-[22px] font-normal mb-5">Nouvel exercice</h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Nom de l&apos;exercice
              </label>
              <input type="text" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="Ex: Développé couché"
                className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Groupe musculaire
              </label>
              <select value={newExerciseMuscle} onChange={(e) => setNewExerciseMuscle(e.target.value)}
                className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent appearance-none">
                <option value="">Choisir...</option>
                {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button onClick={createAndAddExercise}
              className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-strength text-white shadow-[0_4px_20px_rgba(255,138,59,0.3)]">
              Créer et ajouter
            </button>
            <button onClick={() => setShowNewExercise(false)}
              className="block w-full mt-4 py-3 bg-transparent border-none text-text-muted text-sm cursor-pointer font-inherit">
              Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function StrengthWorkout() {
  return (
    <Suspense fallback={<div className="p-5 text-text-muted">Chargement...</div>}>
      <StrengthWorkoutForm />
    </Suspense>
  );
}
