// Scrape ALL Christian/Religious artists from LaCuerda.net
// Uses their internal AJAX API for complete song lists

import { writeFileSync, existsSync, readFileSync } from "fs";

const ARTISTS = [
  "abel_zavala", "alabanzas_llamada_final", "alex_campos", "aline_barros",
  "art_aguilera", "averly_morillo", "avivamiento", "barak", "bethel_music",
  "chris_tomlin", "christine_dclario", "coalo_zamorano", "conquistando_fronteras",
  "danilo_montero", "danny_berrios", "ebenezer", "elevation_worship",
  "en_espiritu_y_en_verdad", "funky", "gateway_worship", "generacion_12",
  "hillsong_united", "horeb_worship", "ingrid_rosario", "inspiracion",
  "inspiracion_cristiana", "jesus_adrian_romero", "jesus_worship_center",
  "juan_carlos_alvarado", "julio_melgar", "kairo_worship", "kairos_worship",
  "kari_jobe", "lilly_goodman", "lucas_conslie", "majo_solis", "majo_y_dan",
  "manantial_de_inspiracion", "marcela_gandara", "marco_barrientos",
  "marco_vidal", "marcos_brunet", "marcos_witt", "maverick_city_music",
  "miel_san_marcos", "montesanto", "mus_catolica", "musica_cristiana",
  "new_wine", "planetshakers", "rescate", "rojo", "su_presencia",
  "tercer_cielo", "upperroom", "world_worship", "xtreme_kids",
];

const BASE = "https://acordes.lacuerda.net";
const API = "https://m.lacuerda.net/iapp.php?esweb=1";
const DELAY = 400;
const SAVE_FILE = "C:/Users/CMastropasqua/Downloads/lacuerda_cristiano.json";

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

// Fetch full song list via internal API
async function getSongList(slug) {
  const text = await fetchText(`${API}&b=${slug}`);
  if (!text) return { name: slug, songs: [] };

  // Parse the JS response: var res = { 'title': '...', 'items': [...] }
  const titleMatch = text.match(/'title'\s*:\s*'([^']+)'/);
  const name = titleMatch ? titleMatch[1] : slug.replace(/_/g, " ");

  const songs = [];
  const itemRegex = /\{'url':'([^']+)','txt':'([^']+)'\}/g;
  let m;
  while ((m = itemRegex.exec(text)) !== null) {
    const url = m[1].replace(/\.shtml$/, "");
    const title = m[2]
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"');
    songs.push({ slug: url, title });
  }

  return { name, songs };
}

// Extract best chord version from song page
function parseBestChords(html) {
  const preBlocks = [];
  const preRegex = /<pre>([\s\S]*?)<\/pre>/gi;
  let m;
  while ((m = preRegex.exec(html)) !== null) {
    if (m[1].includes("<A>")) preBlocks.push(m[1]);
  }
  if (preBlocks.length === 0) return null;

  // Prefer letter notation over solfege, and longest version
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

// Convert to ChordPro
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
  console.log("=== LaCuerda.net - Christian Music Scraper ===");
  console.log(`Artists: ${ARTISTS.length}\n`);

  // Load checkpoint if exists
  let allSongs = [];
  let startFrom = 0;
  const checkpointFile = "C:/Users/CMastropasqua/Downloads/lacuerda_checkpoint.json";
  if (existsSync(checkpointFile)) {
    const cp = JSON.parse(readFileSync(checkpointFile, "utf-8"));
    allSongs = cp.songs;
    startFrom = cp.nextArtist;
    console.log(`Resuming from artist #${startFrom}, ${allSongs.length} songs already scraped\n`);
  }

  for (let a = startFrom; a < ARTISTS.length; a++) {
    const slug = ARTISTS[a];
    console.log(`[${a + 1}/${ARTISTS.length}] ${slug}...`);

    try {
      const { name, songs: songList } = await getSongList(slug);
      console.log(`  ${name}: ${songList.length} songs`);

      let ok = 0, fail = 0;
      for (let i = 0; i < songList.length; i++) {
        await sleep(DELAY);
        const html = await fetchText(`${BASE}/${slug}/${songList[i].slug}`);
        if (!html) { fail++; continue; }

        const content = parseBestChords(html);
        if (!content) { fail++; continue; }

        const { chordpro, key } = toChordPro(content, songList[i].title, name);
        allSongs.push({
          title: songList[i].title,
          artist: name,
          key: key || "C",
          chordpro,
          source: `${BASE}/${slug}/${songList[i].slug}`,
        });
        ok++;

        if ((i + 1) % 25 === 0)
          console.log(`    [${i + 1}/${songList.length}] ${ok} OK, ${fail} skipped`);
      }
      console.log(`  → ${ok} scraped, ${fail} skipped\n`);

      // Save checkpoint every artist
      writeFileSync(checkpointFile, JSON.stringify({ nextArtist: a + 1, songs: allSongs }));
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}\n`);
      writeFileSync(checkpointFile, JSON.stringify({ nextArtist: a, songs: allSongs }));
    }
  }

  console.log(`\n=== TOTAL: ${allSongs.length} songs ===\n`);

  // Save final JSON
  writeFileSync(SAVE_FILE, JSON.stringify(allSongs, null, 2), "utf-8");
  console.log(`Saved: ${SAVE_FILE}`);

  // Summary
  const byArtist = {};
  for (const s of allSongs) {
    byArtist[s.artist] = (byArtist[s.artist] || 0) + 1;
  }
  console.log("\nBy artist:");
  Object.entries(byArtist).sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => console.log(`  ${name}: ${count}`));

  // Cleanup checkpoint
  try { writeFileSync(checkpointFile, ""); } catch {}
}

main().catch(console.error);
