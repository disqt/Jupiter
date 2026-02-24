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
       WHERE to_char(w.date, 'YYYY-MM') = $1`,
      [month]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
