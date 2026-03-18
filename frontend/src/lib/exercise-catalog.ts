import { EXERCISE_CATALOG, type CatalogExercise } from './exercise-catalog-index';

// Index by ID for O(1) lookup
const catalogById = new Map<string, CatalogExercise>();
for (const ex of EXERCISE_CATALOG) {
  catalogById.set(ex.id, ex);
}

export function getCatalogExercise(catalogId: string): CatalogExercise | undefined {
  return catalogById.get(catalogId);
}

export interface CatalogDetails {
  level: string;
  force: string | null;
  mechanic: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
}

export function getCatalogDetails(catalogId: string): CatalogDetails | undefined {
  const ex = catalogById.get(catalogId);
  if (!ex) return undefined;
  return {
    level: ex.level,
    force: null,
    mechanic: null,
    primaryMuscles: [ex.muscle_group],
    secondaryMuscles: ex.secondaryMuscles,
    instructions: ex.instructions,
    images: [],
  };
}

export async function getAllCatalogDetails(): Promise<Record<string, CatalogDetails>> {
  const result: Record<string, CatalogDetails> = {};
  for (const ex of EXERCISE_CATALOG) {
    result[ex.id] = {
      level: ex.level,
      force: null,
      mechanic: null,
      primaryMuscles: [ex.muscle_group],
      secondaryMuscles: ex.secondaryMuscles,
      instructions: ex.instructions,
      images: [],
    };
  }
  return result;
}

export function getExerciseImageUrl(catalogId: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}/api/exercise-image?id=${catalogId}&res=360`;
}

export { EXERCISE_CATALOG, type CatalogExercise };
