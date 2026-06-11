// Convert all solfege chords (DO, RE, MI...) to letter notation (C, D, E...) in Supabase
// This normalizes the storage format so the notation toggle works correctly

const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";

// Solfege to letter mapping (case-insensitive matching, but preserve case in output)
const SOLFEGE_MAP = {
  "DO": "C", "RE": "D", "MI": "E", "FA": "F", "SOL": "G", "LA": "A", "SI": "B",
  "Do": "C", "Re": "D", "Mi": "E", "Fa": "F", "Sol": "G", "La": "A", "Si": "B",
  "do": "C", "re": "D", "mi": "E", "fa": "F", "sol": "G", "la": "A", "si": "B",
};

// Key conversion
const KEY_SOLFEGE_MAP = {
  "DO": "C", "RE": "D", "MI": "E", "FA": "F", "SOL": "G", "LA": "A", "SI": "B",
  "Do": "C", "Re": "D", "Mi": "E", "Fa": "F", "Sol": "G", "La": "A", "Si": "B",
};

function convertChordProToLetter(content) {
  // Convert chords inside brackets: [SOL] -> [G], [DOm7] -> [Cm7], [SOL/SI] -> [G/B]
  return content.replace(/\[([^\]]+)\]/g, (match, chord) => {
    const converted = convertSingleChord(chord);
    return `[${converted}]`;
  });
}

function convertSingleChord(chord) {
  // Handle bass note: SOL/SI -> G/B
  const slashIdx = chord.indexOf("/");
  if (slashIdx > 0) {
    const main = convertSingleChord(chord.substring(0, slashIdx));
    const bass = convertSingleChord(chord.substring(slashIdx + 1));
    return `${main}/${bass}`;
  }

  // Match solfege root: SOL#m7 -> G#m7
  const solfegeRegex = /^(SOL|DO|RE|MI|FA|LA|SI|Sol|Do|Re|Mi|Fa|La|Si|sol|do|re|mi|fa|la|si)([#b]?)(.*)$/;
  const m = chord.match(solfegeRegex);
  if (!m) return chord;

  const [, root, accidental, quality] = m;
  const letter = SOLFEGE_MAP[root];
  if (!letter) return chord;

  return `${letter}${accidental}${quality}`;
}

function convertKey(key) {
  if (!key) return key;
  const m = key.match(/^(SOL|DO|RE|MI|FA|LA|SI|Sol|Do|Re|Mi|Fa|La|Si)([#b]?)(.*)$/);
  if (!m) return key;
  const letter = KEY_SOLFEGE_MAP[m[1]];
  return letter ? `${letter}${m[2]}${m[3]}` : key;
}

const SOLFEGE_DETECT = /\[(DO|RE|MI|FA|SOL|LA|SI)[#b]?/i;

async function fetchAllSongs() {
  const allSongs = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/songs?select=id,title,artist,original_key,chordpro_content&status=eq.published&order=id&offset=${offset}&limit=${limit}`,
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
  console.log("=== Fix Solfege → Letter Notation ===\n");

  console.log("Fetching all published songs...");
  const songs = await fetchAllSongs();
  console.log(`Total published: ${songs.length}\n`);

  // Find songs with solfege chords
  const solfegeSongs = songs.filter(s => SOLFEGE_DETECT.test(s.chordpro_content));
  console.log(`Songs with solfege chords: ${solfegeSongs.length}\n`);

  if (solfegeSongs.length === 0) {
    console.log("Nothing to fix!");
    return;
  }

  // Convert and update
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < solfegeSongs.length; i++) {
    const song = solfegeSongs[i];
    const newContent = convertChordProToLetter(song.chordpro_content);
    const newKey = convertKey(song.original_key);

    // Only update if something changed
    if (newContent === song.chordpro_content && newKey === song.original_key) continue;

    const body = { chordpro_content: newContent };
    if (newKey !== song.original_key) body.original_key = newKey;

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
        body: JSON.stringify(body),
      }
    );

    if (res.ok) {
      updated++;
    } else {
      errors++;
      const text = await res.text();
      console.error(`  Error: "${song.title}" - ${text.substring(0, 100)}`);
    }

    if ((i + 1) % 100 === 0) {
      console.log(`  [${i + 1}/${solfegeSongs.length}] ${updated} updated, ${errors} errors`);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
