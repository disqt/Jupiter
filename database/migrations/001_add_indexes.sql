-- Performance indexes for common query patterns

-- Workouts: frequently queried by user + date (calendar, home page, stats)
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts (user_id, date);

-- Workouts: filtered by user + type (stats by sport type)
CREATE INDEX IF NOT EXISTS idx_workouts_user_type ON workouts (user_id, type);

-- Cycling details: joined by workout_id
CREATE INDEX IF NOT EXISTS idx_cycling_details_workout ON cycling_details (workout_id);

-- Workout details: joined by workout_id
CREATE INDEX IF NOT EXISTS idx_workout_details_workout ON workout_details (workout_id);

-- Exercise logs: joined by workout_id (fetching all logs for a workout)
CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout ON exercise_logs (workout_id);

-- Exercise logs: filtered by exercise_id (exercise history)
CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise ON exercise_logs (exercise_id);

-- Exercises: filtered by user + muscle_group (exercise picker)
CREATE INDEX IF NOT EXISTS idx_exercises_user_muscle ON exercises (user_id, muscle_group);
