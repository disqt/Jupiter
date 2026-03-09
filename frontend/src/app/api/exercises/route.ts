import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';
import { createExerciseSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const result = await pool.query(
      'SELECT * FROM exercises WHERE user_id = $1 ORDER BY muscle_group, id',
      [userId]
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
    const parsed = createExerciseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { name, muscle_group } = parsed.data;
    const result = await pool.query(
      'INSERT INTO exercises (name, muscle_group, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, muscle_group, userId]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
