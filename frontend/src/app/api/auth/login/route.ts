import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db-server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many attempts, try again later' }, { status: 429 });
    }

    const { nickname, password } = await request.json();

    if (!nickname || !password) {
      return NextResponse.json({ error: 'Nickname and password are required' }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM users WHERE nickname = $1', [nickname]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid nickname or password' }, { status: 401 });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid nickname or password' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '30d' });

    return NextResponse.json({ token, user: { id: user.id, nickname: user.nickname } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
