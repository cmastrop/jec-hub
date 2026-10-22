-- Eventos pedidos el 2026-10-22 (via Michelle, de parte de Raquel):
--   * Aniversario: picnic en Kings Park (sab 24/10) + celebracion (dom 25/10)
--   * Campamento 2027 (ya existia, cargado en junio): se le agrega el link de
--     inscripcion (Google Form, cierra 11/01/2027)
-- Requiere la migracion 20261022000000_event_registration_url.sql.
-- Eventos de toda la iglesia: sin ministry_id.
-- Idempotente: el INSERT guarda por title + event_date; el UPDATE es reejecutable.

INSERT INTO church_events (
  title, description, event_date, end_date, start_time, location,
  event_type, status, recurring, registration_url
)
SELECT
  v.title, v.description, v.event_date::date, v.end_date::date, v.start_time,
  v.location, v.event_type, 'published', false, v.registration_url
FROM (VALUES
  ('Anniversary Picnic Day — Kings Park',
   'Picnic de aniversario en Kings Park. ¡Trae tu comida y a tu familia!',
   '2026-10-24', NULL, '13:00', 'May Drive Parkland, Kings Park WA', 'community', NULL),
  ('Anniversary Celebration',
   'Celebración de aniversario de la iglesia Jesús Es El Camino.',
   '2026-10-25', NULL, '15:00', '73 Nollamara Ave, Nollamara WA 6061', 'special', NULL)
) AS v(title, description, event_date, end_date, start_time, location, event_type, registration_url)
WHERE NOT EXISTS (
  SELECT 1 FROM church_events e
  WHERE e.title = v.title AND e.event_date = v.event_date::date
);

UPDATE church_events
SET registration_url = 'https://forms.gle/ifRKhL3WHLED6jKN9',
    description = 'Campamento de la iglesia del viernes 5 al domingo 7 de febrero de 2027. Confirma tu asistencia y paga tu entrada antes del lunes 11 de enero de 2027 (se puede pagar en cuotas, guarda los recibos).',
    updated_at = now()
WHERE title = 'Campamento 2027' AND event_date = '2027-02-05';
