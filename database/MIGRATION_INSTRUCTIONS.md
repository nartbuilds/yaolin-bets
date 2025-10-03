# Database Migration: Athletes → Performers

## Instructions for Supabase Dashboard

Since we cannot run DDL commands through the Supabase API, please run the following SQL commands manually in the Supabase SQL Editor:

### Step 1: Rename the table
```sql
ALTER TABLE athletes RENAME TO performers;
```

### Step 2: Update RLS policies
```sql
DROP POLICY IF EXISTS "Athletes are publicly readable" ON performers;
CREATE POLICY "Performers are publicly readable" ON performers FOR SELECT USING (true);
```

### Step 3: Update table constraints
```sql
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
```

### Step 4: Verify the migration
```sql
-- Check that the performers table exists and has data
SELECT COUNT(*) as performer_count FROM performers;

-- Check that the teams table still references performers correctly
SELECT t.id, t.total_score, p.name as head_name
FROM teams t
JOIN performers p ON t.head_id = p.id
LIMIT 1;
```

## Alternative: Complete Database Reset (if migration fails)

If the above migration doesn't work or causes issues, you can reset the entire database:

1. **Delete all existing tables** in Supabase
2. **Run the new schema** (`database/schema.sql`)
3. **Run the seed data** (`database/seed.sql`)

## Post-Migration Verification

After running the migration, verify that:

1. ✅ The `performers` table exists with all data
2. ✅ The `athletes` table no longer exists
3. ✅ All team records still link to performers correctly
4. ✅ The application loads without database errors

## Important Notes

- **The foreign key constraints will automatically update** when the table is renamed
- **All existing team data will be preserved**
- **The application is already updated** to use the `performers` table name
- **Run during low usage** to minimize disruption