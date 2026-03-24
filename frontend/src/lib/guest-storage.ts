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
    session_type: string | null;
  } | null;
  workout_details?: {
    duration: number | null;
    distance: number | null;
    elevation: number | null;
    laps: number | null;
    session_type: string | null;
  } | null;
  exercise_logs?: {
    exercise_id: number;
    exercise_name: string;
    muscle_group: string;
    set_number: number;
    reps: number;
    weight: number;
    mode?: string;
    duration?: number;
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

// ── Medal computation helpers ──

/** Get the ISO week Monday (YYYY-MM-DD) for a given date string */
function getWeekMonday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dow = (d.getDay() + 6) % 7; // 0=Mon, 6=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

/** Group workouts by ISO week and compute medals per week */
function computeWeeklyMedals(workouts: GuestWorkout[]): { monday: string; count: number; medals: number }[] {
  const byWeek: Record<string, number> = {};
  for (const w of workouts) {
    const monday = getWeekMonday(w.date);
    byWeek[monday] = (byWeek[monday] || 0) + 1;
  }
  return Object.entries(byWeek).map(([monday, count]) => ({
    monday,
    count,
    medals: Math.max(count - 2, 0),
  }));
}

/** Get current week count + total medals (for WeeklyProgress & Calendar) */
export function getGuestWeeklyProgress(): { week_count: number; total_medals: number } {
  const all = readAll();
  const weeks = computeWeeklyMedals(all);
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentMonday = getWeekMonday(todayStr);
  const currentWeek = weeks.find(w => w.monday === currentMonday);
  const totalMedals = weeks.reduce((sum, w) => sum + w.medals, 0);
  return { week_count: currentWeek?.count || 0, total_medals: totalMedals };
}

/** Get medals per week for a given month (for Calendar grid) */
export function getGuestWeeklyMedalsForMonth(month: string): { week_start: string; workout_count: number; medals: number }[] {
  const all = readAll();
  const weeks = computeWeeklyMedals(all);
  const [yearStr, monthStr] = month.split('-');
  const y = parseInt(yearStr);
  const m = parseInt(monthStr);
  const lastDay = new Date(y, m, 0);
  const firstMonday = getWeekMonday(`${y}-${String(m).padStart(2, '0')}-01`);
  const lastDayStr = `${y}-${String(m).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
  const lastMonday = getWeekMonday(lastDayStr);

  return weeks
    .filter(w => w.monday >= firstMonday && w.monday <= lastMonday)
    .map(w => ({ week_start: w.monday, workout_count: w.count, medals: w.medals }))
    .sort((a, b) => a.week_start.localeCompare(b.week_start));
}

// ── Guest Template Storage ──

export interface GuestTemplate {
  id: string;
  name: string;
  workout_type: string;
  created_at: string;
  exercises: {
    exercise_id: number;
    exercise_name: string;
    muscle_group: string;
    sort_order: number;
    mode: string;
    set_count: number;
  }[];
}

const TEMPLATES_KEY = 'guest-templates';

function readAllTemplates(): GuestTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAllTemplates(templates: GuestTemplate[]): void {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function getGuestTemplates(workoutType?: string): GuestTemplate[] {
  const all = readAllTemplates();
  return workoutType ? all.filter(t => t.workout_type === workoutType) : all;
}

export function saveGuestTemplate(template: Omit<GuestTemplate, 'id' | 'created_at'>): GuestTemplate {
  const all = readAllTemplates();
  if (all.length >= 50) throw new Error('Maximum 50 templates reached');
  const newTemplate: GuestTemplate = {
    ...template,
    id: `guest-tpl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    created_at: new Date().toISOString(),
  };
  all.push(newTemplate);
  writeAllTemplates(all);
  return newTemplate;
}

export function deleteGuestTemplate(id: string): boolean {
  const all = readAllTemplates();
  const filtered = all.filter(t => t.id !== id);
  if (filtered.length === all.length) return false;
  writeAllTemplates(filtered);
  return true;
}

export function clearGuestTemplates(): void {
  localStorage.removeItem(TEMPLATES_KEY);
}

/** Get total + month medals (for HomePage) */
export function getGuestMedals(): { total: number; month: number } {
  const all = readAll();
  const weeks = computeWeeklyMedals(all);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const firstMonday = getWeekMonday(`${currentMonth}-01`);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const lastMonday = getWeekMonday(`${currentMonth}-${String(lastDay.getDate()).padStart(2, '0')}`);

  let total = 0;
  let monthMedals = 0;
  for (const w of weeks) {
    total += w.medals;
    if (w.monday >= firstMonday && w.monday <= lastMonday) {
      monthMedals += w.medals;
    }
  }
  return { total, month: monthMedals };
}
