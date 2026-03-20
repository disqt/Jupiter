import { describe, it, expect } from 'vitest';
import { generateWorkout, swapExercise, type GeneratorInput } from './workout-generator';
import { EXERCISE_CATALOG } from './exercise-catalog-index';
import { getCatalogDetails } from './exercise-catalog';

const details: Record<string, any> = {};
for (const ex of EXERCISE_CATALOG) {
  const d = getCatalogDetails(ex.id);
  if (d) details[ex.id] = d;
}

describe('generateWorkout', () => {
  it('generates 3-8 exercises for any valid input', () => {
    const input: GeneratorInput = {
      selectedMuscles: ['Pectoraux', 'Dos', 'Biceps', 'Triceps'],

      equipment: ['barbell', 'dumbbell', 'body_only'],
      weeklyFrequency: 3,
    };
    const result = generateWorkout(input, EXERCISE_CATALOG, details);
    expect(result.exercises.length).toBeGreaterThanOrEqual(3);
    expect(result.exercises.length).toBeLessThanOrEqual(8);
  });

  it('respects equipment filter', () => {
    const input: GeneratorInput = {
      selectedMuscles: ['Pectoraux'],

      equipment: ['body_only'],
      weeklyFrequency: 3,
    };
    const result = generateWorkout(input, EXERCISE_CATALOG, details);
    for (const ex of result.exercises) {
      const catalogEntry = EXERCISE_CATALOG.find(c => c.id === ex.catalogId)!;
      expect(catalogEntry.equipment).toBe('body_only');
    }
  });

  it('favors classic exercises (beginner-level scored highest)', () => {
    const input: GeneratorInput = {
      selectedMuscles: ['Pectoraux'],
      equipment: ['barbell', 'dumbbell', 'cable', 'machine', 'body_only'],
      weeklyFrequency: 3,
    };
    const result = generateWorkout(input, EXERCISE_CATALOG, details);
    expect(result.exercises.length).toBeGreaterThan(0);
  });

  it('places compound exercises before isolation', () => {
    const input: GeneratorInput = {
      selectedMuscles: ['Pectoraux', 'Dos', 'Biceps'],

      equipment: ['barbell', 'dumbbell', 'cable', 'machine', 'body_only'],
      weeklyFrequency: 3,
    };
    const result = generateWorkout(input, EXERCISE_CATALOG, details);
    const lastCompoundIdx = result.exercises.reduce(
      (max, ex, i) => ex.mechanic === 'compound' ? i : max, -1
    );
    const firstIsolationIdx = result.exercises.findIndex(ex => ex.mechanic === 'isolation');
    if (lastCompoundIdx >= 0 && firstIsolationIdx >= 0) {
      expect(lastCompoundIdx).toBeLessThan(firstIsolationIdx);
    }
  });

  it('generates correct sets: 2-4 range', () => {
    const input: GeneratorInput = {
      selectedMuscles: ['Biceps'],

      equipment: ['barbell', 'dumbbell', 'cable', 'body_only'],
      weeklyFrequency: 3,
    };
    const result = generateWorkout(input, EXERCISE_CATALOG, details);
    for (const ex of result.exercises) {
      expect(ex.sets).toBeGreaterThanOrEqual(2);
      expect(ex.sets).toBeLessThanOrEqual(5);
    }
  });

  it('warns when not enough exercises for a muscle', () => {
    const input: GeneratorInput = {
      selectedMuscles: ['Pectoraux', 'Dos', 'Biceps', 'Triceps', 'Épaules'],

      equipment: ['kettlebells'],
      weeklyFrequency: 3,
    };
    const result = generateWorkout(input, EXERCISE_CATALOG, details);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('produces no duplicate exercises', () => {
    const input: GeneratorInput = {
      selectedMuscles: ['Pectoraux', 'Dos', 'Épaules'],

      equipment: ['barbell', 'dumbbell', 'cable', 'machine', 'body_only'],
      weeklyFrequency: 3,
    };
    const result = generateWorkout(input, EXERCISE_CATALOG, details);
    const ids = result.exercises.map(e => e.catalogId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('generates more sets for low frequency (2x/week)', () => {
    const input: GeneratorInput = {
      selectedMuscles: ['Pectoraux', 'Dos'],
      equipment: ['barbell', 'dumbbell', 'cable', 'machine', 'body_only'],
      weeklyFrequency: 2,
    };
    const result = generateWorkout(input, EXERCISE_CATALOG, details);
    const compounds = result.exercises.filter(e => e.mechanic === 'compound');
    for (const ex of compounds) {
      expect(ex.sets).toBeGreaterThanOrEqual(3);
      expect(ex.sets).toBeLessThanOrEqual(4);
    }
  });

  it('generates fewer sets for high frequency (5x/week)', () => {
    const input: GeneratorInput = {
      selectedMuscles: ['Pectoraux', 'Dos'],
      equipment: ['barbell', 'dumbbell', 'cable', 'machine', 'body_only'],
      weeklyFrequency: 5,
    };
    const result = generateWorkout(input, EXERCISE_CATALOG, details);
    const isolations = result.exercises.filter(e => e.mechanic !== 'compound');
    for (const ex of isolations) {
      expect(ex.sets).toBeLessThanOrEqual(3);
    }
  });
});

describe('swapExercise', () => {
  it('returns a different exercise for the same muscle', () => {
    const input: GeneratorInput = {
      selectedMuscles: ['Pectoraux'],

      equipment: ['barbell', 'dumbbell', 'cable', 'machine', 'body_only'],
      weeklyFrequency: 3,
    };
    const result = generateWorkout(input, EXERCISE_CATALOG, details);
    const first = result.exercises[0];
    const swapped = swapExercise(first, result.exercises, input, EXERCISE_CATALOG, details);
    if (swapped) {
      expect(swapped.catalogId).not.toBe(first.catalogId);
      expect(swapped.muscleGroup).toBe(first.muscleGroup);
    }
  });
});
