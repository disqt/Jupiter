-- Add exercise tracking mode (reps-weight vs time-based)
ALTER TABLE exercise_logs ADD COLUMN mode TEXT NOT NULL DEFAULT 'reps-weight';
ALTER TABLE exercise_logs ADD COLUMN duration INTEGER;
