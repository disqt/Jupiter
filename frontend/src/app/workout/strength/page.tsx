'use client';

import { Suspense, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EXERCISES, MUSCLE_GROUPS, DUMMY_WORKOUTS, type Exercise } from '@/lib/data';

interface SetLog {
  setNumber: number;
  reps: string;
  weight: string;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: SetLog[];
  lastPerformance: { setNumber: number; reps: number; weight: number }[];
}

function SwipeableSetRow({
  children,
  canSwipe,
  onDelete,
}: {
  children: React.ReactNode;
  canSwipe: boolean;
  onDelete: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const isOpen = useRef(false);
  const THRESHOLD = 60;

  const setTransform = useCallback((x: number) => {
    if (rowRef.current) {
      rowRef.current.style.transform = `translateX(${x}px)`;
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!canSwipe) return;
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    if (rowRef.current) rowRef.current.style.transition = 'none';
  }, [canSwipe]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.touches[0].clientX - startX.current;
    const base = isOpen.current ? -THRESHOLD : 0;
    const x = Math.min(0, Math.max(-THRESHOLD - 20, base + diff));
    currentX.current = x;
    setTransform(x);
  }, [setTransform]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (rowRef.current) rowRef.current.style.transition = 'transform 0.25s ease';
    if (currentX.current < -THRESHOLD / 2) {
      setTransform(-THRESHOLD);
      isOpen.current = true;
    } else {
      setTransform(0);
      isOpen.current = false;
    }
  }, [setTransform]);

  if (!canSwipe) {
    return <div className="set-row">{children}</div>;
  }

  return (
    <div className="swipe-container">
      <div className="swipe-delete-bg" onClick={onDelete}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4.5 4.5h9M7.5 4.5V3a1.5 1.5 0 011.5-1.5h0A1.5 1.5 0 0110.5 3v1.5M6 7.5v6M9 7.5v6M12 7.5v6M5.25 4.5l.5 10a1.5 1.5 0 001.5 1.5h3.5a1.5 1.5 0 001.5-1.5l.5-10"
            stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div
        ref={rowRef}
        className="set-row swipe-row"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

function StrengthWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';

  // Pre-populate from dummy data if workout exists for this date
  const existingWorkout = DUMMY_WORKOUTS.find(
    (w) => w.date === date && w.type === 'musculation' && w.exercises && w.exercises.length > 0
  );

  const initialEntries: ExerciseEntry[] = existingWorkout?.exercises
    ? existingWorkout.exercises.map((ex) => {
        const matchedExercise = EXERCISES.find((e) => e.name === ex.name) || {
          id: 0,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
        };
        return {
          exercise: matchedExercise,
          sets: ex.sets.map((s) => ({
            setNumber: s.setNumber,
            reps: s.reps > 0 ? String(s.reps) : '',
            weight: s.weight > 0 ? String(s.weight) : '',
          })),
          lastPerformance: ex.lastPerformance || [],
        };
      })
    : [];

  const [exercises] = useState<Exercise[]>(EXERCISES);
  const [entries, setEntries] = useState<ExerciseEntry[]>(initialEntries);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState('');
  const [saving, setSaving] = useState(false);

  const addExercise = (exercise: Exercise) => {
    const initialSets: SetLog[] = [{ setNumber: 1, reps: '', weight: '' }];
    setEntries([...entries, { exercise, sets: initialSets, lastPerformance: [] }]);
    setShowExercisePicker(false);
  };

  const createAndAddExercise = () => {
    if (!newExerciseName || !newExerciseMuscle) return;
    const newEx: Exercise = {
      id: Date.now(),
      name: newExerciseName,
      muscleGroup: newExerciseMuscle,
    };
    setNewExerciseName('');
    setNewExerciseMuscle('');
    setShowNewExercise(false);
    addExercise(newEx);
  };

  const updateSet = (entryIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => {
    const updated = [...entries];
    updated[entryIdx] = {
      ...updated[entryIdx],
      sets: updated[entryIdx].sets.map((s, i) =>
        i === setIdx ? { ...s, [field]: value } : s
      ),
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

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      router.push('/');
    }, 300);
  };

  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div style={{ padding: '0 20px 140px' }}>
      <div className="screen-header">
        <button className="back-btn" onClick={() => router.push('/')}>
          &#8249;
        </button>
        <span style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: '22px', fontWeight: 400 }}>
          Séance musculation
        </span>
      </div>

      <div className="screen-date" style={{ textTransform: 'capitalize' }}>
        {dateDisplay}
      </div>

      {/* Exercise entries */}
      {entries.map((entry, entryIdx) => (
        <div key={entryIdx} className="exercise-card">
          <div className="exercise-header">
            <div>
              <div className="exercise-name">{entry.exercise.name}</div>
              <div className="exercise-muscle">{entry.exercise.muscleGroup}</div>
            </div>
            <button className="exercise-remove" onClick={() => removeExercise(entryIdx)} aria-label="Retirer">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="var(--danger)" strokeWidth="1.5" opacity="0.5" />
                <path d="M7 7l6 6M13 7l-6 6" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Table header */}
          <div className="sets-header">
            <span>Série</span>
            <span>Précéd.</span>
            <span>Reps</span>
            <span>Poids</span>
          </div>

          {/* Sets */}
          {entry.sets.map((set, setIdx) => {
            const lastPerf = entry.lastPerformance.find((p) => p.setNumber === set.setNumber);
            const canDelete = set.setNumber > 1;
            return (
              <SwipeableSetRow
                key={setIdx}
                canSwipe={canDelete}
                onDelete={() => removeSet(entryIdx, setIdx)}
              >
                <div className="set-num">{set.setNumber}</div>
                <div className="set-prev">
                  {lastPerf ? `${lastPerf.reps} × ${lastPerf.weight}kg` : '-'}
                </div>
                <input
                  className="set-input"
                  type="number"
                  value={set.reps}
                  onChange={(e) => updateSet(entryIdx, setIdx, 'reps', e.target.value)}
                  placeholder={lastPerf ? String(lastPerf.reps) : '0'}
                />
                <input
                  className="set-input"
                  type="number"
                  step="0.5"
                  value={set.weight}
                  onChange={(e) => updateSet(entryIdx, setIdx, 'weight', e.target.value)}
                  placeholder={lastPerf ? String(lastPerf.weight) : '0'}
                />
              </SwipeableSetRow>
            );
          })}

          <button className="add-set-btn" onClick={() => addSet(entryIdx)}>
            + Ajouter une série
          </button>
        </div>
      ))}

      {/* Add exercise button */}
      <button className="add-exercise-btn" onClick={() => setShowExercisePicker(true)}>
        + Ajouter un exercice
      </button>

      {/* Save button */}
      {entries.length > 0 && (
        <button
          className="save-btn strength-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder la séance'}
        </button>
      )}

      {/* Exercise picker modal */}
      {showExercisePicker && (
        <>
          <div className="sheet-overlay" onClick={() => setShowExercisePicker(false)} />
          <div className="sheet" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: '22px', fontWeight: 400, margin: 0 }}>
                Choisir un exercice
              </h3>
              <button
                onClick={() => setShowExercisePicker(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            {/* Grouped by muscle */}
            {MUSCLE_GROUPS.map((group) => {
              const groupExercises = exercises.filter((e) => e.muscleGroup === group);
              if (groupExercises.length === 0) return null;
              return (
                <div key={group}>
                  <div className="picker-group-label">{group}</div>
                  {groupExercises.map((ex) => (
                    <button
                      key={ex.id}
                      className="picker-item"
                      onClick={() => addExercise(ex)}
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              );
            })}

            <div style={{ padding: '20px 0' }}>
              <button
                className="add-exercise-btn"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                onClick={() => {
                  setShowExercisePicker(false);
                  setShowNewExercise(true);
                }}
              >
                + Créer un nouvel exercice
              </button>
            </div>
          </div>
        </>
      )}

      {/* New exercise modal */}
      {showNewExercise && (
        <>
          <div className="sheet-overlay" onClick={() => setShowNewExercise(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <h3 style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: '22px', fontWeight: 400, marginBottom: '20px' }}>
              Nouvel exercice
            </h3>
            <div className="field">
              <label>Nom de l&apos;exercice</label>
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="Ex: Développé couché"
              />
            </div>
            <div className="field">
              <label>Groupe musculaire</label>
              <select
                value={newExerciseMuscle}
                onChange={(e) => setNewExerciseMuscle(e.target.value)}
              >
                <option value="">Choisir...</option>
                {MUSCLE_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <button className="save-btn strength-save" onClick={createAndAddExercise}>
              Créer et ajouter
            </button>
            <button className="sheet-cancel" onClick={() => setShowNewExercise(false)}>
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
    <Suspense fallback={<div style={{ padding: '20px', color: 'var(--text-muted)' }}>Chargement...</div>}>
      <StrengthWorkoutForm />
    </Suspense>
  );
}
