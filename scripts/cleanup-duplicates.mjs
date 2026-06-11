// Script to delete duplicate songs with the same normalized title + key
// Keeps the one with the longest chordpro_content (most complete version)

const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "count=exact",
};

function normalize(title) {
  return (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchAllSongs() {
  const allSongs = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/songs?select=id,title,original_key,chordpro_content,created_at&order=created_at.asc&offset=${offset}&limit=${limit}`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    allSongs.push(...data);
    console.log(`  Fetched ${allSongs.length} songs...`);
    if (data.length < limit) break;
    offset += limit;
  }
  return allSongs;
}

async function nullifySongRefs(ids) {
  // Set song_id = null in import_items for these songs (in batches)
  let cleared = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const idList = batch.map((id) => `"${id}"`).join(",");
    const url = `${SUPABASE_URL}/rest/v1/import_items?song_id=in.(${idList})`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ song_id: null }),
    });
    cleared += batch.length;
    if (!res.ok && res.status !== 404) {
      const text = await res.text();
      console.error(`  Error clearing refs at ${i}: ${res.status} ${text}`);
    }
    if (i % 500 === 0 && i > 0) console.log(`  Cleared refs for ${i}/${ids.length}...`);
  }
}

async function deleteSongs(ids) {
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const idList = batch.map((id) => `"${id}"`).join(",");
    const url = `${SUPABASE_URL}/rest/v1/songs?id=in.(${idList})`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=minimal" },
    });
    deleted += batch.length;
    if (!res.ok) {
      const text = await res.text();
      console.error(`  Error deleting batch at ${i}: ${res.status} ${text}`);
    }
    if (i % 500 === 0 && i > 0) console.log(`  Deleted ${deleted}/${ids.length}...`);
  }
  return deleted;
}

async function main() {
  console.log("=== Cleanup Duplicates ===\n");

  console.log("1. Fetching all songs...");
  const songs = await fetchAllSongs();
  console.log(`   Total songs: ${songs.length}\n`);

  // Group by normalized title + key
  console.log("2. Grouping by title + key...");
  const groups = new Map();
  for (const song of songs) {
    const key = `${normalize(song.title)}||${(song.original_key || "C").toUpperCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(song);
  }

  const dupGroups = [...groups.values()].filter((g) => g.length > 1);
  console.log(`   Unique title+key groups: ${groups.size}`);
  console.log(`   Groups with duplicates: ${dupGroups.length}\n`);

  // Keep the best one (longest chordpro_content), delete the rest
  console.log("3. Identifying songs to delete...");
  const toDelete = [];
  for (const group of dupGroups) {
    group.sort(
      (a, b) =>
        (b.chordpro_content || "").length - (a.chordpro_content || "").length
    );
    toDelete.push(...group.slice(1).map((s) => s.id));
  }

  console.log(`   Songs to keep: ${songs.length - toDelete.length}`);
  console.log(`   Songs to DELETE: ${toDelete.length}\n`);

  if (toDelete.length === 0) {
    console.log("Nothing to delete!");
    return;
  }

  // Step 1: Clear foreign key references in import_items
  console.log("4. Clearing import_items references...");
  await nullifySongRefs(toDelete);
  console.log("   Done.\n");

  // Step 2: Delete the songs
  console.log("5. Deleting duplicate songs...");
  const deleted = await deleteSongs(toDelete);
  console.log(`\n=== DONE === Deleted ${deleted} duplicate songs.`);
  console.log(`Remaining songs: ~${songs.length - deleted}`);
}

main().catch(console.error);
