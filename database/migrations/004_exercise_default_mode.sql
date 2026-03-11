-- Add default tracking mode to exercises (reps-weight vs time)
ALTER TABLE exercises ADD COLUMN default_mode TEXT NOT NULL DEFAULT 'reps-weight';
