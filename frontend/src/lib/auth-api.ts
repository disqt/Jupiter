import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export function authenticate(request: NextRequest): number {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    throw new AuthError('Authentication required');
  }
  const token = header.slice(7);
  const payload = jwt.verify(token, getJwtSecret()) as { userId: number };
  return payload.userId;
}

export { getJwtSecret };

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
