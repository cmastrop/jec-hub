// Fix WorshipLeader songs: parse XML lyrics into proper ChordPro format
const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseOpenLPXml(xmlLyrics, title, artist) {
  if (!xmlLyrics) return null;

  // Extract verses from CDATA blocks
  const verses = [];
  const verseRegex = /<verse\s+label="([^"]*)"(?:\s+type="([^"]*)")?[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/verse>/gi;
  let m;
  while ((m = verseRegex.exec(xmlLyrics)) !== null) {
    const label = m[1];
    const type = m[2] || "v";
    const text = m[3].trim();
    if (text.length > 0) {
      verses.push({ label, type, text });
    }
  }

  if (verses.length === 0) return null;

  // Build ChordPro
  let cp = `{title: ${title}}\n{artist: ${artist || "Unknown"}}\n\n`;

  const typeLabels = {
    "v": "Verso",
    "c": "Coro",
    "b": "Puente",
    "p": "Pre-Coro",
    "e": "Final",
    "o": "Otro",
    "i": "Intro",
  };

  for (const verse of verses) {
    const typeLabel = typeLabels[verse.type] || "Verso";
    const sectionLabel = verse.type === "c" ? `${typeLabel}` :
                         `${typeLabel} ${verse.label}`;

    const sectionType = verse.type === "c" ? "chorus" :
                        verse.type === "b" ? "bridge" : "verse";

    cp += `{start_of_${sectionType}: ${sectionLabel}}\n`;

    // Split text into lines - OpenLP sometimes has all in one block
    const lines = verse.text.split(/\n/);
    for (const line of lines) {
      cp += line + "\n";
    }

    cp += `{end_of_${sectionType}}\n\n`;
  }

  return cp.trim();
}

async function main() {
  console.log("=== Fix WorshipLeader Songs ===\n");

  // Fetch all worshipleader songs
  console.log("1. Fetching worshipleader songs...");
  const allSongs = [];
  let offset = 0;
  while (true) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/songs?select=id,title,artist,chordpro_content&tags=cs.{worshipleader}&order=title.asc&offset=${offset}&limit=1000`, { headers });
    const d = await r.json();
    if (!Array.isArray(d) || d.length === 0) break;
    allSongs.push(...d);
    if (d.length < 1000) break;
    offset += 1000;
  }
  console.log(`   Found: ${allSongs.length}\n`);

  // Process each one
  let fixed = 0, empty = 0, errors = 0, alreadyOk = 0;
  const toDelete = []; // Songs with no actual content

  for (const song of allSongs) {
    const content = song.chordpro_content || "";

    // Check if it has XML
    if (!content.includes("<?xml") && !content.includes("<verse")) {
      alreadyOk++;
      continue;
    }

    const parsed = parseOpenLPXml(content, song.title, song.artist);
    if (!parsed || parsed.length < 50) {
      // Empty or too short - mark for deletion
      toDelete.push({ id: song.id, title: song.title });
      empty++;
      continue;
    }

    // Update in Supabase
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/songs?id=eq.${song.id}`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({ chordpro_content: parsed }),
      });
      if (res.ok) fixed++;
      else errors++;
    } catch {
      errors++;
    }

    if (fixed % 100 === 0 && fixed > 0) {
      console.log(`   Fixed: ${fixed}...`);
      await sleep(300);
    }
  }

  console.log(`\n   Fixed: ${fixed}`);
  console.log(`   Empty (to delete): ${empty}`);
  console.log(`   Already OK: ${alreadyOk}`);
  console.log(`   Errors: ${errors}\n`);

  // Delete empty songs
  if (toDelete.length > 0) {
    console.log(`2. Deleting ${toDelete.length} empty songs...`);
    for (const s of toDelete.slice(0, 10)) console.log(`   - "${s.title}"`);
    if (toDelete.length > 10) console.log(`   ... and ${toDelete.length - 10} more`);

    for (let i = 0; i < toDelete.length; i += 100) {
      const batch = toDelete.slice(i, i + 100);
      const idList = batch.map((s) => `"${s.id}"`).join(",");
      await fetch(`${SUPABASE_URL}/rest/v1/import_items?song_id=in.(${idList})`, {
        method: "PATCH", headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({ song_id: null })
      }).catch(() => {});
      await fetch(`${SUPABASE_URL}/rest/v1/songs?id=in.(${idList})`, {
        method: "DELETE", headers: { ...headers, Prefer: "return=minimal" }
      }).catch(() => {});
      await sleep(300);
    }
    console.log(`   Deleted: ${toDelete.length}`);
  }

  // Show sample of fixed content
  console.log("\n3. Sample fixed song:");
  const sample = await fetch(`${SUPABASE_URL}/rest/v1/songs?select=title,chordpro_content&tags=cs.{worshipleader}&chordpro_content=not.like.*xml*&limit=1&offset=50`, { headers });
  const sampleData = await sample.json();
  if (sampleData.length > 0) {
    console.log(`   "${sampleData[0].title}":`);
    console.log(sampleData[0].chordpro_content.substring(0, 400));
  }

  // Final count
  const finalR = await fetch(`${SUPABASE_URL}/rest/v1/songs?select=id&limit=1`, {
    headers: { ...headers, Prefer: "count=exact" }
  });
  console.log(`\n=== Total songs in DB: ${finalR.headers.get("content-range")} ===`);
}

main().catch(console.error);
