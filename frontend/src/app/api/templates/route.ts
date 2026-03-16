import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';
import { createTemplateSchema, templateQuerySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const type = request.nextUrl.searchParams.get('type');
    const parsed = templateQuerySchema.safeParse({ type });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT t.id, t.name, t.workout_type, t.created_at,
        COALESCE(json_agg(
          json_build_object(
            'exercise_id', te.exercise_id,
            'exercise_name', e.name,
            'muscle_group', e.muscle_group,
            'sort_order', te.sort_order,
            'mode', te.mode,
            'set_count', te.set_count
          ) ORDER BY te.sort_order
        ) FILTER (WHERE te.id IS NOT NULL), '[]') as exercises
       FROM workout_templates t
       LEFT JOIN workout_template_exercises te ON te.template_id = t.id
       LEFT JOIN exercises e ON e.id = te.exercise_id
       WHERE t.user_id = $1 AND t.workout_type = $2
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [userId, parsed.data.type]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const body = await request.json();
    const parsed = createTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    // Check 50-template limit
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM workout_templates WHERE user_id = $1',
      [userId]
    );
    if (parseInt(countResult.rows[0].count) >= 50) {
      return NextResponse.json({ error: 'Maximum 50 templates reached' }, { status: 400 });
    }

    const { name, workout_type, exercises } = parsed.data;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const templateResult = await client.query(
        'INSERT INTO workout_templates (user_id, name, workout_type) VALUES ($1, $2, $3) RETURNING id, name, workout_type, created_at',
        [userId, name, workout_type]
      );
      const template = templateResult.rows[0];

      for (const ex of exercises) {
        await client.query(
          'INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, mode, set_count) VALUES ($1, $2, $3, $4, $5)',
          [template.id, ex.exercise_id, ex.sort_order, ex.mode, ex.set_count]
        );
      }

      await client.query('COMMIT');

      // Fetch complete template with exercise names
      const fullResult = await pool.query(
        `SELECT t.id, t.name, t.workout_type, t.created_at,
          COALESCE(json_agg(
            json_build_object(
              'exercise_id', te.exercise_id,
              'exercise_name', e.name,
              'muscle_group', e.muscle_group,
              'sort_order', te.sort_order,
              'mode', te.mode,
              'set_count', te.set_count
            ) ORDER BY te.sort_order
          ) FILTER (WHERE te.id IS NOT NULL), '[]') as exercises
         FROM workout_templates t
         LEFT JOIN workout_template_exercises te ON te.template_id = t.id
         LEFT JOIN exercises e ON e.id = te.exercise_id
         WHERE t.id = $1
         GROUP BY t.id`,
        [template.id]
      );

      return NextResponse.json(fullResult.rows[0], { status: 201 });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return handleApiError(err);
  }
}
