-- Link de inscripcion opcional por evento (ej. Google Form del campamento).
-- Idempotente.
ALTER TABLE church_events ADD COLUMN IF NOT EXISTS registration_url text;
