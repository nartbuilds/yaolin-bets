-- Create app_settings table for global configuration
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Settings are publicly readable" ON app_settings FOR SELECT USING (true);

-- Only admins can update settings (we'll handle auth in app logic)
CREATE POLICY "Settings can be updated" ON app_settings FOR ALL USING (true);

-- Insert default CNY stage setting
INSERT INTO app_settings (key, value)
VALUES ('cny_stage', 'before_cny')
ON CONFLICT (key) DO NOTHING;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_app_settings_updated_at();
