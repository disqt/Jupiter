-- Add email column to users table
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Create unique index on email (only for non-null values initially)
CREATE UNIQUE INDEX users_email_unique ON users (email) WHERE email IS NOT NULL;
