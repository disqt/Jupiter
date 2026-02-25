import pool from './db';

const DEFAULT_EXERCISES: { name: string; muscle_group: string }[] = [
  // Pectoraux
  { name: 'Développé couché', muscle_group: 'Pectoraux' },
  { name: 'Développé incliné', muscle_group: 'Pectoraux' },
  { name: 'Développé décliné', muscle_group: 'Pectoraux' },
  { name: 'Écarté couché haltères', muscle_group: 'Pectoraux' },
  { name: 'Écarté à la poulie vis-à-vis', muscle_group: 'Pectoraux' },
  { name: 'Pompes', muscle_group: 'Pectoraux' },
  { name: 'Dips (pectoraux)', muscle_group: 'Pectoraux' },

  // Dos
  { name: 'Tractions', muscle_group: 'Dos' },
  { name: 'Rowing barre', muscle_group: 'Dos' },
  { name: 'Rowing haltère', muscle_group: 'Dos' },
  { name: 'Tirage vertical', muscle_group: 'Dos' },
  { name: 'Tirage horizontal', muscle_group: 'Dos' },
  { name: 'Soulevé de terre', muscle_group: 'Dos' },
  { name: 'Pull-over', muscle_group: 'Dos' },

  // Épaules
  { name: 'Développé militaire', muscle_group: 'Épaules' },
  { name: 'Développé haltères assis', muscle_group: 'Épaules' },
  { name: 'Élévations latérales', muscle_group: 'Épaules' },
  { name: 'Élévations frontales', muscle_group: 'Épaules' },
  { name: 'Oiseau (élévations postérieures)', muscle_group: 'Épaules' },
  { name: 'Face pull', muscle_group: 'Épaules' },
  { name: 'Shrugs', muscle_group: 'Épaules' },

  // Biceps
  { name: 'Curl barre', muscle_group: 'Biceps' },
  { name: 'Curl haltères', muscle_group: 'Biceps' },
  { name: 'Curl marteau', muscle_group: 'Biceps' },
  { name: 'Curl incliné', muscle_group: 'Biceps' },
  { name: 'Curl pupitre', muscle_group: 'Biceps' },
  { name: 'Curl poulie basse', muscle_group: 'Biceps' },

  // Triceps
  { name: 'Dips (triceps)', muscle_group: 'Triceps' },
  { name: 'Extension triceps poulie haute', muscle_group: 'Triceps' },
  { name: 'Barre au front', muscle_group: 'Triceps' },
  { name: 'Extension triceps haltère', muscle_group: 'Triceps' },
  { name: 'Kickback', muscle_group: 'Triceps' },
  { name: 'Développé couché prise serrée', muscle_group: 'Triceps' },

  // Abdominaux
  { name: 'Crunch', muscle_group: 'Abdominaux' },
  { name: 'Crunch câble', muscle_group: 'Abdominaux' },
  { name: 'Relevé de jambes', muscle_group: 'Abdominaux' },
  { name: 'Planche', muscle_group: 'Abdominaux' },
  { name: 'Russian twist', muscle_group: 'Abdominaux' },
  { name: 'Ab wheel', muscle_group: 'Abdominaux' },

  // Quadriceps
  { name: 'Squat', muscle_group: 'Quadriceps' },
  { name: 'Squat bulgare', muscle_group: 'Quadriceps' },
  { name: 'Presse à cuisses', muscle_group: 'Quadriceps' },
  { name: 'Leg extension', muscle_group: 'Quadriceps' },
  { name: 'Fentes', muscle_group: 'Quadriceps' },
  { name: 'Hack squat', muscle_group: 'Quadriceps' },

  // Ischios
  { name: 'Leg curl couché', muscle_group: 'Ischios' },
  { name: 'Leg curl assis', muscle_group: 'Ischios' },
  { name: 'Soulevé de terre jambes tendues', muscle_group: 'Ischios' },
  { name: 'Good morning', muscle_group: 'Ischios' },
  { name: 'Nordic curl', muscle_group: 'Ischios' },

  // Fessiers
  { name: 'Hip thrust', muscle_group: 'Fessiers' },
  { name: 'Pont fessier', muscle_group: 'Fessiers' },
  { name: 'Abduction hanche', muscle_group: 'Fessiers' },
  { name: 'Kickback câble', muscle_group: 'Fessiers' },
  { name: 'Fentes arrière', muscle_group: 'Fessiers' },

  // Mollets
  { name: 'Mollets debout', muscle_group: 'Mollets' },
  { name: 'Mollets assis', muscle_group: 'Mollets' },
  { name: 'Mollets presse', muscle_group: 'Mollets' },
];

export async function seedDefaultExercises(userId: number): Promise<void> {
  const values = DEFAULT_EXERCISES.map(
    (_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`
  ).join(', ');

  const params = DEFAULT_EXERCISES.flatMap((e) => [e.name, e.muscle_group, userId]);

  await pool.query(
    `INSERT INTO exercises (name, muscle_group, user_id) VALUES ${values}`,
    params
  );
}
