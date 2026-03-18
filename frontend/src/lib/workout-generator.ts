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
  level: 'beginner' | 'intermediate' | 'expert';
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

function filterByLevel(exercises: EnrichedExercise[], level: GeneratorInput['level']): EnrichedExercise[] {
  if (level === 'beginner') return exercises.filter(e => e.details.level !== 'expert');
  return exercises;
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

function scoreExercise(exercise: EnrichedExercise, level: GeneratorInput['level']): number {
  // Level match score (0-2)
  let score = 0;
  if (exercise.details.level === level) score = 2;
  else if (level === 'expert' && exercise.details.level === 'intermediate') score = 1;
  else if (level === 'intermediate' && exercise.details.level === 'beginner') score = 1;

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

export function generateWorkout(
  input: GeneratorInput,
  catalog: CatalogExercise[],
  allDetails: Record<string, CatalogDetails>
): GeneratorResult {
  const warnings: string[] = [];
  const { selectedMuscles, level, equipment } = input;
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

  const eligible = filterByLevel(filterByEquipment(enriched, equipment), level);

  const { weeklyFrequency } = input;

  // Target ~10-12 sets/muscle/week. Fewer sessions → more volume per session.
  // frequency 2 → base 4 sets, frequency 3 → base 3, frequency 4-5 → base 2-3
  const baseSetsFromFreq = weeklyFrequency <= 2 ? 4 : weeklyFrequency <= 3 ? 3 : 3;
  // More exercises for low frequency to cover volume
  const freqBonus = weeklyFrequency <= 2 ? 1 : 0;

  const targetExercises = Math.min(Math.max(nbMuscles === 1 ? 4 : nbMuscles * 2 + freqBonus, 3), 8);
  const baseSets = nbMuscles >= 5 ? baseSetsFromFreq : baseSetsFromFreq;

  const exercisesPerMuscle = allocateExercisesPerMuscle(selectedMuscles, targetExercises);

  const secondaryVolume: Record<string, number> = {};
  const usedIds = new Set<string>();
  const usedFamilies = new Set<string>(); // max 1 exercise per movement family
  const selected: GeneratedExercise[] = [];
  const maxCompounds = nbMuscles <= 3 ? 2 : nbMuscles <= 5 ? 3 : 4;
  let compoundCount = 0;

  for (const muscle of selectedMuscles) {
    const count = exercisesPerMuscle[muscle];
    const pool = filterByMuscle(eligible, muscle)
      .filter(e => !usedIds.has(e.catalog.id));

    const compounds = pool.filter(e => e.details.mechanic === 'compound');
    const isolations = pool.filter(e => e.details.mechanic === 'isolation' || e.details.mechanic === null);

    const pickedForMuscle: EnrichedExercise[] = [];

    const sortedCompounds = shuffle(compounds).sort((a, b) => scoreExercise(b, level) - scoreExercise(a, level));
    const sortedIsolations = shuffle(isolations).sort((a, b) => scoreExercise(b, level) - scoreExercise(a, level));

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
      // Single muscle: more sets per exercise. High frequency (4-5x): fewer sets per session.
      const sets = nbMuscles === 1
        ? (isCompound ? Math.min(baseSets + 1, 5) : baseSets)
        : (isCompound ? baseSets : Math.max(baseSets - (weeklyFrequency >= 4 ? 1 : 0), 2));
      // Reps adapt to frequency: low freq → heavier/fewer reps, high freq → lighter/more reps
      const reps = isCompound
        ? (weeklyFrequency <= 2 ? 8 : weeklyFrequency <= 3 ? 10 : 12)
        : (weeklyFrequency <= 2 ? 10 : weeklyFrequency <= 3 ? 12 : 15);

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

  const eligible = filterByLevel(filterByEquipment(enriched, input.equipment), input.level);
  const pool = filterByMuscle(eligible, current.muscleGroup);

  const usedIds = new Set(allSelected.map(e => e.catalogId));
  const available = shuffle(pool.filter(e => !usedIds.has(e.catalog.id)))
    .sort((a, b) => scoreExercise(b, input.level) - scoreExercise(a, input.level));

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
