import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET /api/stats/monthly?month=YYYY-MM
router.get('/monthly', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res.status(400).json({ error: 'month query param required (YYYY-MM)' });
    }

    const result = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE w.type = 'velo') AS cycling_count,
        COUNT(*) FILTER (WHERE w.type = 'musculation') AS strength_count,
        COALESCE(SUM(cd.distance), 0) AS total_distance_km,
        COALESCE(SUM(cd.elevation), 0) AS total_elevation_m,
        COUNT(DISTINCT w.date) AS active_days
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       WHERE to_char(w.date, 'YYYY-MM') = $1
         AND w.user_id = $2`,
      [month, req.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/weekly-progress
router.get('/weekly-progress', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*) as count
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      ),
      current_week AS (
        SELECT COUNT(*) as count
        FROM workouts
        WHERE user_id = $1
          AND date >= date_trunc('week', CURRENT_DATE)
          AND date < date_trunc('week', CURRENT_DATE) + interval '7 days'
      )
      SELECT
        (SELECT count FROM current_week) as week_count,
        COALESCE((SELECT SUM(GREATEST(count - 2, 0)) FROM weekly_counts), 0) as total_medals
    `, [req.userId]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
