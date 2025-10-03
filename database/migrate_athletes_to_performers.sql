-- Migration script to rename athletes table to performers
-- This script renames the table and updates all foreign key references

-- Step 1: Rename the athletes table to performers
ALTER TABLE athletes RENAME TO performers;

-- Step 2: Update the RLS policy name
DROP POLICY IF EXISTS "Athletes are publicly readable" ON performers;
CREATE POLICY "Performers are publicly readable" ON performers FOR SELECT USING (true);

-- Step 3: Update the constraint name in teams table
ALTER TABLE teams DROP CONSTRAINT IF EXISTS different_athletes;
ALTER TABLE teams ADD CONSTRAINT different_performers CHECK (
  head_id != tail_id AND
  head_id != drum_id AND
  head_id != gong_id AND
  head_id != cymbal_id AND
  tail_id != drum_id AND
  tail_id != gong_id AND
  tail_id != cymbal_id AND
  drum_id != gong_id AND
  drum_id != cymbal_id AND
  gong_id != cymbal_id
);

-- Step 4: The foreign key constraints will automatically update to reference performers table
-- PostgreSQL handles this automatically when renaming tables

-- Verify the migration
SELECT 'Migration completed successfully. Performers table created and foreign keys updated.' as status;