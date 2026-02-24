CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('musculation', 'velo')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cycling_details (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    duration INTEGER,
    distance DECIMAL(6,2),
    elevation INTEGER,
    ride_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS exercise_logs (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight DECIMAL(6,2) NOT NULL
);

-- Seed: default exercises
INSERT INTO exercises (name, muscle_group) VALUES
    ('Developpe couche', 'Pectoraux'),
    ('Squat', 'Jambes'),
    ('Souleve de terre', 'Dos'),
    ('Developpe militaire', 'Epaules'),
    ('Curl biceps', 'Biceps'),
    ('Extension triceps', 'Triceps'),
    ('Rowing barre', 'Dos'),
    ('Leg press', 'Jambes'),
    ('Crunch', 'Abdominaux'),
    ('Tractions', 'Dos')
ON CONFLICT DO NOTHING;
