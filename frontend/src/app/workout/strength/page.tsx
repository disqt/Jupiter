'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
}

interface SetLog {
  set_number: number;
  reps: string;
  weight: string;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: SetLog[];
  lastPerformance: { set_number: number; reps: number; weight: string; date: string }[];
}

function StrengthWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getExercises().then(setExercises).catch(console.error);
  }, []);

  const addExercise = async (exercise: Exercise) => {
    const lastPerf = await api.getLastPerformance(exercise.id);
    const initialSets: SetLog[] = lastPerf.length > 0
      ? lastPerf.map((p: { set_number: number; reps: number; weight: string }) => ({ set_number: p.set_number, reps: '', weight: '' }))
      : [{ set_number: 1, reps: '', weight: '' }];

    setEntries([...entries, { exercise, sets: initialSets, lastPerformance: lastPerf }]);
    setShowExercisePicker(false);
  };

  const createAndAddExercise = async () => {
    if (!newExerciseName || !newExerciseMuscle) return;
    const created = await api.createExercise({ name: newExerciseName, muscle_group: newExerciseMuscle });
    setExercises([...exercises, created]);
    setNewExerciseName('');
    setNewExerciseMuscle('');
    setShowNewExercise(false);
    await addExercise(created);
  };

  const updateSet = (entryIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => {
    const updated = [...entries];
    updated[entryIdx].sets[setIdx][field] = value;
    setEntries(updated);
  };

  const addSet = (entryIdx: number) => {
    const updated = [...entries];
    const nextNum = updated[entryIdx].sets.length + 1;
    updated[entryIdx].sets.push({ set_number: nextNum, reps: '', weight: '' });
    setEntries(updated);
  };

  const removeExercise = (entryIdx: number) => {
    setEntries(entries.filter((_, i) => i !== entryIdx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const exercise_logs = entries.flatMap((entry) =>
        entry.sets
          .filter((s) => s.reps && s.weight)
          .map((s) => ({
            exercise_id: entry.exercise.id,
            set_number: s.set_number,
            reps: parseInt(s.reps),
            weight: parseFloat(s.weight),
          }))
      );
      await api.createWorkout({ date, type: 'musculation', exercise_logs });
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const MUSCLE_GROUPS = ['Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 'Abdominaux', 'Fessiers', 'Autre'];

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="text-gray-500">&larr;</button>
        <h1 className="text-lg font-semibold">Séance musculation</h1>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        {date && new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
      </p>

      {/* Exercise entries */}
      {entries.map((entry, entryIdx) => (
        <div key={entryIdx} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium">{entry.exercise.name}</h3>
              <span className="text-xs text-gray-400">{entry.exercise.muscle_group}</span>
            </div>
            <button onClick={() => removeExercise(entryIdx)} className="text-red-400 text-sm">
              Retirer
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-1 px-1">
            <span>Série</span>
            <span>Précédent</span>
            <span>Reps</span>
            <span>Poids (kg)</span>
          </div>

          {/* Sets */}
          {entry.sets.map((set, setIdx) => {
            const lastPerf = entry.lastPerformance.find((p) => p.set_number === set.set_number);
            return (
              <div key={setIdx} className="grid grid-cols-4 gap-2 items-center mb-2">
                <span className="text-sm text-center font-medium text-gray-500">{set.set_number}</span>
                <span className="text-xs text-gray-300 text-center">
                  {lastPerf ? `${lastPerf.reps}x${lastPerf.weight}kg` : '-'}
                </span>
                <input
                  type="number"
                  value={set.reps}
                  onChange={(e) => updateSet(entryIdx, setIdx, 'reps', e.target.value)}
                  placeholder={lastPerf ? String(lastPerf.reps) : '0'}
                  className="border border-gray-200 rounded p-2 text-sm text-center"
                />
                <input
                  type="number"
                  step="0.5"
                  value={set.weight}
                  onChange={(e) => updateSet(entryIdx, setIdx, 'weight', e.target.value)}
                  placeholder={lastPerf ? String(lastPerf.weight) : '0'}
                  className="border border-gray-200 rounded p-2 text-sm text-center"
                />
              </div>
            );
          })}

          <button
            onClick={() => addSet(entryIdx)}
            className="w-full text-sm text-blue-600 py-2 mt-1"
          >
            + Ajouter une série
          </button>
        </div>
      ))}

      {/* Add exercise button */}
      <button
        onClick={() => setShowExercisePicker(true)}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-400 font-medium mb-4"
      >
        + Ajouter un exercice
      </button>

      {/* Save button */}
      {entries.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-500 text-white font-medium py-3 rounded-lg disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder la séance'}
        </button>
      )}

      {/* Exercise picker modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Choisir un exercice</h3>
              <button onClick={() => setShowExercisePicker(false)} className="text-gray-400">X</button>
            </div>

            {/* Grouped by muscle */}
            {MUSCLE_GROUPS.map((group) => {
              const groupExercises = exercises.filter((e) => e.muscle_group === group);
              if (groupExercises.length === 0) return null;
              return (
                <div key={group} className="mb-3">
                  <h4 className="text-xs text-gray-400 font-medium mb-1">{group}</h4>
                  {groupExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => addExercise(ex)}
                      className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm"
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              );
            })}

            <button
              onClick={() => { setShowExercisePicker(false); setShowNewExercise(true); }}
              className="w-full mt-2 py-3 text-blue-600 font-medium text-sm border-t"
            >
              + Créer un nouvel exercice
            </button>
          </div>
        </div>
      )}

      {/* New exercise modal */}
      {showNewExercise && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8">
            <h3 className="text-lg font-semibold mb-4">Nouvel exercice</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="Nom de l'exercice"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
              <select
                value={newExerciseMuscle}
                onChange={(e) => setNewExerciseMuscle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Groupe musculaire</option>
                {MUSCLE_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <button
              onClick={createAndAddExercise}
              className="w-full mt-4 bg-blue-600 text-white font-medium py-3 rounded-lg"
            >
              Créer et ajouter
            </button>
            <button
              onClick={() => setShowNewExercise(false)}
              className="w-full mt-2 py-2 text-gray-400 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StrengthWorkout() {
  return (
    <Suspense fallback={<div className="p-4">Chargement...</div>}>
      <StrengthWorkoutForm />
    </Suspense>
  );
}
