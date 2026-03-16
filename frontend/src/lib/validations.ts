import { z } from 'zod';

// Enums
const WORKOUT_TYPES = ['velo', 'musculation', 'course', 'natation', 'marche', 'custom'] as const;
const MUSCLE_GROUPS = ['Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Abdominaux', 'Quadriceps', 'Ischios', 'Fessiers', 'Mollets'] as const;
const RIDE_TYPES = ['Route', 'Gravel', 'Home trainer', 'VTT', 'Vélotaf'] as const;

// Auth
export const loginSchema = z.object({
  nickname: z.string().min(1),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  nickname: z.string().min(2).max(50),
  password: z.string().min(6),
  email: z.string().email().max(255),
});

export const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(50).optional(),
  password: z.string().min(6).optional(),
  current_password: z.string().min(1).optional(),
});

// Exercises
export const createExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  muscle_group: z.enum(MUSCLE_GROUPS),
  default_mode: z.enum(['reps-weight', 'time']).default('reps-weight'),
  catalog_id: z.string().max(200).nullable().optional(),
});

export const updateExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  muscle_group: z.enum(MUSCLE_GROUPS),
  default_mode: z.enum(['reps-weight', 'time']).optional(),
});

// Nested schemas
export const cyclingDetailsSchema = z.object({
  duration: z.number().int().nonnegative(),
  distance: z.number().nonnegative(),
  elevation: z.number().int().nonnegative().optional(),
  ride_type: z.enum(RIDE_TYPES).optional(),
});

export const exerciseLogSchema = z.object({
  exercise_id: z.number().int().positive(),
  set_number: z.number().int().positive(),
  reps: z.number().int().nonnegative(),
  weight: z.number().nonnegative().default(0),
  mode: z.enum(['reps-weight', 'time']).default('reps-weight'),
  duration: z.number().int().positive().nullable().optional(),
});

export const exerciseNoteSchema = z.object({
  exercise_id: z.number().int().positive(),
  note: z.string().max(500),
  pinned: z.boolean().default(false),
});

export const workoutDetailsSchema = z.object({
  duration: z.number().int().nonnegative().optional().nullable(),
  distance: z.number().nonnegative().optional().nullable(),
  elevation: z.number().int().nonnegative().optional().nullable(),
  laps: z.number().int().nonnegative().optional().nullable(),
});

// Workouts
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createWorkoutSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  type: z.enum(WORKOUT_TYPES),
  notes: z.string().max(500).optional(),
  custom_emoji: z.string().max(10).optional(),
  custom_name: z.string().max(100).optional(),
  cycling_details: cyclingDetailsSchema.optional(),
  exercise_logs: z.array(exerciseLogSchema).optional(),
  exercise_notes: z.array(exerciseNoteSchema).optional(),
  workout_details: workoutDetailsSchema.optional(),
});

export const updateWorkoutSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  type: z.enum(WORKOUT_TYPES),
  notes: z.string().max(500).optional(),
  custom_emoji: z.string().max(10).optional(),
  custom_name: z.string().max(100).optional(),
  cycling_details: cyclingDetailsSchema.optional(),
  exercise_logs: z.array(exerciseLogSchema).optional(),
  exercise_notes: z.array(exerciseNoteSchema).optional(),
  workout_details: workoutDetailsSchema.optional(),
});

export const patchWorkoutSchema = z.object({
  custom_emoji: z.string().max(10).nullable().optional(),
  custom_name: z.string().max(100).nullable().optional(),
});

// Query params
export const monthParamSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
});

export const yearParamSchema = z.object({
  year: z.string().regex(/^\d{4}$/),
});

// Templates
export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  workout_type: z.enum(WORKOUT_TYPES),
  exercises: z.array(z.object({
    exercise_id: z.number().int().positive(),
    sort_order: z.number().int().nonnegative(),
    mode: z.enum(['reps-weight', 'time']).default('reps-weight'),
    set_count: z.number().int().min(1).max(20).default(3),
  })).min(1),
});

export const templateQuerySchema = z.object({
  type: z.enum(WORKOUT_TYPES),
});
