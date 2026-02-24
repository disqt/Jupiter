'use client';

import { Suspense, useState } from 'react';
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
            <button className="exercise-remove" onClick={() => removeExercise(entryIdx)}>
              Retirer
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
            return (
              <div key={setIdx} className="set-row">
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
              </div>
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
