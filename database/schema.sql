-- Users table for basic auth
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  paid_entry BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performers table
CREATE TABLE performers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  score_head INT NOT NULL CHECK (score_head >= 0 AND score_head <= 100),
  score_tail INT NOT NULL CHECK (score_tail >= 0 AND score_tail <= 100),
  score_drum INT NOT NULL CHECK (score_drum >= 0 AND score_drum <= 100),
  score_gong INT NOT NULL CHECK (score_gong >= 0 AND score_gong <= 100),
  score_cymbal INT NOT NULL CHECK (score_cymbal >= 0 AND score_cymbal <= 100)
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  head_id UUID REFERENCES performers(id) ON DELETE CASCADE,
  tail_id UUID REFERENCES performers(id) ON DELETE CASCADE,
  drum_id UUID REFERENCES performers(id) ON DELETE CASCADE,
  gong_id UUID REFERENCES performers(id) ON DELETE CASCADE,
  cymbal_id UUID REFERENCES performers(id) ON DELETE CASCADE,
  total_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure all performer IDs are different
  CONSTRAINT different_performers CHECK (
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
  )
);

-- Index for leaderboard performance
CREATE INDEX idx_teams_leaderboard ON teams (total_score DESC, updated_at DESC);

-- RLS Policies (simplified since we're not using Supabase auth)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE performers ENABLE ROW LEVEL SECURITY;

-- Everyone can read performers
CREATE POLICY "Performers are publicly readable" ON performers FOR SELECT USING (true);

-- Everyone can read teams for leaderboard
CREATE POLICY "Teams are publicly readable" ON teams FOR SELECT USING (true);

-- Users can only modify their own teams (we'll handle auth in app logic)
CREATE POLICY "Users can manage their own teams" ON teams FOR ALL USING (true);

-- Users table policies (we'll handle auth in app logic)
CREATE POLICY "Users are publicly readable" ON users FOR SELECT USING (true);
CREATE POLICY "Users can be created" ON users FOR INSERT WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();