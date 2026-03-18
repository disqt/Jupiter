import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/api/exercise-image',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public API routes
  if (PUBLIC_API_ROUTES.some(route => pathname.endsWith(route))) {
    return NextResponse.next();
  }

  // Protect all other API routes — require Authorization header
  if (pathname.includes('/api/')) {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
