-- Oceandex Cloud Sync Schema
-- Run this in Supabase Dashboard → SQL Editor

-- Dive Sessions
CREATE TABLE IF NOT EXISTS dive_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  site_name TEXT NOT NULL,
  date DATE NOT NULL,
  max_depth_m REAL,
  water_temp_c REAL,
  visibility_m REAL,
  current TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sightings
CREATE TABLE IF NOT EXISTS sightings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_id UUID REFERENCES dive_sessions(id) ON DELETE CASCADE NOT NULL,
  species_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON dive_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON dive_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_sightings_user ON sightings(user_id);
CREATE INDEX IF NOT EXISTS idx_sightings_session ON sightings(session_id);
CREATE INDEX IF NOT EXISTS idx_sightings_species ON sightings(species_id);

-- Row Level Security
ALTER TABLE dive_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users manage their own sessions"
  ON dive_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own sightings"
  ON sightings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for sighting photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('sighting-photos', 'sighting-photos', false)
ON CONFLICT DO NOTHING;

-- Storage policy: users can manage their own photos
CREATE POLICY "Users manage their own photos"
  ON storage.objects FOR ALL
  USING (auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
