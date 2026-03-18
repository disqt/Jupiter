import { type CatalogExercise } from './exercise-catalog-index';
import { type CatalogDetails } from './exercise-catalog';
import { UPPER_BODY_GROUPS } from './data';

export interface GeneratorInput {
  selectedMuscles: string[];
  level: 'beginner' | 'intermediate' | 'expert';
  equipment: string[];
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

  // Chest press variations
  if (n.includes('développé couché') || n.includes('développé décliné') || n.includes('développé incliné') || n.includes('développé poitrine')) return 'chest-press';
  // Shoulder press variations
  if (n.includes('développé militaire') || n.includes('développé épaules') || n.includes('développé arnold') || n.includes('développé haltères assis')) return 'shoulder-press';
  // Flyes
  if (n.includes('écarté') || n.includes('butterfly') || n.includes('crossover')) return 'fly';
  // Lateral/front raises
  if (n.includes('élévation latérale') || n.includes('élévations latérales')) return 'lateral-raise';
  if (n.includes('élévation frontale') || n.includes('élévations frontales')) return 'front-raise';
  // Rear delt
  if (n.includes('oiseau') || n.includes('face pull') || n.includes('band pull apart')) return 'rear-delt';
  // Curls
  if (n.includes('curl') && n.includes('marteau')) return 'hammer-curl';
  if (n.includes('curl') && n.includes('pupitre')) return 'preacher-curl';
  if (n.includes('curl')) return 'curl';
  // Triceps extensions
  if (n.includes('extension triceps') || n.includes('barre au front') || n.includes('skull crusher')) return 'triceps-extension';
  if (n.includes('kickback')) return 'kickback';
  if (n.includes('dips')) return 'dips';
  // Rows
  if (n.includes('rowing') && n.includes('vertical')) return 'upright-row';
  if (n.includes('rowing')) return 'row';
  // Vertical pulls
  if (n.includes('tirage vertical') || n.includes('traction') || n.includes('chin-up')) return 'vertical-pull';
  if (n.includes('tirage') && !n.includes('vertical')) return 'cable-pull';
  // Squats
  if (n.includes('squat') || n.includes('goblet')) return 'squat';
  // Lunges
  if (n.includes('fente') || n.includes('split squat') || n.includes('step-up')) return 'lunge';
  // Deadlifts
  if (n.includes('soulevé de terre')) return 'deadlift';
  // Hip thrust / glute bridge
  if (n.includes('hip thrust') || n.includes('pont fessier')) return 'hip-thrust';
  // Leg press
  if (n.includes('presse à cuisses') || n.includes('hack squat')) return 'leg-press';
  // Leg curl / extension
  if (n.includes('leg curl')) return 'leg-curl';
  if (n.includes('leg extension')) return 'leg-extension';
  // Calves
  if (n.includes('mollet')) return 'calf-raise';
  // Abs
  if (n.includes('crunch')) return 'crunch';
  if (n.includes('relevé de jambes')) return 'leg-raise';
  if (n.includes('planche')) return 'plank';
  // Pompes
  if (n.includes('pompes')) return 'pushup';
  // Shrugs
  if (n.includes('shrug')) return 'shrug';

  return `unique:${name}`; // no family detected → treated as unique
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
    .map(c => ({ catalog: c, details: allDetails[c.id] }));

  const eligible = filterByLevel(filterByEquipment(enriched, equipment), level);

  const targetExercises = Math.min(Math.max(nbMuscles === 1 ? 4 : nbMuscles * 2, 3), 8);
  const baseSets = nbMuscles >= 5 ? 4 : 3;

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
      const family = getMovementFamily(comp.catalog.name_fr);
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
      const family = getMovementFamily(candidate.catalog.name_fr);
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
      const sets = nbMuscles === 1 ? (isCompound ? 3 : 2) : (isCompound ? baseSets : Math.max(baseSets - 1, 2));
      const reps = isCompound ? 10 : 12;

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
    .map(c => ({ catalog: c, details: allDetails[c.id] }));

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
