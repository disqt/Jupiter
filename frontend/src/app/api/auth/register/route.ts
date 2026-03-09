import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db-server';
import { seedDefaultExercises } from '@/lib/seed-exercises';
import { rateLimit } from '@/lib/rate-limit';
import { getJwtSecret } from '@/lib/auth-api';
import { registerSchema } from '@/lib/validations';

const SALT_ROUNDS = 12;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many attempts, try again later' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { nickname, password, invite_code } = parsed.data;

    if (!process.env.INVITE_CODE || invite_code !== process.env.INVITE_CODE) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 });
    }

    const existing = await pool.query('SELECT id FROM users WHERE nickname = $1', [nickname]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Nickname already taken' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      'INSERT INTO users (nickname, password_hash) VALUES ($1, $2) RETURNING id, nickname, created_at',
      [nickname, passwordHash]
    );

    const user = result.rows[0];
    await seedDefaultExercises(user.id);

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '30d' });

    return NextResponse.json({ token, user: { id: user.id, nickname: user.nickname } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
