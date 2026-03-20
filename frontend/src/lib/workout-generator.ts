import { type CatalogExercise } from './exercise-catalog-index';
import { type CatalogDetails } from './exercise-catalog';
import { UPPER_BODY_GROUPS } from './data';

function inferMechanic(name: string): 'compound' | 'isolation' {
  const n = name.toLowerCase();
  const compoundPatterns = [
    'bench press', 'squat', 'deadlift', 'row', 'pull-up', 'pull up', 'chin-up', 'chin up',
    'overhead press', 'military press', 'shoulder press', 'dip', 'lunge', 'clean', 'snatch',
    'thrust', 'push-up', 'push up', 'pulldown', 'pull down', 'press', 'step-up', 'step up',
    'good morning', 'rack pull', 'power clean', 't-bar'
  ];
  if (compoundPatterns.some(p => n.includes(p))) return 'compound';
  return 'isolation';
}

function inferForce(target: string): 'push' | 'pull' | 'static' {
  const pushTargets = ['pectorals', 'delts', 'triceps', 'quads', 'abductors', 'adductors'];
  const pullTargets = ['lats', 'upper back', 'traps', 'biceps', 'hamstrings', 'levator scapulae'];
  if (pushTargets.includes(target)) return 'push';
  if (pullTargets.includes(target)) return 'pull';
  return 'static';
}

export interface GeneratorInput {
  selectedMuscles: string[];
  equipment: string[];
  weeklyFrequency: 2 | 3 | 4 | 5; // sessions per week
}

export interface GeneratedExercise {
  catalogId: string;
  name: string;
  muscleGroup: string;
  mechanic: 'compound' | 'isolation' | null;
  force: 'push' | 'pull' | 'static' | null;
  sets: number;
  reps: number;
}

export interface GeneratorResult {
  exercises: GeneratedExercise[];
  warnings: string[];
}

interface EnrichedExercise {
  catalog: CatalogExercise;
  details: CatalogDetails;
}

function filterByEquipment(exercises: EnrichedExercise[], equipment: string[]): EnrichedExercise[] {
  return exercises.filter(e => equipment.includes(e.catalog.equipment));
}

function filterByMuscle(exercises: EnrichedExercise[], muscle: string): EnrichedExercise[] {
  return exercises.filter(e => e.details.primaryMuscles.includes(muscle));
}

// Equipment hierarchy for hypertrophy — higher = more effective for progressive overload
const EQUIPMENT_PRIORITY: Record<string, number> = {
  barbell: 5,
  dumbbell: 5,
  machine: 4,
  cable: 3,
  kettlebells: 2,
  bands: 1,
  body_only: 1,
};

function scoreExercise(exercise: EnrichedExercise): number {
  // Favor classic/proven exercises: beginner = 3, intermediate = 2, expert = 1
  // This ensures compound staples (bench, squat, curl) always rank highest
  const LEVEL_SCORE: Record<string, number> = { beginner: 3, intermediate: 2, expert: 1 };
  let score = LEVEL_SCORE[exercise.details.level] || 1;

  // Equipment priority score (1-5) — heavily weighted to favor barbell/dumbbell/machine
  score += (EQUIPMENT_PRIORITY[exercise.catalog.equipment] || 1) * 2;

  return score;
}

// Movement family detection — max 1 exercise per family to force variety
function getMovementFamily(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('bench press') || n.includes('chest press')) return 'chest-press';
  if (n.includes('fly') || n.includes('crossover') || n.includes('pec deck')) return 'fly';
  if (n.includes('overhead press') || n.includes('military press') || n.includes('shoulder press') || n.includes('arnold press')) return 'shoulder-press';
  if (n.includes('lateral raise')) return 'lateral-raise';
  if (n.includes('front raise')) return 'front-raise';
  if (n.includes('rear delt') || n.includes('face pull') || n.includes('reverse fly')) return 'rear-delt';
  if (n.includes('hammer curl')) return 'hammer-curl';
  if (n.includes('preacher curl') || n.includes('concentration curl')) return 'preacher-curl';
  if (n.includes('curl')) return 'curl';
  if (n.includes('tricep') && (n.includes('extension') || n.includes('pushdown') || n.includes('skull'))) return 'triceps-extension';
  if (n.includes('kickback')) return 'kickback';
  if (n.includes('dip')) return 'dips';
  if (n.includes('upright row')) return 'upright-row';
  if (n.includes('row')) return 'row';
  if (n.includes('pull-up') || n.includes('pull up') || n.includes('pulldown') || n.includes('pull down') || n.includes('chin-up') || n.includes('chin up') || n.includes('lat pull')) return 'vertical-pull';
  if (n.includes('squat') || n.includes('goblet')) return 'squat';
  if (n.includes('lunge') || n.includes('split squat') || n.includes('step-up') || n.includes('step up')) return 'lunge';
  if (n.includes('deadlift') || n.includes('good morning')) return 'deadlift';
  if (n.includes('hip thrust') || n.includes('glute bridge')) return 'hip-thrust';
  if (n.includes('leg press') || n.includes('hack squat')) return 'leg-press';
  if (n.includes('leg curl') || n.includes('hamstring curl')) return 'leg-curl';
  if (n.includes('leg extension')) return 'leg-extension';
  if (n.includes('calf raise') || n.includes('calf press') || n.includes('standing calf') || n.includes('seated calf')) return 'calf-raise';
  if (n.includes('crunch') || n.includes('sit-up') || n.includes('sit up')) return 'crunch';
  if (n.includes('plank')) return 'plank';
  if (n.includes('push-up') || n.includes('push up')) return 'pushup';
  if (n.includes('shrug')) return 'shrug';
  return `unique:${name}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function allocateExercisesPerMuscle(muscles: string[], total: number): Record<string, number> {
  const result: Record<string, number> = {};
  const base = Math.floor(total / muscles.length);
  let remainder = total - base * muscles.length;
  for (const m of muscles) {
    result[m] = base;
    if (remainder > 0) {
      result[m]++;
      remainder--;
    }
  }
  return result;
}

// ─── Volume programming based on frequency and muscle count ───
// Based on hypertrophy science: 10-20 sets/muscle/week (Schoenfeld et al.)
// Frequency determines session length; muscle count determines exercises per session

function getSessionConfig(nbMuscles: number, weeklyFrequency: 2 | 3 | 4 | 5) {
  // Target exercises per session based on frequency + muscle count
  //
  // Frequency 1-2x: longer sessions, more exercises, heavier loads (fewer reps)
  // Frequency 3x:   balanced sessions
  // Frequency 4x:   shorter sessions, moderate exercises
  // Frequency 5-6x: short sessions, fewer exercises, lighter loads (more reps)
  //
  // nbMuscles 1:   specialized session (e.g. chest day)
  // nbMuscles 2-3: typical split (e.g. push, pull)
  // nbMuscles 4-5: upper/lower
  // nbMuscles 6+:  full body

  let targetExercises: number;
  let setsPerCompound: number;
  let setsPerIsolation: number;
  let repsCompound: number;
  let repsIsolation: number;

  if (weeklyFrequency <= 2) {
    // Low frequency → long sessions, high volume per exercise
    if (nbMuscles === 1) { targetExercises = 5; setsPerCompound = 4; setsPerIsolation = 3; }
    else if (nbMuscles <= 3) { targetExercises = 6; setsPerCompound = 4; setsPerIsolation = 3; }
    else if (nbMuscles <= 5) { targetExercises = 7; setsPerCompound = 3; setsPerIsolation = 3; }
    else { targetExercises = 7; setsPerCompound = 3; setsPerIsolation = 2; }
    repsCompound = 8; repsIsolation = 10;
  } else if (weeklyFrequency === 3) {
    // Medium frequency → balanced
    if (nbMuscles === 1) { targetExercises = 4; setsPerCompound = 4; setsPerIsolation = 3; }
    else if (nbMuscles <= 3) { targetExercises = 5; setsPerCompound = 3; setsPerIsolation = 3; }
    else if (nbMuscles <= 5) { targetExercises = 6; setsPerCompound = 3; setsPerIsolation = 3; }
    else { targetExercises = 6; setsPerCompound = 3; setsPerIsolation = 2; }
    repsCompound = 10; repsIsolation = 12;
  } else if (weeklyFrequency === 4) {
    // Higher frequency → shorter sessions
    if (nbMuscles === 1) { targetExercises = 4; setsPerCompound = 3; setsPerIsolation = 3; }
    else if (nbMuscles <= 3) { targetExercises = 5; setsPerCompound = 3; setsPerIsolation = 3; }
    else if (nbMuscles <= 5) { targetExercises = 5; setsPerCompound = 3; setsPerIsolation = 2; }
    else { targetExercises = 5; setsPerCompound = 3; setsPerIsolation = 2; }
    repsCompound = 10; repsIsolation = 12;
  } else {
    // High frequency (5-6x) → short sessions, lighter loads
    if (nbMuscles === 1) { targetExercises = 3; setsPerCompound = 3; setsPerIsolation = 3; }
    else if (nbMuscles <= 3) { targetExercises = 4; setsPerCompound = 3; setsPerIsolation = 2; }
    else if (nbMuscles <= 5) { targetExercises = 4; setsPerCompound = 3; setsPerIsolation = 2; }
    else { targetExercises = 4; setsPerCompound = 2; setsPerIsolation = 2; }
    repsCompound = 12; repsIsolation = 15;
  }

  return { targetExercises, setsPerCompound, setsPerIsolation, repsCompound, repsIsolation };
}

export function generateWorkout(
  input: GeneratorInput,
  catalog: CatalogExercise[],
  allDetails: Record<string, CatalogDetails>
): GeneratorResult {
  const warnings: string[] = [];
  const { selectedMuscles, equipment } = input;
  const nbMuscles = selectedMuscles.length;

  const enriched: EnrichedExercise[] = catalog
    .filter(c => allDetails[c.id])
    .map(c => ({
      catalog: c,
      details: {
        ...allDetails[c.id],
        mechanic: inferMechanic(c.name_en),
        force: inferForce(c.target),
      },
    }));

  const eligible = filterByEquipment(enriched, equipment);

  const { weeklyFrequency } = input;
  const config = getSessionConfig(nbMuscles, weeklyFrequency);

  const exercisesPerMuscle = allocateExercisesPerMuscle(selectedMuscles, config.targetExercises);

  const secondaryVolume: Record<string, number> = {};
  const usedIds = new Set<string>();
  const usedFamilies = new Set<string>(); // max 1 exercise per movement family
  const selected: GeneratedExercise[] = [];
  const maxCompounds = nbMuscles <= 3 ? 3 : nbMuscles <= 5 ? 4 : 5;
  let compoundCount = 0;

  for (const muscle of selectedMuscles) {
    const count = exercisesPerMuscle[muscle];
    const pool = filterByMuscle(eligible, muscle)
      .filter(e => !usedIds.has(e.catalog.id))
      // For shoulders, only propose side delt isolation exercises (lateral raises)
      .filter(e => muscle !== 'Épaules' || !e.catalog.deltPortion || e.catalog.deltPortion === 'side' || e.catalog.deltPortion === 'compound');

    const compounds = pool.filter(e => e.details.mechanic === 'compound');
    const isolations = pool.filter(e => e.details.mechanic === 'isolation' || e.details.mechanic === null);

    const pickedForMuscle: EnrichedExercise[] = [];

    const sortedCompounds = shuffle(compounds).sort((a, b) => scoreExercise(b) - scoreExercise(a));
    const sortedIsolations = shuffle(isolations).sort((a, b) => scoreExercise(b) - scoreExercise(a));

    // Pick 1 compound — skip if family already used
    for (const comp of sortedCompounds) {
      if (compoundCount >= maxCompounds) break;
      const family = getMovementFamily(comp.catalog.name_en);
      if (usedFamilies.has(family)) continue;
      pickedForMuscle.push(comp);
      usedIds.add(comp.catalog.id);
      usedFamilies.add(family);
      compoundCount++;
      break;
    }

    const remaining = count - pickedForMuscle.length;
    const remainingPool = shuffle([
      ...sortedIsolations,
      ...sortedCompounds.filter(e => !pickedForMuscle.includes(e))
    ]);

    let filled = 0;
    for (const candidate of remainingPool) {
      if (filled >= remaining) break;
      if (usedIds.has(candidate.catalog.id)) continue;

      // Movement family check — max 1 per family
      const family = getMovementFamily(candidate.catalog.name_en);
      if (usedFamilies.has(family)) continue;

      const isIsolation = candidate.details.mechanic !== 'compound';
      if (isIsolation && (secondaryVolume[muscle] || 0) >= 6) continue;

      pickedForMuscle.push(candidate);
      usedIds.add(candidate.catalog.id);
      usedFamilies.add(family);
      filled++;
    }

    if (pickedForMuscle.length < count) {
      warnings.push(`notEnoughExercises:${muscle}`);
    }

    for (const ex of pickedForMuscle) {
      const isCompound = ex.details.mechanic === 'compound';
      const sets = isCompound ? config.setsPerCompound : config.setsPerIsolation;
      const reps = isCompound ? config.repsCompound : config.repsIsolation;

      selected.push({
        catalogId: ex.catalog.id,
        name: ex.catalog.name_fr,
        muscleGroup: ex.catalog.muscle_group,
        mechanic: ex.details.mechanic as 'compound' | 'isolation' | null,
        force: ex.details.force as 'push' | 'pull' | 'static' | null,
        sets,
        reps,
      });

      for (const sec of ex.details.secondaryMuscles) {
        secondaryVolume[sec] = (secondaryVolume[sec] || 0) + sets * 0.5;
      }
    }
  }

  // Sort: compounds first, then isolations
  selected.sort((a, b) => {
    if (a.mechanic === 'compound' && b.mechanic !== 'compound') return -1;
    if (a.mechanic !== 'compound' && b.mechanic === 'compound') return 1;
    return 0;
  });

  // Post-sort: avoid consecutive same mechanic+force+muscle (only swap within same mechanic tier)
  for (let i = 1; i < selected.length; i++) {
    const prev = selected[i - 1];
    const curr = selected[i];
    if (prev.mechanic === curr.mechanic && prev.force === curr.force && prev.muscleGroup === curr.muscleGroup) {
      for (let j = i + 1; j < selected.length; j++) {
        const cand = selected[j];
        // Only swap with exercises of the same mechanic type to preserve compound-first ordering
        if (cand.mechanic === curr.mechanic &&
            (cand.force !== curr.force || cand.muscleGroup !== curr.muscleGroup)) {
          [selected[i], selected[j]] = [selected[j], selected[i]];
          break;
        }
      }
    }
  }

  // Push/pull balance check
  const pushCount = selected.filter(e => e.force === 'push').length;
  const pullCount = selected.filter(e => e.force === 'pull').length;
  const hasUpperBody = selectedMuscles.some(m => UPPER_BODY_GROUPS.includes(m));
  if (hasUpperBody && pushCount > 0 && pullCount === 0) {
    warnings.push('pushOnlyWarning');
  } else if (pushCount > 0 && pullCount > 0 && pushCount / pullCount > 2) {
    warnings.push('pushPullRatioWarning');
  }

  return { exercises: selected, warnings };
}

export function swapExercise(
  current: GeneratedExercise,
  allSelected: GeneratedExercise[],
  input: GeneratorInput,
  catalog: CatalogExercise[],
  allDetails: Record<string, CatalogDetails>
): GeneratedExercise | null {
  const enriched: EnrichedExercise[] = catalog
    .filter(c => allDetails[c.id])
    .map(c => ({
      catalog: c,
      details: {
        ...allDetails[c.id],
        mechanic: inferMechanic(c.name_en),
        force: inferForce(c.target),
      },
    }));

  const eligible = filterByEquipment(enriched, input.equipment);
  const pool = filterByMuscle(eligible, current.muscleGroup)
    .filter(e => current.muscleGroup !== 'Épaules' || !e.catalog.deltPortion || e.catalog.deltPortion === 'side' || e.catalog.deltPortion === 'compound');

  const usedIds = new Set(allSelected.map(e => e.catalogId));
  const available = shuffle(pool.filter(e => !usedIds.has(e.catalog.id)))
    .sort((a, b) => scoreExercise(b) - scoreExercise(a));

  const sameMechanic = available.filter(e => e.details.mechanic === current.mechanic);
  const pick = sameMechanic[0] || available[0];

  if (!pick) return null;

  return {
    catalogId: pick.catalog.id,
    name: pick.catalog.name_fr,
    muscleGroup: pick.catalog.muscle_group,
    mechanic: pick.details.mechanic as 'compound' | 'isolation' | null,
    force: pick.details.force as 'push' | 'pull' | 'static' | null,
    sets: current.sets,
    reps: current.reps,
  };
}
