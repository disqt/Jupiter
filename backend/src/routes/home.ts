import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET /api/home — aggregated homepage data
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 1. Today's workouts
    const todayResult = await pool.query(
      `SELECT w.id, w.type, w.custom_emoji, w.custom_name,
              COALESCE(cd.duration, wd.duration) as duration,
              COALESCE(cd.distance, wd.distance)::float as distance,
              (SELECT COUNT(DISTINCT el.exercise_id) FROM exercise_logs el WHERE el.workout_id = w.id)::int as exercise_count
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE w.date = $1 AND w.user_id = $2
       ORDER BY w.created_at`,
      [todayStr, userId]
    );

    // 2. This week's workouts (Mon-Sun, grouped by day)
    const weekResult = await pool.query(
      `SELECT w.date::text as date, w.type
       FROM workouts w
       WHERE w.date >= date_trunc('week', CURRENT_DATE)
         AND w.date < date_trunc('week', CURRENT_DATE) + interval '7 days'
         AND w.user_id = $1
       ORDER BY w.date, w.created_at`,
      [userId]
    );

    // 3. Medals (total + this month)
    const medalsResult = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*) as count
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      )
      SELECT
        COALESCE(SUM(GREATEST(count - 2, 0)), 0)::int as total,
        COALESCE(SUM(CASE
          WHEN week_start >= date_trunc('month', CURRENT_DATE)
           AND week_start < date_trunc('month', CURRENT_DATE) + interval '1 month'
          THEN GREATEST(count - 2, 0) ELSE 0 END), 0)::int as month
      FROM weekly_counts
    `, [userId]);

    // 4. Week insights (current + previous week)
    const insightsResult = await pool.query(`
      SELECT
        COUNT(*)::int as sessions,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance)), 0)::float as distance_km,
        COALESCE(SUM(COALESCE(cd.duration, wd.duration)), 0)::int as duration_min
      FROM workouts w
      LEFT JOIN cycling_details cd ON cd.workout_id = w.id
      LEFT JOIN workout_details wd ON wd.workout_id = w.id
      WHERE w.date >= date_trunc('week', CURRENT_DATE)
        AND w.date < date_trunc('week', CURRENT_DATE) + interval '7 days'
        AND w.user_id = $1
    `, [userId]);

    const prevInsightsResult = await pool.query(`
      SELECT
        COUNT(*)::int as sessions,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance)), 0)::float as distance_km,
        COALESCE(SUM(COALESCE(cd.duration, wd.duration)), 0)::int as duration_min
      FROM workouts w
      LEFT JOIN cycling_details cd ON cd.workout_id = w.id
      LEFT JOIN workout_details wd ON wd.workout_id = w.id
      WHERE w.date >= date_trunc('week', CURRENT_DATE) - interval '7 days'
        AND w.date < date_trunc('week', CURRENT_DATE)
        AND w.user_id = $1
    `, [userId]);

    // Strength volume (current + previous week)
    const volumeResult = await pool.query(`
      SELECT COALESCE(SUM(el.reps * el.weight), 0)::float as volume_kg
      FROM exercise_logs el
      JOIN workouts w ON w.id = el.workout_id
      WHERE w.type = 'musculation'
        AND w.date >= date_trunc('week', CURRENT_DATE)
        AND w.date < date_trunc('week', CURRENT_DATE) + interval '7 days'
        AND w.user_id = $1
    `, [userId]);

    const prevVolumeResult = await pool.query(`
      SELECT COALESCE(SUM(el.reps * el.weight), 0)::float as volume_kg
      FROM exercise_logs el
      JOIN workouts w ON w.id = el.workout_id
      WHERE w.type = 'musculation'
        AND w.date >= date_trunc('week', CURRENT_DATE) - interval '7 days'
        AND w.date < date_trunc('week', CURRENT_DATE)
        AND w.user_id = $1
    `, [userId]);

    // 5. Streak (consecutive days with workouts, backwards from today/yesterday)
    const datesResult = await pool.query(
      `SELECT DISTINCT date::date as d
       FROM workouts
       WHERE user_id = $1 AND date <= CURRENT_DATE
       ORDER BY d DESC
       LIMIT 90`,
      [userId]
    );

    let streak = 0;
    let bestStreak = 0;

    if (datesResult.rows.length > 0) {
      // Compute current streak
      const todayMs = new Date(todayStr + 'T00:00:00').getTime();
      const dayMs = 86400000;
      const dates = datesResult.rows.map((r: { d: string }) => {
        const d = new Date(r.d);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

      let checkDate = todayMs;
      // If no workout today, check from yesterday
      if (dates[0] !== checkDate) {
        checkDate -= dayMs;
      }

      for (const d of dates) {
        if (d === checkDate) {
          streak++;
          checkDate -= dayMs;
        } else if (d < checkDate) {
          break;
        }
      }

      // Compute best streak from all dates
      let tempStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        if (dates[i - 1] - dates[i] === dayMs) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak, streak);
    }

    const curr = insightsResult.rows[0];
    const prev = prevInsightsResult.rows[0];

    res.json({
      today: todayResult.rows,
      week: weekResult.rows.map((r: { date: string; type: string }) => ({
        date: r.date.split('T')[0],
        type: r.type,
      })),
      medals: medalsResult.rows[0],
      insights: {
        sessions: curr.sessions,
        distance_km: curr.distance_km,
        duration_min: curr.duration_min,
        volume_kg: volumeResult.rows[0].volume_kg,
        prev_sessions: prev.sessions,
        prev_distance_km: prev.distance_km,
        prev_duration_min: prev.duration_min,
        prev_volume_kg: prevVolumeResult.rows[0].volume_kg,
      },
      streak,
      best_streak: bestStreak,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
