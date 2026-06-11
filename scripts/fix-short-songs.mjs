// Re-scrape short songs using .shtml URLs (which have complete versions)
// The original scraper stripped .shtml, which caused incomplete songs

import { readFileSync, writeFileSync } from "fs";

const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";
const DELAY = 400;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

function parseBestChords(html) {
  const preBlocks = [];
  const preRegex = /<pre>([\s\S]*?)<\/pre>/gi;
  let m;
  while ((m = preRegex.exec(html)) !== null) {
    if (m[1].includes("<A>")) preBlocks.push(m[1]);
  }
  if (preBlocks.length === 0) return null;

  // Prefer letter notation over solfege, pick the longest
  let best = null;
  for (const block of preBlocks) {
    const hasSolfege = /<A>(DO|RE|MI|FA|SOL|LA|SI)[#b]?[^a-z]/i.test(block);
    if (!hasSolfege && (!best || block.length > best.length)) {
      best = block;
    }
  }
  if (!best) best = preBlocks.reduce((a, b) => a.length >= b.length ? a : b);
  return best;
}

function toChordPro(htmlBlock, title, artist) {
  let text = htmlBlock
    .replace(/<A>([^<]*)<\/A>/gi, "[$1]")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\r\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim();

  const firstChord = text.match(/\[([A-G][#b]?)/);
  const key = firstChord ? firstChord[1] : "";

  let cp = `{title: ${title}}\n{artist: ${artist}}\n`;
  if (key) cp += `{key: ${key}}\n`;
  cp += "\n" + text;
  return { chordpro: cp, key };
}

async function main() {
  console.log("=== Fix Short Songs (re-scrape with .shtml) ===\n");

  // Load original scraped data to get source URLs
  const allSongs = JSON.parse(
    readFileSync("C:/Users/CMastropasqua/Downloads/lacuerda_cristiano.json", "utf-8")
  );

  // Find short songs (likely incomplete)
  const shortSongs = allSongs.filter(s => s.chordpro.length < 500);
  console.log(`Total songs: ${allSongs.length}`);
  console.log(`Short songs (<500 chars): ${shortSongs.length}\n`);

  let improved = 0;
  let unchanged = 0;
  let failed = 0;
  const updates = [];

  for (let i = 0; i < shortSongs.length; i++) {
    const song = shortSongs[i];
    // Build .shtml URL from source
    const shtmlUrl = song.source.replace(/\/?$/, ".shtml");

    await sleep(DELAY);
    const html = await fetchText(shtmlUrl);
    if (!html) { failed++; continue; }

    const content = parseBestChords(html);
    if (!content) { failed++; continue; }

    const { chordpro, key } = toChordPro(content, song.title, song.artist);

    if (chordpro.length > song.chordpro.length + 50) {
      // Significantly longer = improved
      updates.push({
        title: song.title,
        artist: song.artist,
        oldLen: song.chordpro.length,
        newLen: chordpro.length,
        chordpro,
        key: key || song.key,
      });
      improved++;
    } else {
      unchanged++;
    }

    if ((i + 1) % 100 === 0) {
      console.log(`  [${i + 1}/${shortSongs.length}] ${improved} improved, ${unchanged} unchanged, ${failed} failed`);
    }
  }

  console.log(`\n=== Scraping done ===`);
  console.log(`Improved: ${improved}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Failed: ${failed}\n`);

  if (updates.length === 0) {
    console.log("Nothing to update!");
    return;
  }

  // Now update in Supabase
  console.log(`Updating ${updates.length} songs in Supabase...\n`);

  let updated = 0;
  let errors = 0;

  for (const upd of updates) {
    // Find the song by title + artist
    const params = new URLSearchParams();
    params.set("title", `eq.${upd.title}`);
    params.set("artist", `eq.${upd.artist}`);
    params.set("select", "id");

    const findRes = await fetch(
      `${SUPABASE_URL}/rest/v1/songs?${params}`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    const found = await findRes.json();

    if (!Array.isArray(found) || found.length === 0) {
      continue;
    }

    // Update all matching songs
    for (const row of found) {
      const patchRes = await fetch(
        `${SUPABASE_URL}/rest/v1/songs?id=eq.${row.id}`,
        {
          method: "PATCH",
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            chordpro_content: upd.chordpro,
            original_key: upd.key,
          }),
        }
      );

      if (patchRes.ok) {
        updated++;
      } else {
        errors++;
        const text = await patchRes.text();
        console.error(`  Error updating "${upd.title}": ${text}`);
      }
    }

    if (updated % 100 === 0 && updated > 0) {
      console.log(`  Updated: ${updated}/${updates.length}`);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Updated in DB: ${updated}`);
  console.log(`Errors: ${errors}`);

  // Also update the local JSON
  let localFixed = 0;
  for (const upd of updates) {
    const idx = allSongs.findIndex(s => s.title === upd.title && s.artist === upd.artist);
    if (idx >= 0) {
      allSongs[idx].chordpro = upd.chordpro;
      allSongs[idx].key = upd.key;
      localFixed++;
    }
  }
  writeFileSync("C:/Users/CMastropasqua/Downloads/lacuerda_cristiano.json", JSON.stringify(allSongs, null, 2), "utf-8");
  console.log(`Local JSON updated: ${localFixed} songs`);
}

main().catch(console.error);
