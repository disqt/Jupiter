import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET /api/workouts?month=YYYY-MM
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res.status(400).json({ error: 'month query param required (YYYY-MM)' });
    }
    const result = await pool.query(
      `SELECT w.*,
        cd.duration, cd.distance, cd.elevation, cd.ride_type,
        wd.duration as wd_duration, wd.distance as wd_distance, wd.elevation as wd_elevation, wd.laps as wd_laps,
        (SELECT COUNT(DISTINCT el.exercise_id) FROM exercise_logs el WHERE el.workout_id = w.id) as exercise_count
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE to_char(w.date, 'YYYY-MM') = $1
         AND w.user_id = $2
       ORDER BY w.date, w.created_at`,
      [month, req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/workouts/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workoutResult = await pool.query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (workoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    const workout = workoutResult.rows[0];

    if (workout.type === 'velo') {
      const cyclingResult = await pool.query(
        'SELECT * FROM cycling_details WHERE workout_id = $1', [id]
      );
      workout.cycling_details = cyclingResult.rows[0] || null;
    } else if (workout.type === 'musculation') {
      const logsResult = await pool.query(
        `SELECT el.*, e.name as exercise_name, e.muscle_group
         FROM exercise_logs el
         JOIN exercises e ON e.id = el.exercise_id
         WHERE el.workout_id = $1
         ORDER BY el.exercise_id, el.set_number`, [id]
      );
      workout.exercise_logs = logsResult.rows;
    } else {
      const detailsResult = await pool.query(
        'SELECT * FROM workout_details WHERE workout_id = $1', [id]
      );
      workout.workout_details = detailsResult.rows[0] || null;
    }

    res.json(workout);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/workouts
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { date, type, notes, cycling_details, exercise_logs, workout_details, custom_emoji, custom_name } = req.body;

    const workoutResult = await client.query(
      'INSERT INTO workouts (date, type, notes, user_id, custom_emoji, custom_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [date, type, notes || null, req.userId, custom_emoji || null, custom_name || null]
    );
    const workout = workoutResult.rows[0];

    if (type === 'velo' && cycling_details) {
      const { duration, distance, elevation, ride_type } = cycling_details;
      await client.query(
        `INSERT INTO cycling_details (workout_id, duration, distance, elevation, ride_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [workout.id, duration, distance, elevation, ride_type]
      );
    }

    if (type === 'musculation' && exercise_logs) {
      for (const log of exercise_logs) {
        await client.query(
          `INSERT INTO exercise_logs (workout_id, exercise_id, set_number, reps, weight)
           VALUES ($1, $2, $3, $4, $5)`,
          [workout.id, log.exercise_id, log.set_number, log.reps, log.weight]
        );
      }
    }

    if (['course', 'natation', 'custom'].includes(type) && workout_details) {
      const { duration, distance, elevation, laps } = workout_details;
      await client.query(
        `INSERT INTO workout_details (workout_id, duration, distance, elevation, laps)
         VALUES ($1, $2, $3, $4, $5)`,
        [workout.id, duration || null, distance || null, elevation || null, laps || null]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(workout);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT /api/workouts/:id
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { date, type, notes, cycling_details, exercise_logs, workout_details, custom_emoji, custom_name } = req.body;

    const workoutResult = await client.query(
      'UPDATE workouts SET date = $1, type = $2, notes = $3, custom_emoji = $5, custom_name = $6 WHERE id = $4 AND user_id = $7 RETURNING *',
      [date, type, notes || null, id, custom_emoji || null, custom_name || null, req.userId]
    );
    if (workoutResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Replace cycling details
    await client.query('DELETE FROM cycling_details WHERE workout_id = $1', [id]);
    if (type === 'velo' && cycling_details) {
      const { duration, distance, elevation, ride_type } = cycling_details;
      await client.query(
        `INSERT INTO cycling_details (workout_id, duration, distance, elevation, ride_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, duration, distance, elevation, ride_type]
      );
    }

    // Replace exercise logs
    await client.query('DELETE FROM exercise_logs WHERE workout_id = $1', [id]);
    if (type === 'musculation' && exercise_logs) {
      for (const log of exercise_logs) {
        await client.query(
          `INSERT INTO exercise_logs (workout_id, exercise_id, set_number, reps, weight)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, log.exercise_id, log.set_number, log.reps, log.weight]
        );
      }
    }

    // Replace workout details
    await client.query('DELETE FROM workout_details WHERE workout_id = $1', [id]);
    if (['course', 'natation', 'custom'].includes(type) && workout_details) {
      const { duration, distance, elevation, laps } = workout_details;
      await client.query(
        `INSERT INTO workout_details (workout_id, duration, distance, elevation, laps)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, duration || null, distance || null, elevation || null, laps || null]
      );
    }

    await client.query('COMMIT');
    res.json(workoutResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
