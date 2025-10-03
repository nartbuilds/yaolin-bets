-- Add paid_entry column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS paid_entry BOOLEAN DEFAULT FALSE;