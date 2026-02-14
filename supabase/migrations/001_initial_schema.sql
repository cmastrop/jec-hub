-- JEC_HUB Database Schema
-- Jesús Es El Camino - Worship Music Management

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  avatar_url TEXT,
  notation_preference TEXT NOT NULL DEFAULT 'letter' CHECK (notation_preference IN ('letter', 'solfege')),
  font_size_preference INTEGER NOT NULL DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TEAM MEMBERS (musicians, singers, techs)
-- ============================================
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  primary_role TEXT NOT NULL DEFAULT 'musico' CHECK (primary_role IN ('musico', 'cantante', 'ambos', 'tecnico')),
  instruments TEXT[] DEFAULT '{}',
  vocal_role TEXT CHECK (vocal_role IN ('lider', 'corista', 'soprano', 'alto', 'tenor', 'bajo', NULL)),
  skill_level TEXT DEFAULT 'intermedio' CHECK (skill_level IN ('principiante', 'intermedio', 'avanzado')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SONGS
-- ============================================
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT,
  original_key TEXT NOT NULL DEFAULT 'C',
  tempo INTEGER,
  time_signature TEXT DEFAULT '4/4',
  chordpro_content TEXT NOT NULL,
  language TEXT DEFAULT 'es',
  tags TEXT[] DEFAULT '{}',
  ccli_number TEXT,
  notes TEXT,
  source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'import_image', 'import_pdf', 'import_dropbox')),
  original_file_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_songs_title ON songs USING gin(to_tsvector('spanish', title));
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_songs_tags ON songs USING gin(tags);
CREATE INDEX idx_songs_original_key ON songs(original_key);

-- ============================================
-- SONG ATTACHMENTS
-- ============================================
CREATE TABLE song_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('audio', 'video', 'pdf', 'image', 'other')),
  label TEXT,
  url TEXT NOT NULL,
  is_external BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_attachments_song ON song_attachments(song_id);

-- ============================================
-- SETLISTS (service programs)
-- ============================================
CREATE TABLE setlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'domingo'
    CHECK (service_type IN ('domingo', 'miercoles', 'jovenes', 'oracion', 'especial', 'otro')),
  service_date DATE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_setlists_date ON setlists(service_date DESC);
CREATE INDEX idx_setlists_type ON setlists(service_type);

-- ============================================
-- SETLIST SONGS (songs in each program)
-- ============================================
CREATE TABLE setlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setlist_id UUID NOT NULL REFERENCES setlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL,
  transpose_key TEXT,
  capo INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_setlist_songs_setlist ON setlist_songs(setlist_id);
CREATE UNIQUE INDEX idx_setlist_songs_position ON setlist_songs(setlist_id, position);

-- ============================================
-- SERVICE ROSTER (team assignments per service)
-- ============================================
CREATE TABLE service_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setlist_id UUID NOT NULL REFERENCES setlists(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  role_in_service TEXT NOT NULL CHECK (role_in_service IN ('lider_alabanza', 'musico', 'corista', 'sonido', 'proyector', 'otro')),
  instrument TEXT,
  notes TEXT,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_roster_setlist ON service_roster(setlist_id);
CREATE INDEX idx_roster_member ON service_roster(member_id);

-- ============================================
-- MEMBER AVAILABILITY
-- ============================================
CREATE TABLE member_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  unavailable_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_availability_member ON member_availability(member_id);
CREATE INDEX idx_availability_date ON member_availability(unavailable_date);

-- ============================================
-- IMPORT JOBS
-- ============================================
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'paused')),
  source TEXT NOT NULL CHECK (source IN ('dropbox', 'upload')),
  total_files INTEGER DEFAULT 0,
  processed_files INTEGER DEFAULT 0,
  failed_files INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- IMPORT ITEMS (individual files in a job)
-- ============================================
CREATE TABLE import_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  file_type TEXT,
  storage_path TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped', 'review')),
  gemini_raw_response TEXT,
  extracted_chordpro TEXT,
  song_id UUID REFERENCES songs(id),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_import_items_job ON import_items(job_id);
CREATE INDEX idx_import_items_status ON import_items(status);

-- ============================================
-- MIGRATED FILES (all files from Dropbox)
-- ============================================
CREATE TABLE migrated_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dropbox_path TEXT NOT NULL,
  storage_path TEXT,
  file_type TEXT,
  file_size BIGINT DEFAULT 0,
  dropbox_folder TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'downloading', 'downloaded', 'processed', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_migrated_status ON migrated_files(status);
CREATE INDEX idx_migrated_folder ON migrated_files(dropbox_folder);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- Songs
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Songs viewable by authenticated" ON songs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Songs insertable by admins" ON songs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Songs updatable by admins" ON songs
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Songs deletable by admins" ON songs
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Song Attachments
ALTER TABLE song_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attachments viewable by authenticated" ON song_attachments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Attachments manageable by admins" ON song_attachments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Setlists
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Setlists viewable by authenticated" ON setlists
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Setlists insertable by authenticated" ON setlists
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Setlists updatable by creator or admin" ON setlists
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Setlists deletable by creator or admin" ON setlists
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Setlist Songs
ALTER TABLE setlist_songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Setlist songs viewable by authenticated" ON setlist_songs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Setlist songs manageable by authenticated" ON setlist_songs
  FOR ALL TO authenticated USING (true);

-- Team Members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members viewable by authenticated" ON team_members
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members manageable by admins" ON team_members
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Service Roster
ALTER TABLE service_roster ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roster viewable by authenticated" ON service_roster
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Roster manageable by admins" ON service_roster
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Member Availability
ALTER TABLE member_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Availability viewable by authenticated" ON member_availability
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Availability manageable by member or admin" ON member_availability
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM team_members WHERE id = member_id AND profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Import Jobs
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Import jobs viewable by admins" ON import_jobs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Import Items
ALTER TABLE import_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Import items viewable by admins" ON import_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Migrated Files
ALTER TABLE migrated_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Migrated files viewable by admins" ON migrated_files
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
