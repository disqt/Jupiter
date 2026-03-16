import pool from './db-server';
import { DEFAULT_EXERCISES } from './default-exercises';

export { DEFAULT_EXERCISES };

export async function seedDefaultExercises(userId: number): Promise<void> {
  const values = DEFAULT_EXERCISES.map(
    (_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
  ).join(', ');

  const params = DEFAULT_EXERCISES.flatMap((e) => [e.name, e.muscle_group, userId, e.catalog_id]);

  await pool.query(
    `INSERT INTO exercises (name, muscle_group, user_id, catalog_id) VALUES ${values}`,
    params
  );
}
