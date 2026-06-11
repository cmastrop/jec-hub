// Script to finish categorization: title-only matches, fuzzy, junk cleanup, and dedup
// Run after categorize-dropbox.mjs already processed 197 exact matches

const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLyrics(chordpro) {
  if (!chordpro) return "";
  return chordpro
    .split("\n")
    .filter((line) => !line.trim().startsWith("{"))
    .map((line) => line.replace(/\[[^\]]*\]/g, ""))
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" ");
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;
  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length > nb.length ? na : nb;
  if (longer.includes(shorter)) return shorter.length / longer.length;
  const wordsA = new Set(na.split(/\s+/));
  const wordsB = new Set(nb.split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

async function fetchAllSongs() {
  const allSongs = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/songs?select=id,title,artist,tags,chordpro_content,status,original_file_url,created_at&order=created_at.asc&offset=${offset}&limit=${limit}`;
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

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function updateSong(id, updates, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/songs?id=eq.${id}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch (e) {
      if (attempt < retries - 1) {
        await sleep(2000 * (attempt + 1));
      } else {
        console.error(`  Failed to update ${id} after ${retries} retries: ${e.message}`);
        return false;
      }
    }
  }
}

async function deleteSongBatch(ids) {
  // Clear import_items references first
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const idList = batch.map((id) => `"${id}"`).join(",");
    await fetch(`${SUPABASE_URL}/rest/v1/import_items?song_id=in.(${idList})`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ song_id: null }),
    });
  }
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const idList = batch.map((id) => `"${id}"`).join(",");
    const res = await fetch(`${SUPABASE_URL}/rest/v1/songs?id=in.(${idList})`, {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=minimal" },
    });
    if (res.ok) deleted += batch.length;
    else console.error(`  Error deleting batch: ${res.status} ${await res.text()}`);
  }
  return deleted;
}

async function main() {
  console.log("=== Categorize Remaining + Cleanup ===\n");

  console.log("1. Fetching all songs...");
  const allSongs = await fetchAllSongs();
  console.log(`   Total: ${allSongs.length}\n`);

  // Separate by tag
  const dropboxSongs = [];
  const lacuerdaSongs = [];
  for (const song of allSongs) {
    const tags = song.tags || [];
    if (tags.includes("lacuerda")) lacuerdaSongs.push(song);
    else if (tags.includes("dropbox") || tags.includes("importado") || song.original_file_url) dropboxSongs.push(song);
  }

  console.log(`   Dropbox/imported: ${dropboxSongs.length}`);
  console.log(`   LaCuerda: ${lacuerdaSongs.length}\n`);

  // Build LaCuerda index
  const lacuerdaByTitle = new Map();
  for (const song of lacuerdaSongs) {
    const normTitle = normalize(song.title);
    if (!lacuerdaByTitle.has(normTitle)) lacuerdaByTitle.set(normTitle, []);
    lacuerdaByTitle.get(normTitle).push(song);
  }

  // Find Dropbox songs still without artist
  const uncategorized = dropboxSongs.filter(
    (s) => !s.artist || s.artist === "Unknown" || s.artist === "Desconocido"
  );
  console.log(`   Still uncategorized: ${uncategorized.length}\n`);

  // Match uncategorized by title
  const junkPatterns = [/^unknown$/i, /^intro$/i, /^bridge$/i, /^outro$/i, /^solo$/i, /^\s*$/, /^c$/i];
  const titleMatches = [];
  const fuzzyMatches = [];
  const noMatch = [];
  const junk = [];

  for (const dbSong of uncategorized) {
    const normTitle = normalize(dbSong.title);

    if (junkPatterns.some((p) => p.test(normTitle)) || normTitle.length < 2) {
      junk.push(dbSong);
      continue;
    }

    // Exact title match
    const candidates = lacuerdaByTitle.get(normTitle);
    if (candidates) {
      const dbLyrics = extractLyrics(dbSong.chordpro_content);
      let bestMatch = null;
      let bestSim = 0;
      for (const lc of candidates) {
        const lcLyrics = extractLyrics(lc.chordpro_content);
        const sim = similarity(dbLyrics, lcLyrics);
        if (sim > bestSim) { bestSim = sim; bestMatch = lc; }
      }
      if (bestMatch) {
        titleMatches.push({ dropbox: dbSong, lacuerda: bestMatch, similarity: bestSim });
      }
      continue;
    }

    // Fuzzy title match
    let bestFuzzyMatch = null;
    let bestFuzzySim = 0;
    for (const [lcTitle, lcSongs] of lacuerdaByTitle) {
      const titleSim = similarity(normTitle, lcTitle);
      if (titleSim >= 0.5) {
        const dbLyrics = extractLyrics(dbSong.chordpro_content);
        for (const lc of lcSongs) {
          const lcLyrics = extractLyrics(lc.chordpro_content);
          const lyricsSim = similarity(dbLyrics, lcLyrics);
          const combinedSim = titleSim * 0.4 + lyricsSim * 0.6;
          if (combinedSim > bestFuzzySim) { bestFuzzySim = combinedSim; bestFuzzyMatch = lc; }
        }
      }
    }
    if (bestFuzzyMatch && bestFuzzySim >= 0.45) {
      fuzzyMatches.push({ dropbox: dbSong, lacuerda: bestFuzzyMatch, similarity: bestFuzzySim });
    } else {
      noMatch.push(dbSong);
    }
  }

  console.log("=== MATCHING RESULTS ===");
  console.log(`  Title matches: ${titleMatches.length}`);
  console.log(`  Fuzzy matches: ${fuzzyMatches.length}`);
  console.log(`  No match: ${noMatch.length}`);
  console.log(`  Junk: ${junk.length}\n`);

  // Show samples
  if (titleMatches.length > 0) {
    console.log("--- Title matches ---");
    for (const m of titleMatches.slice(0, 10)) {
      console.log(`  "${m.dropbox.title}" → "${m.lacuerda.artist}" (lyrics sim: ${(m.similarity * 100).toFixed(0)}%)`);
    }
    console.log();
  }

  if (fuzzyMatches.length > 0) {
    console.log("--- Fuzzy matches ---");
    for (const m of fuzzyMatches.slice(0, 15)) {
      console.log(`  "${m.dropbox.title}" → "${m.lacuerda.title}" by "${m.lacuerda.artist}" (sim: ${(m.similarity * 100).toFixed(0)}%)`);
    }
    console.log();
  }

  if (noMatch.length > 0) {
    console.log("--- Unmatched (first 20) ---");
    for (const s of noMatch.slice(0, 20)) {
      console.log(`  "${s.title}"`);
    }
    console.log();
  }

  // 2. Update title matches
  console.log(`2. Updating ${titleMatches.length} title matches...`);
  let updated = 0;
  let uCount = 0;
  for (const match of titleMatches) {
    const { dropbox, lacuerda } = match;
    if (!lacuerda) continue;
    const existingTags = new Set(dropbox.tags || []);
    for (const tag of (lacuerda.tags || [])) {
      if (tag !== "lacuerda") existingTags.add(tag);
    }
    const ok = await updateSong(dropbox.id, {
      artist: lacuerda.artist,
      tags: [...existingTags],
    });
    if (ok) updated++;
    uCount++;
    if (uCount % 20 === 0) await sleep(500);
    if (uCount % 50 === 0) console.log(`  Progress: ${uCount}/${titleMatches.length}...`);
  }
  console.log(`  Updated: ${updated}\n`);

  // 3. Update high-confidence fuzzy matches
  const highConf = fuzzyMatches.filter((m) => m.similarity >= 0.55);
  console.log(`3. Updating ${highConf.length} high-confidence fuzzy matches...`);
  let fuzzyUpdated = 0;
  for (const match of highConf) {
    const { dropbox, lacuerda } = match;
    if (!lacuerda) continue;
    const existingTags = new Set(dropbox.tags || []);
    for (const tag of (lacuerda.tags || [])) {
      if (tag !== "lacuerda") existingTags.add(tag);
    }
    const ok = await updateSong(dropbox.id, {
      artist: lacuerda.artist,
      tags: [...existingTags],
    });
    if (ok) fuzzyUpdated++;
  }
  console.log(`  Updated: ${fuzzyUpdated}\n`);

  // 4. Delete junk
  if (junk.length > 0) {
    console.log(`4. Deleting ${junk.length} junk entries...`);
    for (const s of junk) console.log(`  - "${s.title}" (${s.id})`);
    const deleted = await deleteSongBatch(junk.map((s) => s.id));
    console.log(`  Deleted: ${deleted}\n`);
  }

  // 5. Deduplicate: same normalized title + same normalized artist → keep longest
  console.log("5. Deduplicating (same title + artist)...");
  const freshSongs = await fetchAllSongs();
  const groups = new Map();
  for (const song of freshSongs) {
    const key = `${normalize(song.title)}||${normalize(song.artist || "")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(song);
  }

  const dupsToDelete = [];
  for (const [, group] of groups) {
    if (group.length <= 1) continue;
    group.sort((a, b) => (b.chordpro_content || "").length - (a.chordpro_content || "").length);
    for (let i = 1; i < group.length; i++) {
      dupsToDelete.push(group[i]);
    }
  }

  console.log(`  Duplicate songs to remove: ${dupsToDelete.length}`);
  if (dupsToDelete.length > 0) {
    console.log("\n  Samples:");
    for (const d of dupsToDelete.slice(0, 15)) {
      console.log(`    "${d.title}" by "${d.artist || 'N/A'}"`);
    }
    const deleted = await deleteSongBatch(dupsToDelete.map((d) => d.id));
    console.log(`\n  Deleted: ${deleted}\n`);
  }

  // Final stats
  const finalSongs = await fetchAllSongs();
  let withArtist = 0, withCategory = 0, uncatFinal = 0;
  for (const s of finalSongs) {
    const tags = s.tags || [];
    const hasCat = tags.some((t) => !["dropbox", "lacuerda", "importado"].includes(t));
    if (s.artist && s.artist !== "Unknown") withArtist++;
    if (hasCat) withCategory++;
    if (!s.artist && !hasCat) uncatFinal++;
  }

  console.log("=== FINAL STATS ===");
  console.log(`Total songs: ${finalSongs.length}`);
  console.log(`With artist: ${withArtist}`);
  console.log(`With category tag: ${withCategory}`);
  console.log(`Fully uncategorized (no artist, no category): ${uncatFinal}`);
}

main().catch(console.error);
