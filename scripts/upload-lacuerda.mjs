// Upload scraped LaCuerda songs to Supabase
// Excludes specifically Catholic songs (María, Sacramento, etc.)
// Assigns category via tags field + artist

import { readFileSync } from "fs";

const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";

const CATHOLIC_FILTER = /mar[ií]a|virgen|sacramento|rosario|eucarist|hostia|misa\b|santo padre|papa\b|ave mar|salve\b|letaní|inmaculad|asunci[oó]n|guadalupe/i;

const BATCH_SIZE = 50;

// Category mapping by artist
const CATEGORY_MAP = {
  "Adoración Español": [
    "Miel San Marcos", "Marco Barrientos", "Marcos Witt", "Marcos Brunet",
    "Generación 12", "Su Presencia", "Montesanto", "Barak",
    "En Espiritu y en Verdad", "New Wine", "Julio Melgar", "Avivamiento",
    "Ebenezer", "Conquistando Fronteras", "Kairo Worship", "Kairos Worship",
    "Horeb Worship", "Jesús Worship Center",
  ],
  "Cantautores": [
    "Jesús Adrián Romero", "Danilo Montero", "Alex Campos", "Lilly Goodman",
    "Marcela Gandara", "Danny Berríos", "Juan Carlos Alvarado", "Coalo Zamorano",
    "Abel Zavala", "Ingrid Rosario", "Lucas Conslie", "Majo Solís", "Majo y Dan",
    "Art Aguilera", "Funky", "Averly Morillo", "Tercer Cielo",
  ],
  "Worship Inglés": [
    "Hillsong United", "Elevation Worship", "Bethel Music", "Chris Tomlin",
    "Kari Jobe", "Maverick City Music", "Planetshakers", "Gateway Worship",
    "Upperroom", "World Worship",
  ],
  "Rock/Pop Cristiano": ["Rojo", "Rescate", "Marcos Vidal"],
  "Alabanza Latina": [
    "Alabanzas Llamada Final", "Manantial de Inspiración", "Inspiración",
    "Inspiración Cristiana", "Aline Barros", "Xtreme Kids",
  ],
};

// Build reverse lookup: artist prefix (12 chars) → category
const artistToCategory = new Map();
for (const [cat, artists] of Object.entries(CATEGORY_MAP)) {
  for (const a of artists) {
    artistToCategory.set(a.substring(0, 12), cat);
  }
}

function getCategory(artistName) {
  // Try prefix match (handles encoding differences)
  const prefix = (artistName || "").substring(0, 12);
  if (artistToCategory.has(prefix)) return artistToCategory.get(prefix);
  // Christine D'Clario special case
  if (artistName && artistName.startsWith("Christine")) return "Cantautores";
  // Generics
  if (artistName === "Música Católica") return "Alabanza General";
  if (artistName === "Música Cristiana") return "Alabanza General";
  return "Alabanza General";
}

function normalize(title) {
  return (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchExistingTitles() {
  const existing = new Set();
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/songs?select=title,original_key&offset=${offset}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    for (const s of data) {
      existing.add(`${normalize(s.title)}||${(s.original_key || "C").toUpperCase()}`);
    }
    offset += limit;
  }
  return existing;
}

async function uploadBatch(songs) {
  const url = `${SUPABASE_URL}/rest/v1/songs`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(songs),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return songs.length;
}

async function main() {
  console.log("=== Upload LaCuerda songs to Supabase ===\n");

  // Load scraped songs
  const allSongs = JSON.parse(
    readFileSync("C:/Users/CMastropasqua/Downloads/lacuerda_cristiano.json", "utf-8")
  );
  console.log(`Loaded: ${allSongs.length} songs from JSON`);

  // Filter out Catholic-specific songs
  const filtered = allSongs.filter((s) => !CATHOLIC_FILTER.test(s.title));
  const excluded = allSongs.length - filtered.length;
  console.log(`Excluded: ${excluded} Catholic-specific songs`);
  console.log(`To upload: ${filtered.length} songs\n`);

  // Fetch existing songs to avoid duplicates
  console.log("Fetching existing songs from Supabase...");
  const existing = await fetchExistingTitles();
  console.log(`Existing songs: ${existing.size}\n`);

  // Deduplicate against existing and assign categories
  const toUpload = [];
  let skippedDup = 0;
  const catCounts = {};

  for (const song of filtered) {
    const key = `${normalize(song.title)}||${(song.key || "C").toUpperCase()}`;
    if (existing.has(key)) {
      skippedDup++;
      continue;
    }
    existing.add(key);

    const category = getCategory(song.artist);
    catCounts[category] = (catCounts[category] || 0) + 1;

    toUpload.push({
      title: song.title,
      artist: song.artist,
      original_key: song.key || "C",
      chordpro_content: song.chordpro,
      source_type: "manual",
      status: "published",
      tags: [category, "lacuerda"],
    });
  }

  console.log(`Skipped (already in DB): ${skippedDup}`);
  console.log(`New songs to insert: ${toUpload.length}`);
  console.log("\nBy category:");
  Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, n]) => console.log(`  ${cat}: ${n}`));
  console.log("");

  if (toUpload.length === 0) {
    console.log("Nothing to upload!");
    return;
  }

  // Upload in batches
  let uploaded = 0;
  let errors = 0;
  for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
    const batch = toUpload.slice(i, i + BATCH_SIZE);
    try {
      await uploadBatch(batch);
      uploaded += batch.length;
      if (uploaded % 500 === 0 || i + BATCH_SIZE >= toUpload.length) {
        console.log(`  Uploaded: ${uploaded}/${toUpload.length}`);
      }
    } catch (err) {
      console.error(`  Error at batch ${i}: ${err.message}`);
      errors++;
      // Try one by one
      for (const song of batch) {
        try {
          await uploadBatch([song]);
          uploaded++;
        } catch (e2) {
          console.error(`    Failed: "${song.title}" - ${e2.message}`);
          errors++;
        }
      }
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total songs in DB: ~${existing.size}`);
}

main().catch(console.error);
