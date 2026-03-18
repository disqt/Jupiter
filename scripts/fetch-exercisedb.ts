/**
 * One-time script to fetch ALL exercises from ExerciseDB (RapidAPI)
 * and output a mapped JSON catalog.
 *
 * Run: npx tsx scripts/fetch-exercisedb.ts
 */

const API_KEY = process.env.RAPIDAPI_KEY ?? "64e56bba31msh8ab4835750872fap138876jsnb5ff4ce169f4";

const TARGET_TO_MUSCLE_GROUP: Record<string, string | null> = {
  pectorals: "Pectoraux",
  lats: "Dos",
  "upper back": "Dos",
  traps: "Dos",
  "levator scapulae": "Dos",
  spine: "Dos",
  delts: "Épaules",
  biceps: "Biceps",
  triceps: "Triceps",
  abs: "Abdominaux",
  "serratus anterior": "Abdominaux",
  quads: "Quadriceps",
  abductors: "Quadriceps",
  adductors: "Quadriceps",
  hamstrings: "Ischios",
  glutes: "Fessiers",
  calves: "Mollets",
  forearms: null,
  "cardiovascular system": null,
};

const EQUIPMENT_MAP: Record<string, string> = {
  barbell: "barbell",
  "olympic barbell": "barbell",
  "ez barbell": "barbell",
  "trap bar": "barbell",
  dumbbell: "dumbbell",
  hammer: "dumbbell",
  cable: "cable",
  rope: "cable",
  "leverage machine": "machine",
  "smith machine": "machine",
  "sled machine": "machine",
  kettlebell: "kettlebells",
  band: "bands",
  "resistance band": "bands",
  "body weight": "body_only",
  assisted: "body_only",
  weighted: "body_only",
};

const SECONDARY_MUSCLE_MAP: Record<string, string> = {
  biceps: "Biceps",
  triceps: "Triceps",
  abs: "Abdominaux",
  delts: "Épaules",
  quads: "Quadriceps",
  hamstrings: "Ischios",
  glutes: "Fessiers",
  calves: "Mollets",
  lats: "Dos",
  traps: "Dos",
  "upper back": "Dos",
  pectorals: "Pectoraux",
  forearms: "Avant-bras",
  "hip flexors": "Quadriceps",
  obliques: "Abdominaux",
  "lower back": "Dos",
  adductors: "Quadriceps",
  abductors: "Quadriceps",
  "serratus anterior": "Abdominaux",
  "levator scapulae": "Dos",
  spine: "Dos",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mapEquipment(eq: string): string {
  return EQUIPMENT_MAP[eq] ?? "other";
}

function mapSecondary(muscles: string[]): string[] {
  const mapped = muscles
    .map((m) => SECONDARY_MUSCLE_MAP[m])
    .filter((m): m is string => !!m);
  return [...new Set(mapped)];
}

interface RawExercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
}

async function main() {
  console.log("Fetching exercises from ExerciseDB...");
  const res = await fetch(
    "https://exercisedb.p.rapidapi.com/exercises?limit=1400&offset=0",
    {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "exercisedb.p.rapidapi.com",
      },
    }
  );

  if (!res.ok) {
    console.error(`API error: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.error(text.slice(0, 500));
    process.exit(1);
  }

  const raw: RawExercise[] = await res.json();
  console.log(`Fetched: ${raw.length} exercises`);

  const catalog: any[] = [];
  const muscleGroupCounts: Record<string, number> = {};
  const equipmentCounts: Record<string, number> = {};

  for (const ex of raw) {
    const muscleGroup = TARGET_TO_MUSCLE_GROUP[ex.target] ?? null;
    if (muscleGroup === null) continue;

    const equipment = mapEquipment(ex.equipment);
    const secondaryMuscles = mapSecondary(ex.secondaryMuscles);

    catalog.push({
      id: ex.id,
      name_en: ex.name,
      name_fr: capitalize(ex.name),
      muscle_group: muscleGroup,
      equipment,
      level: "intermediate",
      category: "strength",
      bodyPart: ex.bodyPart,
      target: ex.target,
      secondaryMuscles,
      instructions: ex.instructions,
      description: "",
    });

    muscleGroupCounts[muscleGroup] = (muscleGroupCounts[muscleGroup] ?? 0) + 1;
    equipmentCounts[equipment] = (equipmentCounts[equipment] ?? 0) + 1;
  }

  // Write output
  const fs = await import("fs");
  const path = await import("path");
  const outPath = path.join(__dirname, "..", "frontend", "src", "lib", "exercisedb-catalog.json");
  fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2));

  console.log(`\nSaved: ${outPath}`);
  console.log(`Total after filtering: ${catalog.length}`);
  console.log("\n--- Muscle groups ---");
  for (const [k, v] of Object.entries(muscleGroupCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
  console.log("\n--- Equipment ---");
  for (const [k, v] of Object.entries(equipmentCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
