import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET /api/exercises
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM exercises ORDER BY muscle_group, name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/exercises
router.post('/', async (req, res) => {
  try {
    const { name, muscle_group } = req.body;
    const result = await pool.query(
      'INSERT INTO exercises (name, muscle_group) VALUES ($1, $2) RETURNING *',
      [name, muscle_group]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/exercises/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, muscle_group } = req.body;
    const result = await pool.query(
      'UPDATE exercises SET name = $1, muscle_group = $2 WHERE id = $3 RETURNING *',
      [name, muscle_group, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/exercises/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM exercises WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json({ message: 'Exercise deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exercises/:id/last-performance
router.get('/:id/last-performance', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT el.set_number, el.reps, el.weight, w.date
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       WHERE el.exercise_id = $1
       AND w.date = (
         SELECT MAX(w2.date) FROM workouts w2
         JOIN exercise_logs el2 ON el2.workout_id = w2.id
         WHERE el2.exercise_id = $1
       )
       ORDER BY el.set_number`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
