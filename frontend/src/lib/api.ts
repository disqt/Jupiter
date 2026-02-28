import { type WorkoutType } from './data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = `${BASE_PATH}/login`;
    throw new Error('Session expired');
  }

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
  type: WorkoutType;
  notes: string | null;
  created_at: string;
  // cycling fields (null for musculation)
  duration: number | null;
  distance: string | null;
  elevation: number | null;
  ride_type: string | null;
  // exercise count for musculation
  exercise_count: string;
  // new workout type fields
  custom_emoji: string | null;
  custom_name: string | null;
  wd_duration: number | null;
  wd_distance: string | null;
  wd_elevation: number | null;
  wd_laps: number | null;
}

export interface Workout {
  id: number;
  date: string;
  type: WorkoutType;
  detail: string;
  notes?: string;
  duration?: number;
  distance?: number;
  elevation?: number;
  rideType?: string;
  exerciseCount?: number;
  customEmoji?: string;
  customName?: string;
  laps?: number;
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
  const distance = raw.distance ? parseFloat(raw.distance) : (raw.wd_distance ? parseFloat(raw.wd_distance) : undefined);
  const elevation = raw.elevation ?? raw.wd_elevation ?? undefined;
  const rideType = raw.ride_type ?? undefined;
  const duration = raw.duration ?? raw.wd_duration ?? undefined;
  const exerciseCount = parseInt(raw.exercise_count) || 0;
  const laps = raw.wd_laps ?? undefined;

  let detail = '';
  if (raw.type === 'velo') {
    const parts: string[] = [];
    if (distance) parts.push(`${distance} km`);
    if (rideType) parts.push(rideType);
    if (elevation) parts.push(`${elevation}m D+`);
    detail = parts.join(' — ') || 'Vélo';
  } else if (raw.type === 'musculation') {
    detail = exerciseCount > 0
      ? `${exerciseCount} exercice${exerciseCount > 1 ? 's' : ''}`
      : 'Musculation';
  } else if (raw.type === 'course') {
    const parts: string[] = [];
    if (duration) parts.push(`${duration} min`);
    if (distance) parts.push(`${distance} km`);
    detail = parts.join(' — ') || 'Course';
  } else if (raw.type === 'natation') {
    const parts: string[] = [];
    if (duration) parts.push(`${duration} min`);
    if (laps) parts.push(`${laps} longueurs`);
    detail = parts.join(' — ') || 'Natation';
  } else if (raw.type === 'marche') {
    const parts: string[] = [];
    if (duration) parts.push(`${duration} min`);
    if (distance) parts.push(`${distance} km`);
    detail = parts.join(' — ') || 'Marche';
  } else {
    const parts: string[] = [];
    if (duration) parts.push(`${duration} min`);
    if (distance) parts.push(`${distance} km`);
    if (elevation) parts.push(`${elevation}m D+`);
    detail = parts.join(' — ') || raw.custom_name || 'Custom';
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
    laps,
    customEmoji: raw.custom_emoji ?? undefined,
    customName: raw.custom_name ?? undefined,
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
  type: WorkoutType;
  notes?: string;
  cycling_details?: { duration?: number; distance?: number; elevation?: number; ride_type?: string };
  exercise_logs?: { exercise_id: number; set_number: number; reps: number; weight: number }[];
  workout_details?: { duration?: number; distance?: number; elevation?: number; laps?: number };
  custom_emoji?: string;
  custom_name?: string;
}) {
  return request<ApiWorkout>('/api/workouts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateWorkout(id: number, data: {
  date: string;
  type: WorkoutType;
  notes?: string;
  cycling_details?: { duration?: number; distance?: number; elevation?: number; ride_type?: string };
  exercise_logs?: { exercise_id: number; set_number: number; reps: number; weight: number }[];
  workout_details?: { duration?: number; distance?: number; elevation?: number; laps?: number };
  custom_emoji?: string;
  custom_name?: string;
}) {
  return request<ApiWorkout>(`/api/workouts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function patchWorkoutMeta(id: number, data: { custom_emoji?: string | null; custom_name?: string | null }) {
  return request<ApiWorkout>(`/api/workouts/${id}`, {
    method: 'PATCH',
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

export interface HistorySet {
  set_number: number;
  reps: number;
  weight: string;
  date: string;
}

export async function fetchExerciseHistory(exerciseId: number): Promise<HistorySet[]> {
  return request<HistorySet[]>(`/api/exercises/${exerciseId}/history`);
}

// --- Stats ---

export interface MonthlyStats {
  total_count: string;
  counts_by_type: Record<string, string>;
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

export interface WeeklyMedal {
  week_start: string;
  workout_count: number;
  medals: number;
}

export async function fetchWeeklyMedals(month: string): Promise<WeeklyMedal[]> {
  return request<WeeklyMedal[]>(`/api/stats/weekly-medals?month=${month}`);
}

export interface MedalHistory {
  week_start: string;
  workout_count: number;
  medals: number;
  cumulative: number;
}

export async function fetchMedalsHistory(): Promise<MedalHistory[]> {
  return request<MedalHistory[]>('/api/stats/medals-history');
}

export interface DistanceByType {
  period_num: number | string;
  type: string;
  distance: number;
}

export async function fetchDistanceByType(params: { month?: string; year?: string }): Promise<DistanceByType[]> {
  const query = params.month ? `month=${params.month}` : `year=${params.year}`;
  return request<DistanceByType[]>(`/api/stats/distance-by-type?${query}`);
}

export interface StrengthVolume {
  total_tonnage: number;
  exercise_count: number;
  total_sets: number;
}

export async function fetchStrengthVolume(params: { month?: string; year?: string }): Promise<StrengthVolume> {
  const query = params.month ? `month=${params.month}` : `year=${params.year}`;
  return request<StrengthVolume>(`/api/stats/strength-volume?${query}`);
}

export async function fetchYearlyStats(year: string): Promise<MonthlyStats> {
  return request<MonthlyStats>(`/api/stats/monthly?year=${year}`);
}
