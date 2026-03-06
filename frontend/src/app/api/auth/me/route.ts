import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

const SALT_ROUNDS = 12;

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const result = await pool.query('SELECT id, nickname, created_at FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const { nickname, password, current_password } = await request.json();

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (current_password) {
      const valid = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
    }

    if (nickname) {
      if (nickname.length < 2 || nickname.length > 50) {
        return NextResponse.json({ error: 'Nickname must be 2-50 characters' }, { status: 400 });
      }
      const existing = await pool.query('SELECT id FROM users WHERE nickname = $1 AND id != $2', [nickname, userId]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Nickname already taken' }, { status: 409 });
      }
      await pool.query('UPDATE users SET nickname = $1 WHERE id = $2', [nickname, userId]);
    }

    if (password) {
      if (!current_password) {
        return NextResponse.json({ error: 'Current password required to change password' }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    }

    const updated = await pool.query('SELECT id, nickname, created_at FROM users WHERE id = $1', [userId]);
    return NextResponse.json(updated.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}
