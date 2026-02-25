import { pgTable, serial, varchar, date, text, integer, decimal, timestamp } from 'drizzle-orm/pg-core';

export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cyclingDetails = pgTable('cycling_details', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  duration: integer('duration'),
  distance: decimal('distance', { precision: 6, scale: 2 }),
  elevation: integer('elevation'),
  rideType: varchar('ride_type', { length: 50 }),
});

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  muscleGroup: varchar('muscle_group', { length: 50 }).notNull(),
});

export const exerciseLogs = pgTable('exercise_logs', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps').notNull(),
  weight: decimal('weight', { precision: 6, scale: 2 }).notNull(),
});
