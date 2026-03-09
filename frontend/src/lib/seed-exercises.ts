import pool from './db-server';
import { DEFAULT_EXERCISES } from './default-exercises';

export { DEFAULT_EXERCISES };

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
