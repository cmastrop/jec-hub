-- ============================================================
-- FASE 3a: CMS Foundation — Ministries, Blocks, Media, Sermons
-- Migracion idempotente (segura de re-ejecutar)
-- ============================================================

-- ============================================
-- 1. MINISTRIES — registro de los 5 ministerios
-- ============================================
CREATE TABLE IF NOT EXISTS ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  leader_name TEXT,
  leader_user_id UUID REFERENCES auth.users(id),
  image_url TEXT,
  description_en TEXT,
  description_es TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. MINISTRY_MEMBERS — usuarios vinculados a ministerios
-- ============================================
CREATE TABLE IF NOT EXISTS ministry_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'miembro' CHECK (role IN ('lider', 'colaborador', 'miembro')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (ministry_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ministry_members_user ON ministry_members(user_id);

-- ============================================
-- 3. PAGE_BLOCKS — bloques de contenido editables por pagina
-- ============================================
CREATE TABLE IF NOT EXISTS page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  ministry_id UUID REFERENCES ministries(id) ON DELETE SET NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('hero', 'text', 'image', 'gallery', 'verse', 'cta', 'video', 'features', 'leader')),
  position INTEGER NOT NULL DEFAULT 0,
  content_en JSONB NOT NULL DEFAULT '{}',
  content_es JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_blocks_page_position ON page_blocks(page_slug, position);

-- ============================================
-- 4. PAGE_MEDIA — imagenes subidas para el CMS
-- ============================================
CREATE TABLE IF NOT EXISTS page_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL UNIQUE,
  alt_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  ministry_id UUID REFERENCES ministries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. SERMONS — sermones con YouTube/Spotify + blog
-- ============================================
CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  speaker TEXT,
  sermon_date DATE,
  youtube_id TEXT,
  spotify_id TEXT,
  series TEXT,
  duration TEXT,
  image_url TEXT,
  blog_content TEXT,
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. PODCASTS — episodios de Spotify
-- ============================================
CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  spotify_episode_id TEXT,
  description TEXT,
  published_date DATE,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 7. PROFILES — expandir roles a 4 niveles
--    ('pastor', 'admin', 'lider_ministerio', 'member')
--    Encuentra el CHECK constraint de role dinamicamente en pg_constraint
-- ============================================
DO $$
DECLARE
  role_constraint TEXT;
BEGIN
  SELECT con.conname INTO role_constraint
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE rel.relname = 'profiles'
    AND nsp.nspname = 'public'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%role%'
  LIMIT 1;

  IF role_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', role_constraint);
  END IF;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('pastor', 'admin', 'lider_ministerio', 'member'));
END $$;

-- ============================================
-- 8. CHURCH_EVENTS — vincular eventos a ministerios
-- ============================================
ALTER TABLE church_events ADD COLUMN IF NOT EXISTS ministry_id UUID REFERENCES ministries(id);

-- ============================================
-- 9. ROW LEVEL SECURITY
--    El backend usa el admin client (service role) que bypasea RLS.
--    Solo se exponen SELECT publicos para contenido published.
-- ============================================
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- SELECT publico solo para contenido publicado
DROP POLICY IF EXISTS "Page blocks viewable when published" ON page_blocks;
CREATE POLICY "Page blocks viewable when published" ON page_blocks
  FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Sermons viewable when published" ON sermons;
CREATE POLICY "Sermons viewable when published" ON sermons
  FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Podcasts viewable when published" ON podcasts;
CREATE POLICY "Podcasts viewable when published" ON podcasts
  FOR SELECT TO anon, authenticated USING (status = 'published');

-- ministries, ministry_members y page_media: sin politicas permisivas.
-- Acceso solo via service role (admin client), igual que dropbox_tokens.

-- ============================================
-- 10. SEED — los 5 ministerios
-- ============================================
INSERT INTO ministries (slug, name_en, name_es, leader_name) VALUES
  ('hombres',   'Men''s Ministry',   'Ministerio de Hombres', 'Morris'),
  ('mujeres',   'Women''s Ministry', 'Ministerio de Mujeres', 'Daisy'),
  ('jovenes',   'Zoe Zone Youth',    'Zoe Zone Jóvenes',      'Raquel'),
  ('ninos',     'Sunday School',     'Escuela Dominical',     'Clara'),
  ('adoracion', 'Worship Team',      'Equipo de Adoración',   'Ronal')
ON CONFLICT (slug) DO NOTHING;
