# Merge Backend into Next.js API Routes

## Goal
Merge the Express backend into Next.js API Route Handlers to prepare for future Vercel deployment. Single Next.js app serves both frontend and API.

## Architecture

```
frontend/src/
  app/api/
    auth/
      register/route.ts    POST
      login/route.ts       POST
      me/route.ts          GET, PUT
    workouts/
      route.ts             GET, POST
      [id]/route.ts        GET, PUT, PATCH, DELETE
    exercises/
      route.ts             GET, POST
      [id]/route.ts        PUT, DELETE
      last-performance/route.ts  GET
      history/route.ts     GET
    stats/
      monthly/route.ts     GET
      weekly-progress/route.ts
      weekly-medals/route.ts
      medals-history/route.ts
      distance-by-type/route.ts
      strength-volume/route.ts
    home/route.ts          GET
    health/route.ts        GET
  lib/
    db.ts          pg pool connection
    schema.ts      Drizzle schema (copy from backend)
    auth-api.ts    JWT authenticate() helper + AuthError + handleApiError()
    rate-limit.ts  In-memory rate limiter
    seed-exercises.ts  Default exercises seeder
```

## Key Conversions

| Express | Next.js API Route |
|---------|-------------------|
| `req.body` | `await request.json()` |
| `res.json()` | `NextResponse.json()` |
| `res.status(401).json()` | `NextResponse.json({...}, { status: 401 })` |
| `req.query.month` | `request.nextUrl.searchParams.get('month')` |
| `req.params.id` | `params.id` from route segment |
| Auth middleware | `authenticate(request)` helper |

## Frontend Client Changes

- `lib/api.ts`: API_URL default from `http://localhost:3001` to `''` (same-origin)
- `lib/auth.tsx`: Same change
- `frontend/.env.local`: Remove `NEXT_PUBLIC_API_URL`

## Dependencies (move to frontend)

- `pg` + `@types/pg`
- `drizzle-orm` + `drizzle-kit`
- `jsonwebtoken` + `@types/jsonwebtoken`
- `bcryptjs` + `@types/bcryptjs`

## Environment Variables (frontend/.env.local)

- `DATABASE_URL` (Supabase connection string)
- `JWT_SECRET`
- `INVITE_CODE`

## VPS Production Changes

- Remove `jupiter-backend` systemd service
- Update nginx: remove proxy to :3101, Next.js handles `/jupiter/api/*`
- Update `frontend/.env.local` on VPS with DB credentials

## Strategy

Big-bang migration: create all shared libs + API routes at once, switch frontend to same-origin, test, then remove backend folder. Backend folder kept as reference until verified.
