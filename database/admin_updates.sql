-- Add locked field to teams table
ALTER TABLE teams ADD COLUMN locked BOOLEAN NOT NULL DEFAULT FALSE;

-- Add admin field to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Create an admin user (you'll need to register first, then update this)
-- Replace 'your_admin_username' with your actual admin username
-- UPDATE users SET is_admin = TRUE WHERE username = 'your_admin_username';