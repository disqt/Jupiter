import { type WorkoutType } from '@/lib/data';

export interface GuestWorkout {
  id: string;
  type: WorkoutType;
  date: string; // YYYY-MM-DD
  notes: string;
  custom_emoji: string | null;
  custom_name: string | null;
  created_at: string;
  cycling_details?: {
    duration: number;
    distance: number;
    elevation: number | null;
    ride_type: string | null;
  } | null;
  workout_details?: {
    duration: number | null;
    distance: number | null;
    elevation: number | null;
    laps: number | null;
  } | null;
  exercise_logs?: {
    exercise_id: number;
    exercise_name: string;
    muscle_group: string;
    set_number: number;
    reps: number;
    weight: number;
  }[];
  exercise_notes?: {
    exercise_id: number;
    note: string;
    pinned: boolean;
  }[];
}

const STORAGE_KEY = 'guest-workouts';

function generateId(): string {
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readAll(): GuestWorkout[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(workouts: GuestWorkout[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function getGuestWorkouts(): GuestWorkout[] {
  return readAll();
}

export function getGuestWorkoutById(id: string): GuestWorkout | undefined {
  return readAll().find(w => w.id === id);
}

export function getGuestWorkoutsByMonth(month: string): GuestWorkout[] {
  return readAll().filter(w => w.date.startsWith(month));
}

export function saveGuestWorkout(workout: Omit<GuestWorkout, 'id' | 'created_at'>): GuestWorkout {
  const all = readAll();
  const newWorkout: GuestWorkout = {
    ...workout,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  all.push(newWorkout);
  writeAll(all);
  return newWorkout;
}

export function updateGuestWorkout(id: string, updates: Partial<Omit<GuestWorkout, 'id' | 'created_at'>>): GuestWorkout | undefined {
  const all = readAll();
  const index = all.findIndex(w => w.id === id);
  if (index === -1) return undefined;
  all[index] = { ...all[index], ...updates };
  writeAll(all);
  return all[index];
}

export function deleteGuestWorkout(id: string): boolean {
  const all = readAll();
  const filtered = all.filter(w => w.id !== id);
  if (filtered.length === all.length) return false;
  writeAll(filtered);
  return true;
}

export function clearGuestWorkouts(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getGuestWorkoutCount(): number {
  return readAll().length;
}
