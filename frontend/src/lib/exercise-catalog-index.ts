import catalogData from './exercisedb-catalog.json';

export interface CatalogExercise {
  id: string;
  name_en: string;
  name_fr: string;
  muscle_group: string;
  equipment: string;
  level: string;
  category: string;
  bodyPart: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  description: string;
}

export const EXERCISE_CATALOG: CatalogExercise[] = catalogData as CatalogExercise[];
