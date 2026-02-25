const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

// --- Workouts ---

export interface ApiWorkout {
  id: number;
  date: string;
  type: 'velo' | 'musculation';
  notes: string | null;
  created_at: string;
  // cycling fields (null for musculation)
  duration: number | null;
  distance: string | null;
  elevation: number | null;
  ride_type: string | null;
  // exercise count for musculation
  exercise_count: string;
}

export interface Workout {
  id: number;
  date: string;
  type: 'velo' | 'musculation';
  detail: string;
  notes?: string;
  duration?: number;
  distance?: number;
  elevation?: number;
  rideType?: string;
  exerciseCount?: number;
}

function parseDate(d: string): string {
  // pg returns dates as ISO timestamps like "2026-02-24T23:00:00.000Z"
  // We need just "YYYY-MM-DD", but in local timezone (not UTC)
  if (d.includes('T')) {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }
  return d;
}

function toWorkout(raw: ApiWorkout): Workout {
  const distance = raw.distance ? parseFloat(raw.distance) : undefined;
  const elevation = raw.elevation ?? undefined;
  const rideType = raw.ride_type ?? undefined;
  const duration = raw.duration ?? undefined;
  const exerciseCount = parseInt(raw.exercise_count) || 0;

  let detail = '';
  if (raw.type === 'velo') {
    const parts: string[] = [];
    if (distance) parts.push(`${distance} km`);
    if (rideType) parts.push(rideType);
    if (elevation) parts.push(`${elevation}m D+`);
    detail = parts.join(' — ') || 'Vélo';
  } else {
    detail = exerciseCount > 0
      ? `${exerciseCount} exercice${exerciseCount > 1 ? 's' : ''}`
      : 'Musculation';
  }

  return {
    id: raw.id,
    date: parseDate(raw.date),
    type: raw.type,
    detail,
    notes: raw.notes ?? undefined,
    duration,
    distance,
    elevation,
    rideType,
    exerciseCount,
  };
}

export async function fetchWorkouts(month: string): Promise<Workout[]> {
  const rows = await request<ApiWorkout[]>(`/api/workouts?month=${month}`);
  return rows.map(toWorkout);
}

export async function fetchWorkout(id: number) {
  return request<ApiWorkout & { cycling_details?: Record<string, unknown>; exercise_logs?: Record<string, unknown>[] }>(`/api/workouts/${id}`);
}

export async function createWorkout(data: {
  date: string;
  type: 'velo' | 'musculation';
  notes?: string;
  cycling_details?: { duration?: number; distance?: number; elevation?: number; ride_type?: string };
  exercise_logs?: { exercise_id: number; set_number: number; reps: number; weight: number }[];
}) {
  return request<ApiWorkout>('/api/workouts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteWorkout(id: number) {
  return request(`/api/workouts/${id}`, { method: 'DELETE' });
}

// --- Exercises ---

export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
}

export async function fetchExercises(): Promise<Exercise[]> {
  return request<Exercise[]>('/api/exercises');
}

export async function createExercise(name: string, muscleGroup: string): Promise<Exercise> {
  return request<Exercise>('/api/exercises', {
    method: 'POST',
    body: JSON.stringify({ name, muscle_group: muscleGroup }),
  });
}

export interface LastPerformanceSet {
  set_number: number;
  reps: number;
  weight: string;
  date: string;
}

export async function fetchLastPerformance(exerciseId: number): Promise<LastPerformanceSet[]> {
  return request<LastPerformanceSet[]>(`/api/exercises/${exerciseId}/last-performance`);
}

// --- Stats ---

export interface MonthlyStats {
  cycling_count: string;
  strength_count: string;
  total_distance_km: string;
  total_elevation_m: string;
  active_days: string;
}

export async function fetchMonthlyStats(month: string): Promise<MonthlyStats> {
  return request<MonthlyStats>(`/api/stats/monthly?month=${month}`);
}

export interface WeeklyProgress {
  week_count: string;
  total_medals: string;
}

export async function fetchWeeklyProgress(): Promise<WeeklyProgress> {
  return request<WeeklyProgress>('/api/stats/weekly-progress');
}
