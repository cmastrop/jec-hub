// Scrape all Claudio Freidzon songs from LaCuerda and upload to Supabase
const BASE = "https://acordes.lacuerda.net";
const API = "https://m.lacuerda.net/iapp.php?esweb=1";
const SLUG = "claudio_freidzon";
const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function getSongList() {
  const text = await fetchText(`${API}&b=${SLUG}`);
  if (!text) return { name: SLUG, songs: [] };
  const titleMatch = text.match(/'title'\s*:\s*'([^']+)'/);
  const name = titleMatch ? titleMatch[1] : "Claudio Freidzon";
  const songs = [];
  const itemRegex = /\{'url':'([^']+)','txt':'([^']+)'\}/g;
  let m;
  while ((m = itemRegex.exec(text)) !== null) {
    const url = m[1]; // Keep .shtml if present
    const title = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"');
    songs.push({ slug: url, title });
  }
  return { name, songs };
}

function parseBestChords(html) {
  const preBlocks = [];
  const preRegex = /<pre>([\s\S]*?)<\/pre>/gi;
  let m;
  while ((m = preRegex.exec(html)) !== null) {
    if (m[1].includes("<A>")) preBlocks.push(m[1]);
  }
  if (preBlocks.length === 0) return null;
  let best = null;
  for (const block of preBlocks) {
    const hasSolfege = /<A>(DO|RE|MI|FA|SOL|LA|SI)[#b]?[^a-z]/i.test(block);
    if (!hasSolfege && (!best || block.length > best.length)) best = block;
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

function normalize(text) {
  return (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

async function main() {
  console.log("=== Scrape Claudio Freidzon / Iglesia Rey de Reyes ===\n");

  // 1. Get existing songs to avoid duplicates
  console.log("1. Checking existing songs...");
  const existingRes = await fetch(`${SUPABASE_URL}/rest/v1/songs?select=title&order=title.asc&limit=10000`, { headers });
  const existingSongs = await existingRes.json();
  const existingTitles = new Set(existingSongs.map((s) => normalize(s.title)));
  console.log(`   ${existingTitles.size} songs in DB\n`);

  // 2. Get song list from LaCuerda
  console.log("2. Fetching song list from LaCuerda...");
  const { name: artistName, songs: songList } = await getSongList();
  console.log(`   Artist: ${artistName}`);
  console.log(`   Songs found: ${songList.length}\n`);

  // 3. Scrape each song
  console.log("3. Scraping songs...\n");
  let scraped = 0, skipped = 0, dupes = 0, errors = 0;
  const newSongs = [];

  for (let i = 0; i < songList.length; i++) {
    const song = songList[i];
    const normTitle = normalize(song.title);

    // Check if already exists
    if (existingTitles.has(normTitle)) {
      console.log(`  [${i + 1}/${songList.length}] SKIP (exists): ${song.title}`);
      dupes++;
      continue;
    }

    await sleep(400);
    const url = `${BASE}/${SLUG}/${song.slug}`;
    const html = await fetchText(url);
    if (!html) {
      console.log(`  [${i + 1}/${songList.length}] FAIL: ${song.title}`);
      errors++;
      continue;
    }

    const content = parseBestChords(html);
    if (!content) {
      console.log(`  [${i + 1}/${songList.length}] NO CHORDS: ${song.title}`);
      skipped++;
      continue;
    }

    const { chordpro, key } = toChordPro(content, song.title, artistName);
    newSongs.push({
      title: song.title,
      artist: artistName,
      original_key: key || "C",
      chordpro_content: chordpro,
      status: "published",
      tags: ["Adoración Español", "lacuerda"],
    });
    existingTitles.add(normTitle); // Prevent duplicates within same scrape
    scraped++;
    console.log(`  [${i + 1}/${songList.length}] OK: ${song.title} (${key || "?"})`);
  }

  console.log(`\n   Scraped: ${scraped}`);
  console.log(`   Already existed: ${dupes}`);
  console.log(`   Skipped (no chords): ${skipped}`);
  console.log(`   Errors: ${errors}\n`);

  // 4. Upload to Supabase
  if (newSongs.length === 0) {
    console.log("Nothing new to upload!");
    return;
  }

  console.log(`4. Uploading ${newSongs.length} songs to Supabase...`);
  let uploaded = 0;
  for (let i = 0; i < newSongs.length; i += 50) {
    const batch = newSongs.slice(i, i + 50);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/songs`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify(batch),
      });
      if (res.ok) {
        uploaded += batch.length;
        console.log(`   Uploaded ${uploaded}/${newSongs.length}...`);
      } else {
        const text = await res.text();
        console.error(`   Error batch ${i}: ${res.status} ${text}`);
      }
    } catch (e) {
      console.error(`   Error batch ${i}: ${e.message}`);
    }
    await sleep(500);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Uploaded: ${uploaded} new songs by ${artistName}`);
}

main().catch(console.error);
