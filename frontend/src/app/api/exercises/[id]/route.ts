import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const { name, muscle_group } = await request.json();
    const result = await pool.query(
      'UPDATE exercises SET name = $1, muscle_group = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, muscle_group, id, userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const result = await pool.query(
      'DELETE FROM exercises WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Exercise deleted' });
  } catch (err) {
    return handleApiError(err);
  }
}
