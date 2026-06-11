// Script to categorize Dropbox songs by matching them against LaCuerda songs
// Matches by normalized title AND lyrics content similarity
// Then assigns artist + category tags from the LaCuerda version

const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

const headersWithCount = {
  ...headers,
  Prefer: "count=exact",
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

// Extract plain lyrics from chordpro content (strip chords and directives)
function extractLyrics(chordpro) {
  if (!chordpro) return "";
  return chordpro
    .split("\n")
    .filter((line) => !line.trim().startsWith("{"))  // Remove directives
    .map((line) => line.replace(/\[[^\]]*\]/g, ""))   // Remove [chords]
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" ");
}

// Calculate similarity ratio between two strings (0 to 1)
function similarity(a, b) {
  if (!a || !b) return 0;
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;

  // Use longest common subsequence ratio
  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length > nb.length ? na : nb;

  // Quick check: if one contains the other
  if (longer.includes(shorter)) return shorter.length / longer.length;

  // Word overlap (Jaccard similarity)
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

async function updateSong(id, updates) {
  const url = `${SUPABASE_URL}/rest/v1/songs?id=eq.${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(updates),
  });
  return res.ok;
}

async function deleteSongBatch(ids) {
  // First clear import_items references
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const idList = batch.map((id) => `"${id}"`).join(",");
    await fetch(`${SUPABASE_URL}/rest/v1/import_items?song_id=in.(${idList})`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ song_id: null }),
    });
  }
  // Then delete
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const idList = batch.map((id) => `"${id}"`).join(",");
    const res = await fetch(`${SUPABASE_URL}/rest/v1/songs?id=in.(${idList})`, {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=minimal" },
    });
    if (res.ok) deleted += batch.length;
    else console.error(`  Error deleting batch: ${res.status}`);
  }
  return deleted;
}

async function main() {
  console.log("=== Categorize Dropbox Songs (by title + lyrics) ===\n");

  // 1. Fetch all songs
  console.log("1. Fetching all songs...");
  const allSongs = await fetchAllSongs();
  console.log(`   Total: ${allSongs.length}\n`);

  // 2. Separate Dropbox vs LaCuerda songs
  const dropboxSongs = [];
  const lacuerdaSongs = [];

  for (const song of allSongs) {
    const tags = song.tags || [];
    if (tags.includes("lacuerda")) {
      lacuerdaSongs.push(song);
    } else if (tags.includes("dropbox") || song.original_file_url) {
      dropboxSongs.push(song);
    }
    // Songs without either tag go uncategorized
  }

  console.log(`   Dropbox songs: ${dropboxSongs.length}`);
  console.log(`   LaCuerda songs: ${lacuerdaSongs.length}\n`);

  // 3. Build LaCuerda index by normalized title
  console.log("2. Building LaCuerda index...");
  const lacuerdaByTitle = new Map();
  for (const song of lacuerdaSongs) {
    const normTitle = normalize(song.title);
    if (!lacuerdaByTitle.has(normTitle)) lacuerdaByTitle.set(normTitle, []);
    lacuerdaByTitle.get(normTitle).push(song);
  }
  console.log(`   Unique LaCuerda titles: ${lacuerdaByTitle.size}\n`);

  // 4. Match Dropbox songs against LaCuerda
  console.log("3. Matching Dropbox songs by title + lyrics...\n");

  const exactMatches = [];    // Same title, similar lyrics
  const titleOnlyMatches = []; // Same title, different lyrics
  const fuzzyMatches = [];    // Similar title
  const noMatch = [];
  const junk = [];

  // Junk patterns
  const junkPatterns = [/^unknown$/i, /^intro$/i, /^bridge$/i, /^outro$/i, /^solo$/i, /^\s*$/];

  for (const dbSong of dropboxSongs) {
    const normTitle = normalize(dbSong.title);

    // Check junk
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
        if (sim > bestSim) {
          bestSim = sim;
          bestMatch = lc;
        }
      }

      if (bestSim >= 0.3) {
        // Title matches + lyrics are similar enough → same song
        exactMatches.push({ dropbox: dbSong, lacuerda: bestMatch, similarity: bestSim });
      } else {
        // Same title but very different lyrics → might be different song
        titleOnlyMatches.push({ dropbox: dbSong, lacuerda: bestMatch, similarity: bestSim });
      }
      continue;
    }

    // Fuzzy title match - check against all LaCuerda titles
    let bestFuzzyMatch = null;
    let bestFuzzySim = 0;

    for (const [lcTitle, lcSongs] of lacuerdaByTitle) {
      const titleSim = similarity(normTitle, lcTitle);
      if (titleSim >= 0.6) {
        // Also compare lyrics with the best candidate
        const dbLyrics = extractLyrics(dbSong.chordpro_content);
        for (const lc of lcSongs) {
          const lcLyrics = extractLyrics(lc.chordpro_content);
          const lyricsSim = similarity(dbLyrics, lcLyrics);
          const combinedSim = titleSim * 0.4 + lyricsSim * 0.6;
          if (combinedSim > bestFuzzySim) {
            bestFuzzySim = combinedSim;
            bestFuzzyMatch = lc;
          }
        }
      }
    }

    if (bestFuzzyMatch && bestFuzzySim >= 0.5) {
      fuzzyMatches.push({ dropbox: dbSong, lacuerda: bestFuzzyMatch, similarity: bestFuzzySim });
    } else {
      noMatch.push(dbSong);
    }
  }

  console.log("=== RESULTS ===");
  console.log(`  Exact matches (title + lyrics): ${exactMatches.length}`);
  console.log(`  Title-only matches (diff lyrics): ${titleOnlyMatches.length}`);
  console.log(`  Fuzzy matches: ${fuzzyMatches.length}`);
  console.log(`  No match: ${noMatch.length}`);
  console.log(`  Junk entries: ${junk.length}\n`);

  // 5. Show some examples
  console.log("--- Sample exact matches ---");
  for (const m of exactMatches.slice(0, 10)) {
    console.log(`  "${m.dropbox.title}" → artist: "${m.lacuerda.artist}", sim: ${(m.similarity * 100).toFixed(0)}%, tags: ${JSON.stringify(m.lacuerda.tags)}`);
  }

  if (titleOnlyMatches.length > 0) {
    console.log("\n--- Title-only matches (different lyrics) ---");
    for (const m of titleOnlyMatches.slice(0, 10)) {
      console.log(`  "${m.dropbox.title}" (sim: ${(m.similarity * 100).toFixed(0)}%) → artist: "${m.lacuerda.artist}"`);
    }
  }

  if (fuzzyMatches.length > 0) {
    console.log("\n--- Sample fuzzy matches ---");
    for (const m of fuzzyMatches.slice(0, 10)) {
      console.log(`  "${m.dropbox.title}" → "${m.lacuerda.title}" by "${m.lacuerda.artist}", sim: ${(m.similarity * 100).toFixed(0)}%`);
    }
  }

  if (noMatch.length > 0) {
    console.log("\n--- Sample unmatched ---");
    for (const s of noMatch.slice(0, 15)) {
      console.log(`  "${s.title}" (artist: "${s.artist || 'N/A'}")`);
    }
  }

  if (junk.length > 0) {
    console.log("\n--- Junk entries to delete ---");
    for (const s of junk) {
      console.log(`  "${s.title}" (id: ${s.id})`);
    }
  }

  // 6. Auto-assign artist + tags for exact matches
  console.log(`\n4. Updating ${exactMatches.length} exact matches with artist + tags...\n`);
  let updated = 0;
  let errors = 0;

  for (const match of exactMatches) {
    const { dropbox, lacuerda } = match;
    const updates = {};

    // Copy artist if Dropbox song has no artist or generic one
    if (!dropbox.artist || dropbox.artist === "Unknown" || dropbox.artist === "Desconocido") {
      updates.artist = lacuerda.artist;
    }

    // Copy category tags (keep existing tags, add new ones)
    const existingTags = new Set(dropbox.tags || []);
    const lcTags = lacuerda.tags || [];
    // Add category tags from LaCuerda (not "lacuerda" itself)
    for (const tag of lcTags) {
      if (tag !== "lacuerda") existingTags.add(tag);
    }
    updates.tags = [...existingTags];

    if (Object.keys(updates).length > 0) {
      const ok = await updateSong(dropbox.id, updates);
      if (ok) {
        updated++;
      } else {
        errors++;
        console.error(`  Error updating "${dropbox.title}" (${dropbox.id})`);
      }
    }

    if (updated % 50 === 0 && updated > 0) {
      console.log(`  Updated ${updated}/${exactMatches.length}...`);
    }
  }

  console.log(`  Done: ${updated} updated, ${errors} errors\n`);

  // 7. Also update title-only matches (same title, assign artist even if lyrics differ)
  if (titleOnlyMatches.length > 0) {
    console.log(`5. Updating ${titleOnlyMatches.length} title-only matches (artist only)...\n`);
    let titleUpdated = 0;
    for (const match of titleOnlyMatches) {
      const { dropbox, lacuerda } = match;
      if (!lacuerda) continue;
      if (!dropbox.artist || dropbox.artist === "Unknown" || dropbox.artist === "Desconocido") {
        const existingTags = new Set(dropbox.tags || []);
        const lcTags = lacuerda.tags || [];
        for (const tag of lcTags) {
          if (tag !== "lacuerda") existingTags.add(tag);
        }
        const ok = await updateSong(dropbox.id, {
          artist: lacuerda.artist,
          tags: [...existingTags],
        });
        if (ok) titleUpdated++;
      }
    }
    console.log(`  Done: ${titleUpdated} updated\n`);
  }

  // 8. Handle fuzzy matches - also assign if similarity is high enough
  if (fuzzyMatches.length > 0) {
    const highConfFuzzy = fuzzyMatches.filter((m) => m.similarity >= 0.65);
    console.log(`6. Updating ${highConfFuzzy.length} high-confidence fuzzy matches...\n`);
    let fuzzyUpdated = 0;
    for (const match of highConfFuzzy) {
      const { dropbox, lacuerda } = match;
      if (!dropbox.artist || dropbox.artist === "Unknown" || dropbox.artist === "Desconocido") {
        const existingTags = new Set(dropbox.tags || []);
        const lcTags = lacuerda.tags || [];
        for (const tag of lcTags) {
          if (tag !== "lacuerda") existingTags.add(tag);
        }
        const ok = await updateSong(dropbox.id, {
          artist: lacuerda.artist,
          tags: [...existingTags],
        });
        if (ok) fuzzyUpdated++;
      }
    }
    console.log(`  Done: ${fuzzyUpdated} updated\n`);
  }

  // 9. Delete junk entries
  if (junk.length > 0) {
    console.log(`7. Deleting ${junk.length} junk entries...`);
    const junkIds = junk.map((s) => s.id);
    const deleted = await deleteSongBatch(junkIds);
    console.log(`  Deleted: ${deleted}\n`);
  }

  // 10. Now handle true duplicates (same title + same artist → keep longest)
  console.log("8. Finding true duplicates (same title + artist)...");
  // Re-fetch to get updated data
  const updatedSongs = await fetchAllSongs();
  const dupGroups = new Map();
  for (const song of updatedSongs) {
    const key = `${normalize(song.title)}||${normalize(song.artist || "")}`;
    if (!dupGroups.has(key)) dupGroups.set(key, []);
    dupGroups.get(key).push(song);
  }

  const dupsToDelete = [];
  for (const [key, group] of dupGroups) {
    if (group.length <= 1) continue;
    // Sort: longest chordpro_content first (keep best version)
    group.sort((a, b) => (b.chordpro_content || "").length - (a.chordpro_content || "").length);
    // Delete all but the first (best)
    for (let i = 1; i < group.length; i++) {
      dupsToDelete.push({ id: group[i].id, title: group[i].title, artist: group[i].artist });
    }
  }

  console.log(`  True duplicates to delete: ${dupsToDelete.length}`);
  if (dupsToDelete.length > 0) {
    console.log("\n  Sample duplicates:");
    for (const d of dupsToDelete.slice(0, 15)) {
      console.log(`    "${d.title}" by "${d.artist || 'N/A'}"`);
    }

    console.log(`\n9. Deleting ${dupsToDelete.length} duplicates...`);
    const dupIds = dupsToDelete.map((d) => d.id);
    const deleted = await deleteSongBatch(dupIds);
    console.log(`  Deleted: ${deleted}\n`);
  }

  // Final count
  const finalSongs = await fetchAllSongs();
  console.log(`\n=== FINAL ===`);
  console.log(`Total songs remaining: ${finalSongs.length}`);

  // Count categorized vs uncategorized
  let categorized = 0;
  let uncategorized = 0;
  for (const s of finalSongs) {
    const tags = s.tags || [];
    const hasCat = tags.some(
      (t) => !["dropbox", "lacuerda"].includes(t)
    );
    if (hasCat || s.artist) categorized++;
    else uncategorized++;
  }
  console.log(`Categorized (have artist or category tag): ${categorized}`);
  console.log(`Uncategorized: ${uncategorized}`);
}

main().catch(console.error);
