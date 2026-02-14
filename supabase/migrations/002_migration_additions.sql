-- Add unique constraint on dropbox_path for upsert support
ALTER TABLE migrated_files ADD CONSTRAINT migrated_files_dropbox_path_unique
  UNIQUE (dropbox_path);

-- Add status column to songs for draft/published workflow
ALTER TABLE songs ADD COLUMN IF NOT EXISTS status TEXT
  DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
