// Final cleanup: delete trash, fragments, English dupes; categorize Christmas songs
const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normalize(text) {
  return (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function extractLyrics(chordpro) {
  if (!chordpro) return "";
  return chordpro.split("\n").filter((l) => !l.trim().startsWith("{"))
    .map((l) => l.replace(/\[[^\]]*\]/g, "").trim()).filter((l) => l.length > 0).join(" ");
}

function wordSimilarity(a, b) {
  if (!a || !b) return 0;
  const na = normalize(a), nb = normalize(b);
  if (na === nb) return 1;
  const wa = new Set(na.split(/\s+/)), wb = new Set(nb.split(/\s+/));
  const inter = [...wa].filter((w) => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union === 0 ? 0 : inter / union;
}

async function fetchAllSongs() {
  const all = [];
  let offset = 0;
  while (true) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/songs?select=id,title,artist,tags,chordpro_content,original_key&order=created_at.asc&offset=${offset}&limit=1000`, { headers });
    const d = await r.json();
    if (!Array.isArray(d) || d.length === 0) break;
    all.push(...d);
    if (d.length < 1000) break;
    offset += 1000;
  }
  return all;
}

async function updateSong(id, updates, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/songs?id=eq.${id}`, {
        method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify(updates)
      });
      return r.ok;
    } catch { if (i < retries - 1) await sleep(2000 * (i + 1)); else return false; }
  }
}

async function deleteBatch(ids) {
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const idList = batch.map((id) => `"${id}"`).join(",");
    await fetch(`${SUPABASE_URL}/rest/v1/import_items?song_id=in.(${idList})`, {
      method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ song_id: null })
    }).catch(() => {});
    await sleep(200);
  }
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const idList = batch.map((id) => `"${id}"`).join(",");
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/songs?id=in.(${idList})`, {
        method: "DELETE", headers: { ...headers, Prefer: "return=minimal" }
      });
      if (r.ok) deleted += batch.length;
    } catch { /* retry next time */ }
    await sleep(200);
  }
  return deleted;
}

// ====== TRASH PATTERNS ======
const trashPatterns = [
  /ampero/i, /presets.*installation/i, /^programme/i, /^programa del/i,
  /^tag$/i, /^vrurestong$/i, /^ilegible$/i, /^sin titulo$/i, /^unknown song$/i,
  /^unknown worship/i, /^desconocido$/i, /^coro$/i, /^coros mix$/i,
  /^estrofa/i, /^verso /i, /^verse /i, /^puente /i, /^refrain$/i,
  /^final chorus$/i, /^interlude$/i, /^rindo$/i, /^criste$/i,
  /^tribuysong$/i, /^balitestico$/i, /^ballesteste$/i, /^ballestestic$/i,
  /^rojo$/i, /^no song/i, /^alabanza$/i, /^alabanzas$/i,
  /^acordes del cancionero/i, /^estrofa i$/i, /^aguas$/i,
];

// ====== CHRISTMAS SONGS ======
const christmasPatterns = [
  /christmas/i, /navidad/i, /noel/i, /holy night/i, /noche divina/i,
  /jingle bell/i, /aussie jingle/i, /silent night/i, /hark.*herald/i,
  /o come all ye/i, /oh come all ye/i, /away in a manger/i,
  /angels we have heard/i, /born is the king/i, /go tell it on the mountain/i,
  /we wish you a merry/i, /little drummer/i, /burrito sabanero/i,
  /ha nacido el salvador/i, /una estrella anuncio/i, /it.*christmas/i,
  /adeste fideles/i, /king of heaven come/i, /glorious night/i,
  /feliz navidad/i, /carols/i, /dad resucit/i, /oigo los angeles cantando/i,
  /what a glorious night/i,
];

// ====== KNOWN ENGLISH-SPANISH MAPPINGS ======
const knownMappings = {
  "way maker": ["way maker", "camino"],
  "oceans": ["oceans", "oceanos"],
  "what a beautiful name": ["what a beautiful name", "hermoso nombre", "cuan hermoso"],
  "what a wonderful name": ["what a wonderful name", "hermoso nombre", "cuan hermoso", "poderoso su nombre"],
  "cornerstone": ["cornerstone", "mi arca firme", "solid rock"],
  "no longer a slave": ["no longer a slave", "ya no soy esclavo", "ya no soy un esclavo"],
  "goodness of god": ["goodness of god", "bondad de dios", "lo bueno de dios", "tu gracia y tu bondad", "toda mi vida", "tu tan fiel"],
  "amazing grace": ["amazing grace", "sublime gracia", "gracia sublime"],
  "this is amazing grace": ["this is amazing grace", "gracia sublime", "digno es el cordero"],
  "here i am to worship": ["here i am to worship"],
  "forever reign": ["forever reign"],
  "draw me close": ["draw me close", "draw me closer"],
  "come now is the time": ["come now is the time"],
  "above all": ["above all"],
  "at the cross": ["at the cross", "love ran red"],
  "holy spirit": ["holy spirit", "bienvenido santo espiritu", "ven espiritu"],
  "like a rushing wind": ["like a rushing wind", "con tu aliento"],
  "god of miracles": ["god of miracles", "dios de milagros", "milagros"],
  "i believe in you": ["i believe in you", "yo creo en ti", "cristo yo creo"],
  "your promise": ["your promise", "tu promesa", "en ti confiare"],
  "lion and the lamb": ["lion and the lamb", "cordero y leon"],
  "the walls are falling": ["walls are falling", "los muros caeran"],
  "surrounded": ["surrounded", "fight my battles"],
  "forever": ["forever", "holy forever"],
  "tremble": ["tremble", "tiembla"],
  "same god": ["same god"],
  "power of your love": ["power of your love", "poder de tu amor"],
  "our god": ["our god"],
  "speak the name": ["speak the name"],
  "greater": ["greater"],
  "because he lives": ["because he lives", "porque el vive"],
  "praise the lord": ["praise the lord"],
  "you deserve the glory": ["you deserve the glory"],
  "your love never fails": ["your love never fails"],
  "my redeemer lives": ["my redeemer lives"],
  "i surrender": ["i surrender", "a ti me rindo", "me rindo"],
  "i trust in god": ["i trust in god", "confio en dios", "trust in god"],
  "celebrate jesus": ["celebrate jesus", "celebrad a cristo"],
  "freedom reigns": ["freedom reigns"],
  "waiting here for you": ["waiting here for you"],
  "it's your blood": ["it's your blood", "tu sangre"],
};

async function main() {
  console.log("=== FINAL CLEANUP ===\n");
  console.log("1. Fetching all songs...");
  const allSongs = await fetchAllSongs();
  console.log(`   Total: ${allSongs.length}\n`);

  // Build index of all categorized songs (have artist)
  const categorizedByNormTitle = new Map();
  for (const s of allSongs) {
    if (s.artist && s.artist !== "Unknown" && s.artist !== "Desconocido") {
      const nt = normalize(s.title);
      if (!categorizedByNormTitle.has(nt)) categorizedByNormTitle.set(nt, []);
      categorizedByNormTitle.get(nt).push(s);
    }
  }

  // Get uncategorized songs
  const uncategorized = allSongs.filter((s) => {
    const tags = s.tags || [];
    const hasCat = tags.some((t) => !["dropbox", "lacuerda", "importado"].includes(t));
    return (!s.artist || s.artist === "Unknown" || s.artist === "Desconocido") && !hasCat;
  });
  console.log(`   Uncategorized: ${uncategorized.length}\n`);

  const toDelete = [];
  const toChristmas = [];
  const toAssignArtist = []; // { id, artist, category }

  for (const song of uncategorized) {
    const title = song.title;
    const normTitle = normalize(title);

    // 1. TRASH
    if (trashPatterns.some((p) => p.test(title) || p.test(normTitle))) {
      toDelete.push({ id: song.id, title, reason: "basura" });
      continue;
    }

    // 2. CHRISTMAS
    if (christmasPatterns.some((p) => p.test(title))) {
      toChristmas.push(song);
      continue;
    }

    // 3. Check if we have this song already with an artist (exact title match)
    const existing = categorizedByNormTitle.get(normTitle);
    if (existing && existing.length > 0) {
      // We have a categorized version - check lyrics similarity
      const songLyrics = extractLyrics(song.chordpro_content);
      let bestMatch = null;
      let bestSim = 0;
      for (const e of existing) {
        const eLyrics = extractLyrics(e.chordpro_content);
        const sim = wordSimilarity(songLyrics, eLyrics);
        if (sim > bestSim) { bestSim = sim; bestMatch = e; }
      }
      if (bestMatch && bestSim >= 0.15) {
        // Same song exists with artist - delete this uncategorized version
        toDelete.push({ id: song.id, title, reason: `duplicado de "${bestMatch.title}" by ${bestMatch.artist} (${(bestSim * 100).toFixed(0)}%)` });
      } else if (bestMatch) {
        // Different song, same title - assign the artist anyway since it's likely a version
        toAssignArtist.push({ id: song.id, title, artist: bestMatch.artist, tags: bestMatch.tags });
      }
      continue;
    }

    // 4. Check known English-Spanish mappings
    let foundMapping = false;
    for (const [key, variants] of Object.entries(knownMappings)) {
      if (variants.some((v) => normTitle.includes(normalize(v)))) {
        // Search for any categorized song matching this group
        for (const variant of variants) {
          const nv = normalize(variant);
          for (const [catTitle, catSongs] of categorizedByNormTitle) {
            if (catTitle.includes(nv) || nv.includes(catTitle)) {
              const best = catSongs[0];
              toDelete.push({ id: song.id, title, reason: `eng dupe → "${best.title}" by ${best.artist}` });
              foundMapping = true;
              break;
            }
          }
          if (foundMapping) break;
        }
        if (!foundMapping) {
          // No categorized version found - just mark as known artist
          // Try to find any version in the full DB
          for (const s2 of allSongs) {
            if (s2.id === song.id) continue;
            if (s2.artist && s2.artist !== "Unknown") {
              const n2 = normalize(s2.title);
              if (variants.some((v) => n2.includes(normalize(v)))) {
                toDelete.push({ id: song.id, title, reason: `eng dupe → "${s2.title}" by ${s2.artist}` });
                foundMapping = true;
                break;
              }
            }
          }
        }
        break;
      }
    }
    if (foundMapping) continue;

    // 5. Fuzzy match against categorized songs (title words overlap)
    let bestFuzzy = null;
    let bestFuzzySim = 0;
    // Only check if title has 3+ words
    const titleWords = normTitle.split(/\s+/);
    if (titleWords.length >= 3) {
      for (const [catTitle, catSongs] of categorizedByNormTitle) {
        const sim = wordSimilarity(normTitle, catTitle);
        if (sim > bestFuzzySim && sim >= 0.6) {
          bestFuzzySim = sim;
          bestFuzzy = catSongs[0];
        }
      }
    }
    if (bestFuzzy) {
      // Check lyrics too
      const songLyrics = extractLyrics(song.chordpro_content);
      const bestLyrics = extractLyrics(bestFuzzy.chordpro_content);
      const lyricsSim = wordSimilarity(songLyrics, bestLyrics);
      if (lyricsSim >= 0.15) {
        toDelete.push({ id: song.id, title, reason: `fuzzy dupe → "${bestFuzzy.title}" by ${bestFuzzy.artist} (title:${(bestFuzzySim*100).toFixed(0)}% lyrics:${(lyricsSim*100).toFixed(0)}%)` });
        continue;
      }
    }
  }

  // ====== REPORT ======
  console.log("=== PLAN ===");
  console.log(`  To DELETE: ${toDelete.length}`);
  console.log(`  To CHRISTMAS category: ${toChristmas.length}`);
  console.log(`  To assign artist: ${toAssignArtist.length}\n`);

  // Show deletions
  console.log("--- DELETIONS ---");
  const byReason = {};
  for (const d of toDelete) {
    const type = d.reason.split(" ")[0];
    if (!byReason[type]) byReason[type] = [];
    byReason[type].push(d);
  }
  for (const [type, items] of Object.entries(byReason)) {
    console.log(`\n  [${type}] (${items.length}):`);
    for (const d of items.slice(0, 10)) {
      console.log(`    "${d.title}" - ${d.reason}`);
    }
    if (items.length > 10) console.log(`    ... and ${items.length - 10} more`);
  }

  console.log("\n--- CHRISTMAS ---");
  for (const s of toChristmas) console.log(`  "${s.title}"`);

  console.log("\n--- ASSIGN ARTIST ---");
  for (const s of toAssignArtist.slice(0, 15)) console.log(`  "${s.title}" → ${s.artist}`);
  if (toAssignArtist.length > 15) console.log(`  ... and ${toAssignArtist.length - 15} more`);

  // ====== EXECUTE ======

  // Delete trash + duplicates
  if (toDelete.length > 0) {
    console.log(`\n2. Deleting ${toDelete.length} songs...`);
    const deleted = await deleteBatch(toDelete.map((d) => d.id));
    console.log(`   Deleted: ${deleted}`);
  }

  // Categorize Christmas
  if (toChristmas.length > 0) {
    console.log(`\n3. Categorizing ${toChristmas.length} Christmas songs...`);
    let christmasUpdated = 0;
    for (const s of toChristmas) {
      const tags = new Set(s.tags || []);
      tags.add("Navidad");
      const ok = await updateSong(s.id, { tags: [...tags] });
      if (ok) christmasUpdated++;
      if (christmasUpdated % 10 === 0) await sleep(300);
    }
    console.log(`   Updated: ${christmasUpdated}`);
  }

  // Assign artists
  if (toAssignArtist.length > 0) {
    console.log(`\n4. Assigning artists to ${toAssignArtist.length} songs...`);
    let assigned = 0;
    for (const s of toAssignArtist) {
      const existingTags = new Set(
        allSongs.find((x) => x.id === s.id)?.tags || []
      );
      for (const tag of (s.tags || [])) {
        if (tag !== "lacuerda") existingTags.add(tag);
      }
      const ok = await updateSong(s.id, { artist: s.artist, tags: [...existingTags] });
      if (ok) assigned++;
      if (assigned % 20 === 0) await sleep(300);
    }
    console.log(`   Assigned: ${assigned}`);
  }

  // 5. Final dedup pass (same normalized title + artist)
  console.log("\n5. Final dedup pass...");
  const freshSongs = await fetchAllSongs();
  console.log(`   Songs before dedup: ${freshSongs.length}`);
  const groups = new Map();
  for (const s of freshSongs) {
    const k = `${normalize(s.title)}||${normalize(s.artist || "")}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(s);
  }
  const dupsToDelete = [];
  for (const [, group] of groups) {
    if (group.length <= 1) continue;
    group.sort((a, b) => (b.chordpro_content || "").length - (a.chordpro_content || "").length);
    for (let i = 1; i < group.length; i++) dupsToDelete.push(group[i]);
  }
  if (dupsToDelete.length > 0) {
    console.log(`   Duplicates found: ${dupsToDelete.length}`);
    console.log("   Samples:");
    for (const d of dupsToDelete.slice(0, 10)) console.log(`     "${d.title}" by "${d.artist || 'N/A'}"`);
    const deleted = await deleteBatch(dupsToDelete.map((d) => d.id));
    console.log(`   Deleted: ${deleted}`);
  } else {
    console.log("   No duplicates found.");
  }

  // Final stats
  const finalSongs = await fetchAllSongs();
  let withArtist = 0, withCat = 0, uncat = 0;
  for (const s of finalSongs) {
    const tags = s.tags || [];
    const hasCat = tags.some((t) => !["dropbox", "lacuerda", "importado"].includes(t));
    if (s.artist && s.artist !== "Unknown") withArtist++;
    if (hasCat) withCat++;
    if ((!s.artist || s.artist === "Unknown") && !hasCat) uncat++;
  }
  console.log("\n=== FINAL ===");
  console.log(`Total songs: ${finalSongs.length}`);
  console.log(`With artist: ${withArtist}`);
  console.log(`With category: ${withCat}`);
  console.log(`Uncategorized: ${uncat}`);
}

main().catch(console.error);
