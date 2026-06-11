// Fix chord positions in LaCuerda songs
// Merges chord-only lines with the lyric lines below them
// so chords are inline at the correct position (proper ChordPro format)
//
// Before: [Am]                                      [G]
//          No encuentro la forma de hallar el destino
//
// After:  [Am]No encuentro la forma de hallar el [G]destino

const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";

// Is this line ONLY chords + whitespace? e.g. "  [Am]      [G]  " or "[A]-7  [C]"
// Handles chord suffixes outside brackets like [A]-7, [B]m7, [E]sus4
function isChordOnlyLine(line) {
  if (!line.includes("[")) return false;
  const stripped = line.replace(/\[[^\]]+\][^\s\[]*/g, "");
  return stripped.trim() === "";
}

// Is this a directive line? e.g. {title: ...}
function isDirective(line) {
  return /^\s*\{/.test(line);
}

// Get chord positions as they would appear without brackets (original column positions)
// Handles suffixes outside brackets: [A]-7 → chord "A-7", [B]m7 → chord "Bm7"
function getChordDisplayPositions(chordLine) {
  const chords = [];
  const regex = /\[([^\]]+)\]([^\s\[]*)/g;
  let m;
  let bracketOffset = 0;

  while ((m = regex.exec(chordLine)) !== null) {
    // In the "display" version (no brackets), this chord starts at:
    const displayCol = m.index - bracketOffset;
    // Include any suffix after ] as part of the chord name
    const chord = m[1] + m[2];
    chords.push({ chord, displayCol });
    bracketOffset += 2; // each pair of [] adds 2 extra chars
  }
  return chords;
}

// Merge chord positions into a lyric line
function mergeChordIntoLyric(chordPositions, lyricLine) {
  // Work right-to-left so insertions don't shift positions
  let result = lyricLine;
  for (let i = chordPositions.length - 1; i >= 0; i--) {
    const { chord, displayCol } = chordPositions[i];
    const pos = Math.min(displayCol, result.length);
    result = result.slice(0, pos) + "[" + chord + "]" + result.slice(pos);
  }
  return result;
}

// Process a full ChordPro content string
function fixChordPositions(content) {
  const lines = content.split("\n");
  const result = [];
  let i = 0;
  let merged = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip directives
    if (isDirective(line)) {
      result.push(line);
      i++;
      continue;
    }

    // Check if this is a chord-only line
    if (isChordOnlyLine(line)) {
      // Look at the next non-empty line
      const nextIdx = i + 1;

      if (nextIdx < lines.length && !isChordOnlyLine(lines[nextIdx]) && !isDirective(lines[nextIdx]) && lines[nextIdx].trim() !== "") {
        // Merge chord line into lyric line
        const chordPositions = getChordDisplayPositions(line);
        const mergedLine = mergeChordIntoLyric(chordPositions, lines[nextIdx]);
        result.push(mergedLine);
        merged++;
        i += 2; // skip both chord line and lyric line
        continue;
      }
      // Chord-only line not followed by lyrics (instrumental, etc.) - keep as-is
    }

    result.push(line);
    i++;
  }

  return { content: result.join("\n"), merged };
}

// Detect if a song has chord-only lines (needs fixing)
function hasSeparateChordLines(content) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (isDirective(lines[i])) continue;
    if (isChordOnlyLine(lines[i])) return true;
  }
  return false;
}

async function fetchAllSongs() {
  const allSongs = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/songs?select=id,title,artist,chordpro_content&status=eq.published&order=id&offset=${offset}&limit=${limit}`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    allSongs.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return allSongs;
}

async function main() {
  const DRY_RUN = process.argv.includes("--dry-run");
  const SHOW_SAMPLES = process.argv.includes("--samples");

  console.log("=== Fix Chord Positions (merge chord lines into lyrics) ===");
  if (DRY_RUN) console.log("*** DRY RUN - no changes will be made ***");
  console.log();

  console.log("Fetching all published songs...");
  const songs = await fetchAllSongs();
  console.log(`Total published: ${songs.length}\n`);

  // Find songs that need fixing
  const needsFix = songs.filter(s => hasSeparateChordLines(s.chordpro_content));
  console.log(`Songs with separate chord lines: ${needsFix.length}\n`);

  if (needsFix.length === 0) {
    console.log("Nothing to fix!");
    return;
  }

  // Show samples if requested
  if (SHOW_SAMPLES) {
    for (let s = 0; s < Math.min(3, needsFix.length); s++) {
      const song = needsFix[s];
      const { content: fixed } = fixChordPositions(song.chordpro_content);
      console.log(`--- BEFORE: "${song.title}" by ${song.artist} ---`);
      console.log(song.chordpro_content.substring(0, 600));
      console.log(`\n--- AFTER ---`);
      console.log(fixed.substring(0, 600));
      console.log("\n\n");
    }

    if (DRY_RUN) return;
  }

  if (DRY_RUN) {
    // Show some stats
    let totalMerged = 0;
    for (const song of needsFix) {
      const { merged } = fixChordPositions(song.chordpro_content);
      totalMerged += merged;
    }
    console.log(`Would merge ${totalMerged} chord lines across ${needsFix.length} songs`);
    return;
  }

  // Apply fixes
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < needsFix.length; i++) {
    const song = needsFix[i];
    const { content: fixed, merged } = fixChordPositions(song.chordpro_content);

    if (fixed === song.chordpro_content) continue; // nothing changed

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/songs?id=eq.${song.id}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ chordpro_content: fixed }),
      }
    );

    if (res.ok) {
      updated++;
    } else {
      errors++;
      const text = await res.text();
      console.error(`  Error: "${song.title}" - ${text.substring(0, 100)}`);
    }

    if ((i + 1) % 200 === 0) {
      console.log(`  [${i + 1}/${needsFix.length}] ${updated} updated, ${errors} errors`);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
