-- Zoe Zone — fechas del grupo de jóvenes
--
-- Reuniones quincenales 2026: 5 viernes cada 14 días (31/07, 14/08, 28/08, 11/09, 25/09).
-- Encuentro 2027: viernes 05/02 a domingo 07/02 (evento multi-día vía end_date).
-- Horario tomado de `youthSchedule` en src/lib/iglesia/translations.ts (viernes 7:00 PM).
--
-- Idempotente: reejecutar no duplica (guarda por title + event_date).
-- Correr vía Management API:
--   POST https://api.supabase.com/v1/projects/avowxrzsqgetktqrefxa/database/query

INSERT INTO church_events (
  title, description, event_date, start_time, location,
  event_type, status, recurring, ministry_id
)
SELECT
  v.title,
  v.description,
  v.event_date::date,
  v.start_time,
  '73 Nollamara Ave, Nollamara WA 6061',
  'youth',
  'published',
  false,
  (SELECT id FROM ministries WHERE slug = 'jovenes')
FROM (VALUES
  ('Zoe Zone — Grupo de Jóvenes', 'Reunión del ministerio de jóvenes Zoe Zone.', '2026-07-31', '19:00'),
  ('Zoe Zone — Grupo de Jóvenes', 'Reunión del ministerio de jóvenes Zoe Zone.', '2026-08-14', '19:00'),
  ('Zoe Zone — Grupo de Jóvenes', 'Reunión del ministerio de jóvenes Zoe Zone.', '2026-08-28', '19:00'),
  ('Zoe Zone — Grupo de Jóvenes', 'Reunión del ministerio de jóvenes Zoe Zone.', '2026-09-11', '19:00'),
  ('Zoe Zone — Grupo de Jóvenes', 'Reunión del ministerio de jóvenes Zoe Zone.', '2026-09-25', '19:00')
) AS v(title, description, event_date, start_time)
WHERE NOT EXISTS (
  SELECT 1 FROM church_events e
  WHERE e.title = v.title AND e.event_date = v.event_date::date
);

-- Encuentro de 3 días: viernes 05/02/2027 a domingo 07/02/2027.
-- TODO: confirmar nombre real del encuentro y hora de inicio con el liderazgo.
INSERT INTO church_events (
  title, description, event_date, end_date, start_time, location,
  event_type, status, recurring, ministry_id
)
SELECT
  'Zoe Zone — Encuentro de Jóvenes',
  'Encuentro de tres días del ministerio de jóvenes Zoe Zone.',
  '2027-02-05'::date,
  '2027-02-07'::date,
  '19:00',
  '73 Nollamara Ave, Nollamara WA 6061',
  'youth',
  'published',
  false,
  (SELECT id FROM ministries WHERE slug = 'jovenes')
WHERE NOT EXISTS (
  SELECT 1 FROM church_events e
  WHERE e.title = 'Zoe Zone — Encuentro de Jóvenes'
    AND e.event_date = '2027-02-05'::date
);
