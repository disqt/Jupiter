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

let detailsCache: Record<string, CatalogDetails> | null = null;

export async function getCatalogDetails(catalogId: string): Promise<CatalogDetails | undefined> {
  if (!detailsCache) {
    const resp = await import('./exercise-catalog-details.json');
    detailsCache = resp.default as Record<string, CatalogDetails>;
  }
  return detailsCache[catalogId];
}

export function getExerciseImageUrl(catalogId: string, imageIndex: number): string {
  const base = process.env.NEXT_PUBLIC_EXERCISE_IMAGE_URL;
  if (base) {
    return `${base}/${catalogId}/${imageIndex}.webp`;
  }
  // Dev fallback: use GitHub raw images (JPG)
  return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${catalogId}/${imageIndex}.jpg`;
}

export { EXERCISE_CATALOG, type CatalogExercise };
