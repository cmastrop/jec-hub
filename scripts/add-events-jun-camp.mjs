// Inserta eventos en church_events leyendo credenciales de .env.local
// - Viernes 5 jun 2026: youth group (movie night)
// - Viernes 19 jun 2026: youth group (worship night)
// - Campamento 5-7 feb 2027 (un solo evento)
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m")) || [])[1]?.trim().replace(/^["']|["']$/g, "");

const SUPABASE_URL = get("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_ROLE_KEY = get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Faltan credenciales en .env.local");

const YOUTH_ADDR = "50 Frape Ave, Yokine WA 6060";

const events = [
  {
    title: "Grupo de Jóvenes — Movie Night",
    description: "Noche de película con el grupo de jóvenes.",
    event_date: "2026-06-05",
    location: YOUTH_ADDR,
    event_type: "youth",
    status: "published",
  },
  {
    title: "Grupo de Jóvenes — Worship Night",
    description: "Noche de adoración con el grupo de jóvenes.",
    event_date: "2026-06-19",
    location: YOUTH_ADDR,
    event_type: "youth",
    status: "published",
  },
  {
    title: "Campamento 2027",
    description: "Campamento de la iglesia del viernes 5 al domingo 7 de febrero de 2027.",
    event_date: "2027-02-05",
    location: null,
    event_type: "special",
    status: "published",
  },
];

for (const ev of events) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/church_events`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...ev,
      recurring: false,
      approved_by: null,
    }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`❌ ${ev.title} (${ev.event_date}): ${res.status} ${body}`);
  } else {
    console.log(`✅ ${ev.title} — ${ev.event_date} [${ev.status}]`);
  }
}
