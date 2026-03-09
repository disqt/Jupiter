import { useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import * as api from '@/lib/api';
import * as guestStorage from '@/lib/guest-storage';
import { type GuestWorkout } from '@/lib/guest-storage';
import { type WorkoutType } from '@/lib/data';

export interface DataWorkout {
  id: number | string;
  type: WorkoutType;
  date: string;
  notes: string;
  custom_emoji: string | null;
  custom_name: string | null;
  detail: string;
  created_at: string;
  cycling_details?: Record<string, unknown> | null;
  workout_details?: Record<string, unknown> | null;
  exercise_logs?: Record<string, unknown>[];
  exercise_notes?: { exercise_id: number; note: string; pinned: boolean }[];
}

function guestToDataWorkout(g: GuestWorkout): DataWorkout {
  let detail = '';

  if (g.type === 'velo' && g.cycling_details) {
    const parts: string[] = [];
    if (g.cycling_details.distance) parts.push(`${g.cycling_details.distance} km`);
    if (g.cycling_details.ride_type) parts.push(g.cycling_details.ride_type);
    if (g.cycling_details.elevation) parts.push(`${g.cycling_details.elevation}m D+`);
    detail = parts.join(' — ') || 'Vélo';
  } else if (g.type === 'musculation' && g.exercise_logs && g.exercise_logs.length > 0) {
    const uniqueExercises = new Set(g.exercise_logs.map(l => l.exercise_id));
    const count = uniqueExercises.size;
    detail = `${count} exercice${count > 1 ? 's' : ''}`;
  } else if (['course', 'natation', 'marche', 'custom'].includes(g.type) && g.workout_details) {
    const wd = g.workout_details;
    if (g.type === 'natation') {
      const parts: string[] = [];
      if (wd.duration) parts.push(`${wd.duration} min`);
      if (wd.laps) parts.push(`${wd.laps} longueurs`);
      detail = parts.join(' — ') || 'Natation';
    } else {
      const parts: string[] = [];
      if (wd.duration) parts.push(`${wd.duration} min`);
      if (wd.distance) parts.push(`${wd.distance} km`);
      if (wd.elevation) parts.push(`${wd.elevation}m D+`);
      detail = parts.join(' — ') || (g.type === 'course' ? 'Course' : g.type === 'marche' ? 'Marche' : g.custom_name || 'Custom');
    }
  } else if (g.type === 'musculation') {
    detail = 'Musculation';
  } else if (g.custom_name) {
    detail = g.custom_name;
  } else {
    const typeDefaults: Record<string, string> = {
      velo: 'Vélo',
      musculation: 'Musculation',
      course: 'Course',
      natation: 'Natation',
      marche: 'Marche',
      custom: 'Custom',
    };
    detail = typeDefaults[g.type] || g.type;
  }

  return {
    id: g.id,
    type: g.type,
    date: g.date,
    notes: g.notes,
    custom_emoji: g.custom_emoji,
    custom_name: g.custom_name,
    detail,
    created_at: g.created_at,
    cycling_details: g.cycling_details as Record<string, unknown> | null | undefined,
    workout_details: g.workout_details as Record<string, unknown> | null | undefined,
    exercise_logs: g.exercise_logs as Record<string, unknown>[] | undefined,
    exercise_notes: g.exercise_notes,
  };
}

function apiWorkoutToDataWorkout(raw: api.ApiWorkout & {
  cycling_details?: Record<string, unknown>;
  exercise_logs?: Record<string, unknown>[];
  exercise_notes?: { exercise_id: number; note: string; pinned: boolean }[];
  workout_details?: Record<string, unknown>;
}): DataWorkout {
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
    type: raw.type,
    date: raw.date.includes('T')
      ? `${new Date(raw.date).getFullYear()}-${String(new Date(raw.date).getMonth() + 1).padStart(2, '0')}-${String(new Date(raw.date).getDate()).padStart(2, '0')}`
      : raw.date,
    notes: raw.notes ?? '',
    custom_emoji: raw.custom_emoji,
    custom_name: raw.custom_name,
    detail,
    created_at: raw.created_at,
    cycling_details: raw.cycling_details,
    workout_details: raw.workout_details,
    exercise_logs: raw.exercise_logs,
    exercise_notes: raw.exercise_notes,
  };
}

export function useDataSource() {
  const { isGuest } = useAuth();

  const fetchWorkouts = useCallback(async (month: string): Promise<DataWorkout[]> => {
    if (isGuest) {
      return guestStorage.getGuestWorkoutsByMonth(month).map(guestToDataWorkout);
    }
    const rows = await api.fetchWorkouts(month);
    return rows.map(w => ({
      id: w.id,
      type: w.type,
      date: w.date,
      notes: w.notes ?? '',
      custom_emoji: w.customEmoji ?? null,
      custom_name: w.customName ?? null,
      detail: w.detail,
      created_at: '',
    }));
  }, [isGuest]);

  const fetchWorkout = useCallback(async (id: number | string): Promise<DataWorkout | null> => {
    if (isGuest) {
      const g = guestStorage.getGuestWorkoutById(String(id));
      return g ? guestToDataWorkout(g) : null;
    }
    try {
      const raw = await api.fetchWorkout(Number(id));
      return apiWorkoutToDataWorkout(raw);
    } catch {
      return null;
    }
  }, [isGuest]);

  const saveWorkout = useCallback(async (payload: Record<string, unknown>): Promise<{ id: number | string }> => {
    if (isGuest) {
      const gw = guestStorage.saveGuestWorkout(payload as Omit<GuestWorkout, 'id' | 'created_at'>);
      return { id: gw.id };
    }
    const result = await api.createWorkout(payload as Parameters<typeof api.createWorkout>[0]);
    return { id: result.id };
  }, [isGuest]);

  const updateWorkout = useCallback(async (id: number | string, payload: Record<string, unknown>): Promise<void> => {
    if (isGuest) {
      guestStorage.updateGuestWorkout(String(id), payload as Partial<Omit<GuestWorkout, 'id' | 'created_at'>>);
      return;
    }
    await api.updateWorkout(Number(id), payload as Parameters<typeof api.updateWorkout>[1]);
  }, [isGuest]);

  const deleteWorkout = useCallback(async (id: number | string): Promise<void> => {
    if (isGuest) {
      guestStorage.deleteGuestWorkout(String(id));
      return;
    }
    await api.deleteWorkout(Number(id));
  }, [isGuest]);

  const patchWorkoutMeta = useCallback(async (id: number | string, data: { custom_emoji?: string | null; custom_name?: string | null }): Promise<void> => {
    if (isGuest) {
      guestStorage.updateGuestWorkout(String(id), data);
      return;
    }
    await api.patchWorkoutMeta(Number(id), data);
  }, [isGuest]);

  return {
    isGuest,
    fetchWorkouts,
    fetchWorkout,
    saveWorkout,
    updateWorkout,
    deleteWorkout,
    patchWorkoutMeta,
  };
}
