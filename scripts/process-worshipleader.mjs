// Process WorshipLeaderApp SQLite DB - cross-reference with Supabase and upload new songs
import Database from "better-sqlite3";

const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normalize(text) {
  return (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

// Convert OpenLP XML-ish lyrics to ChordPro
function opensongToChordPro(lyrics, title, artist) {
  if (!lyrics) return null;

  // OpenLP lyrics format uses XML-like verse tags
  // ---[Verse:1]---\nlyrics here\n---[Chorus:1]---\nlyrics here
  const lines = lyrics.split("\n");
  let chordpro = `{title: ${title}}\n{artist: ${artist}}\n\n`;

  const sectionMap = {
    "Verse": "verse",
    "Chorus": "chorus",
    "Bridge": "bridge",
    "Pre-Chorus": "verse",
    "Intro": "verse",
    "Outro": "verse",
    "Ending": "verse",
    "Tag": "verse",
    "Other": "verse",
  };

  for (const line of lines) {
    const sectionMatch = line.match(/^---\[([^:\]]+)(?::(\d+))?\]---$/);
    if (sectionMatch) {
      const type = sectionMatch[1];
      const num = sectionMatch[2] || "1";
      const mappedType = sectionMap[type] || "verse";
      const label = type === "Chorus" ? `Coro${num !== "1" ? " " + num : ""}` :
                    type === "Bridge" ? `Puente${num !== "1" ? " " + num : ""}` :
                    type === "Verse" ? `Verso ${num}` :
                    `${type} ${num}`;
      chordpro += `{start_of_${mappedType}: ${label}}\n`;
    } else if (line.trim() === "") {
      // Check if we need to close a section
      chordpro += "\n";
    } else {
      // Convert chord notation if present (OpenLP uses [chord] inline sometimes)
      chordpro += line + "\n";
    }
  }

  return chordpro.trim();
}

async function fetchAllExistingSongs() {
  const all = [];
  let offset = 0;
  while (true) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/songs?select=id,title,artist&order=title.asc&offset=${offset}&limit=1000`, { headers });
    const d = await r.json();
    if (!Array.isArray(d) || d.length === 0) break;
    all.push(...d);
    if (d.length < 1000) break;
    offset += 1000;
  }
  return all;
}

async function main() {
  console.log("=== Process WorshipLeaderApp English DB ===\n");

  // 1. Open SQLite
  const db = new Database("C:/Users/CMastropasqua/Downloads/worshipleader_en.sqlite", { readonly: true });

  // 2. Get all songs with authors
  const wlSongs = db.prepare(`
    SELECT s.id, s.title, s.alternate_title, s.lyrics, s.verse_order,
      GROUP_CONCAT(COALESCE(a.display_name, a.first_name || ' ' || a.last_name), ' | ') as authors
    FROM songs s
    LEFT JOIN authors_songs aso ON s.id = aso.song_id
    LEFT JOIN authors a ON aso.author_id = a.id
    GROUP BY s.id
    ORDER BY s.title
  `).all();

  console.log(`WorshipLeader songs: ${wlSongs.length}\n`);

  // Sample
  console.log("--- Sample songs ---");
  for (const s of wlSongs.slice(0, 5)) {
    console.log(`  "${s.title}" by ${s.authors || "N/A"}`);
    console.log(`    Lyrics (first 100): ${(s.lyrics || "").substring(0, 100).replace(/\n/g, " | ")}`);
  }

  // 3. Fetch existing songs from Supabase
  console.log("\nFetching existing songs from Supabase...");
  const existing = await fetchAllExistingSongs();
  console.log(`  Existing: ${existing.length}\n`);

  // Build lookup: normalized title → songs
  const existingByTitle = new Map();
  for (const s of existing) {
    const nt = normalize(s.title);
    if (!existingByTitle.has(nt)) existingByTitle.set(nt, []);
    existingByTitle.get(nt).push(s);
  }

  // 4. Cross-reference
  let alreadyHave = 0;
  let alreadyHaveNoArtist = 0; // We have it but without artist
  let newSongs = 0;
  let noLyrics = 0;

  const toUpload = [];
  const toUpdateArtist = []; // Songs we have but need artist

  for (const wl of wlSongs) {
    if (!wl.lyrics || wl.lyrics.trim().length < 20) {
      noLyrics++;
      continue;
    }

    const nt = normalize(wl.title);
    const ntAlt = wl.alternate_title ? normalize(wl.alternate_title) : null;

    const matchByTitle = existingByTitle.get(nt);
    const matchByAlt = ntAlt ? existingByTitle.get(ntAlt) : null;
    const match = matchByTitle || matchByAlt;

    if (match) {
      // Check if any match has an artist
      const hasArtist = match.some(m => m.artist && m.artist !== "Unknown" && m.artist !== "Desconocido");
      if (hasArtist) {
        alreadyHave++;
      } else {
        // We have the song but no artist - update it
        alreadyHaveNoArtist++;
        if (wl.authors) {
          toUpdateArtist.push({ id: match[0].id, title: wl.title, artist: wl.authors });
        }
      }
    } else {
      // New song!
      newSongs++;
      const chordpro = opensongToChordPro(wl.lyrics, wl.title, wl.authors || "Unknown");
      if (chordpro) {
        toUpload.push({
          title: wl.title,
          artist: wl.authors || null,
          original_key: "C",
          chordpro_content: chordpro,
          status: "published",
          tags: ["Worship Inglés", "worshipleader"],
        });
      }
    }
  }

  console.log("=== CROSS-REFERENCE RESULTS ===");
  console.log(`  Already have (with artist): ${alreadyHave}`);
  console.log(`  Already have (need artist): ${alreadyHaveNoArtist}`);
  console.log(`  NEW songs to upload: ${newSongs}`);
  console.log(`  No lyrics (skipped): ${noLyrics}\n`);

  // Show some new songs
  console.log("--- Sample NEW songs (first 30) ---");
  for (const s of toUpload.slice(0, 30)) {
    console.log(`  "${s.title}" by ${s.artist || "N/A"}`);
  }
  console.log(`  ... total: ${toUpload.length}\n`);

  // Show artist updates
  if (toUpdateArtist.length > 0) {
    console.log(`--- Songs to update artist (${toUpdateArtist.length}) ---`);
    for (const s of toUpdateArtist.slice(0, 15)) {
      console.log(`  "${s.title}" → ${s.artist}`);
    }
  }

  // 5. Upload new songs
  if (toUpload.length > 0) {
    console.log(`\nUploading ${toUpload.length} new songs...`);
    let uploaded = 0;
    for (let i = 0; i < toUpload.length; i += 50) {
      const batch = toUpload.slice(i, i + 50);
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/songs`, {
          method: "POST",
          headers: { ...headers, Prefer: "return=minimal" },
          body: JSON.stringify(batch),
        });
        if (res.ok) {
          uploaded += batch.length;
        } else {
          console.error(`  Error batch ${i}: ${res.status} ${await res.text()}`);
        }
      } catch (e) {
        console.error(`  Error: ${e.message}`);
      }
      await sleep(500);
      if (uploaded % 200 === 0 && uploaded > 0) console.log(`  ${uploaded}/${toUpload.length}...`);
    }
    console.log(`  Uploaded: ${uploaded}\n`);
  }

  // 6. Update artists for existing songs
  if (toUpdateArtist.length > 0) {
    console.log(`Updating ${toUpdateArtist.length} artists...`);
    let updated = 0;
    for (const s of toUpdateArtist) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/songs?id=eq.${s.id}`, {
          method: "PATCH",
          headers: { ...headers, Prefer: "return=minimal" },
          body: JSON.stringify({ artist: s.artist }),
        });
        if (res.ok) updated++;
      } catch {}
      if (updated % 20 === 0) await sleep(300);
    }
    console.log(`  Updated: ${updated}\n`);
  }

  // Final count
  const finalSongs = await fetchAllExistingSongs();
  console.log(`=== FINAL: ${finalSongs.length} songs in DB ===`);

  db.close();
}

main().catch(console.error);
