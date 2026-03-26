import { pgTable, serial, varchar, date, text, integer, decimal, timestamp, boolean, unique, smallint } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nickname: varchar('nickname', { length: 50 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  hasSeenOnboarding: boolean('has_seen_onboarding').default(false).notNull(),
});

export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  date: date('date').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  notes: text('notes'),
  customEmoji: varchar('custom_emoji', { length: 10 }),
  customName: varchar('custom_name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cyclingDetails = pgTable('cycling_details', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  duration: integer('duration'),
  distance: decimal('distance', { precision: 6, scale: 2 }),
  elevation: integer('elevation'),
  rideType: varchar('ride_type', { length: 50 }),
  sessionType: varchar('session_type', { length: 30 }),
});

export const workoutDetails = pgTable('workout_details', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  duration: integer('duration'),
  distance: decimal('distance', { precision: 10, scale: 2 }),
  elevation: integer('elevation'),
  laps: integer('laps'),
  sessionType: varchar('session_type', { length: 30 }),
});

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  muscleGroup: varchar('muscle_group', { length: 50 }).notNull(),
  defaultMode: text('default_mode').notNull().default('reps-weight'),
  catalogId: text('catalog_id'),
});

export const exerciseLogs = pgTable('exercise_logs', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps').notNull(),
  weight: decimal('weight', { precision: 6, scale: 2 }).notNull(),
  mode: text('mode').notNull().default('reps-weight'),
  duration: integer('duration'),
});

export const exerciseWorkoutNotes = pgTable('exercise_workout_notes', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  note: text('note').notNull().default(''),
  pinned: boolean('pinned').notNull().default(false),
}, (table) => ({
  uniqueWorkoutExercise: unique().on(table.workoutId, table.exerciseId),
}));

export const workoutTemplates = pgTable('workout_templates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  workoutType: varchar('workout_type', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workoutTemplateExercises = pgTable('workout_template_exercises', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull().references(() => workoutTemplates.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull(),
  mode: varchar('mode', { length: 20 }).default('reps-weight'),
  setCount: integer('set_count').default(3),
});

export const userGoals = pgTable('user_goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  target: smallint('target').notNull(),
  effectiveFrom: date('effective_from').notNull(),
}, (table) => ({
  uniqueUserWeek: unique().on(table.userId, table.effectiveFrom),
}));
