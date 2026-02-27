import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET /api/stats/monthly?month=YYYY-MM or ?year=YYYY
router.get('/monthly', async (req, res) => {
  try {
    const { month, year } = req.query;

    let dateFormat: string;
    let dateValue: string;

    if (month && typeof month === 'string') {
      dateFormat = 'YYYY-MM';
      dateValue = month;
    } else if (year && typeof year === 'string') {
      dateFormat = 'YYYY';
      dateValue = year;
    } else {
      return res.status(400).json({ error: 'month (YYYY-MM) or year (YYYY) query param required' });
    }

    // Counts by type
    const countsResult = await pool.query(
      `SELECT type, COUNT(*)::text as count
       FROM workouts
       WHERE to_char(date, $1) = $2 AND user_id = $3
       GROUP BY type`,
      [dateFormat, dateValue, req.userId]
    );
    const counts_by_type: Record<string, string> = {};
    for (const row of countsResult.rows) {
      counts_by_type[row.type] = row.count;
    }

    // Aggregates
    const aggResult = await pool.query(
      `SELECT
        COUNT(*)::text AS total_count,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance)), 0)::text AS total_distance_km,
        COALESCE(SUM(COALESCE(cd.elevation, wd.elevation)), 0)::text AS total_elevation_m,
        COUNT(DISTINCT w.date)::text AS active_days
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE to_char(w.date, $1) = $2
         AND w.user_id = $3`,
      [dateFormat, dateValue, req.userId]
    );

    res.json({ ...aggResult.rows[0], counts_by_type });
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

// GET /api/stats/weekly-medals?month=YYYY-MM
router.get('/weekly-medals', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res.status(400).json({ error: 'month query param required (YYYY-MM)' });
    }

    const result = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*)::int as workout_count,
          GREATEST(COUNT(*) - 2, 0)::int as medals
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      )
      SELECT
        to_char(week_start, 'YYYY-MM-DD') as week_start,
        workout_count,
        medals
      FROM weekly_counts
      WHERE week_start + interval '6 days' >= ($2 || '-01')::date
        AND week_start < (($2 || '-01')::date + interval '1 month')
      ORDER BY week_start
    `, [req.userId, month]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/medals-history
router.get('/medals-history', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*)::int as workout_count,
          GREATEST(COUNT(*) - 2, 0)::int as medals
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      )
      SELECT
        to_char(week_start, 'YYYY-MM-DD') as week_start,
        workout_count,
        medals,
        SUM(medals) OVER (ORDER BY week_start)::int as cumulative
      FROM weekly_counts
      ORDER BY week_start
    `, [req.userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/distance-by-type?month=YYYY-MM or ?year=YYYY
router.get('/distance-by-type', async (req, res) => {
  try {
    const { month, year } = req.query;

    let dateFormat: string;
    let dateValue: string;
    let periodExpr: string;

    if (month && typeof month === 'string') {
      dateFormat = 'YYYY-MM';
      dateValue = month;
      periodExpr = `EXTRACT(ISOYEAR FROM w.date)::int * 100 + EXTRACT(WEEK FROM w.date)::int`;
    } else if (year && typeof year === 'string') {
      dateFormat = 'YYYY';
      dateValue = year;
      periodExpr = `to_char(w.date, 'MM')`;
    } else {
      return res.status(400).json({ error: 'month (YYYY-MM) or year (YYYY) query param required' });
    }

    const result = await pool.query(
      `SELECT
        ${periodExpr} as period_num,
        w.type,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance, 0)), 0)::float as distance
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE to_char(w.date, $1) = $2
         AND w.user_id = $3
       GROUP BY period_num, w.type
       ORDER BY period_num, w.type`,
      [dateFormat, dateValue, req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/strength-volume?month=YYYY-MM or ?year=YYYY
router.get('/strength-volume', async (req, res) => {
  try {
    const { month, year } = req.query;

    let dateFormat: string;
    let dateValue: string;

    if (month && typeof month === 'string') {
      dateFormat = 'YYYY-MM';
      dateValue = month;
    } else if (year && typeof year === 'string') {
      dateFormat = 'YYYY';
      dateValue = year;
    } else {
      return res.status(400).json({ error: 'month (YYYY-MM) or year (YYYY) query param required' });
    }

    const result = await pool.query(
      `SELECT
        COALESCE(SUM(el.reps * el.weight), 0)::float as total_tonnage,
        COUNT(DISTINCT el.exercise_id)::int as exercise_count,
        COUNT(*)::int as total_sets
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       WHERE w.type = 'musculation'
         AND to_char(w.date, $1) = $2
         AND w.user_id = $3`,
      [dateFormat, dateValue, req.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
