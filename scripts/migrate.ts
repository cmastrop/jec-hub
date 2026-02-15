/**
 * JEC HUB - Dropbox to Supabase Migration Script (v3 - Claude API)
 * Uses Claude API for vision instead of Gemini (much better quality, no harsh rate limits)
 * Uses direct HTTP for Dropbox downloads (SDK .buffer() broken with native fetch)
 */

import { Dropbox } from "dropbox";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

// ---- CONFIG ----
const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN || "";
const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

if (!DROPBOX_TOKEN) {
  console.error("ERROR: Set DROPBOX_TOKEN env variable");
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error("ERROR: Set ANTHROPIC_API_KEY env variable");
  process.exit(1);
}

// ---- CLIENTS ----
const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN, fetch });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ---- HELPERS ----
function getFileType(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    mp4: "video/mp4",
    wav: "audio/wav",
  };
  return map[ext || ""] || null;
}

function isImage(mime: string | null): boolean {
  return !!mime && (mime.startsWith("image/") || mime === "application/pdf");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Escape non-ASCII characters for HTTP headers (Dropbox requires this)
 */
function escapeNonAscii(str: string): string {
  return str.replace(/[^\x20-\x7E]/g, (ch) => {
    const code = ch.charCodeAt(0);
    if (code <= 0xffff) {
      return `\\u${code.toString(16).padStart(4, "0")}`;
    }
    const hi = Math.floor((code - 0x10000) / 0x400) + 0xd800;
    const lo = ((code - 0x10000) % 0x400) + 0xdc00;
    return `\\u${hi.toString(16)}\\u${lo.toString(16)}`;
  });
}

/**
 * Download file from Dropbox using direct HTTP API
 */
async function downloadFromDropbox(path: string): Promise<Buffer> {
  const apiArg = escapeNonAscii(JSON.stringify({ path }));
  const response = await fetch(
    "https://content.dropboxapi.com/2/files/download",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DROPBOX_TOKEN}`,
        "Dropbox-API-Arg": apiArg,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Dropbox download failed: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

const CHORD_PROMPT = `You are an expert at reading chord charts and sheet music.
Analyze this image and extract the song in ChordPro format.

Rules:
- Extract the title, artist (if visible), and key
- Use {title:}, {artist:}, {key:}, {tempo:} directives
- Wrap sections: {start_of_verse: Verso 1}...{end_of_verse}, {start_of_chorus: Coro}...{end_of_chorus}, {start_of_bridge: Puente}...{end_of_bridge}
- For intros/outros/instrumentals use: {start_of_tab: Intro}...{end_of_tab}
- Place chords in [brackets] directly before the syllable they belong to
- Keep the original language (Spanish or English)
- If chords use solfege (Do, Re, Mi, Fa, Sol, La, Si), convert to letter notation (C, D, E, F, G, A, B)
- If you see "Do#" that is C#, "Sib" is Bb, "Mib" is Eb, etc.
- Output ONLY the ChordPro text, no explanations or markdown fences
- If you cannot read the image or it's not a chord chart, output exactly: {title: Unknown}`;

// ---- RATE LIMITER (Claude API: ~50 RPM for Sonnet on standard tier) ----
let requestTimestamps: number[] = [];
const MAX_RPM = 30;

async function waitForClaudeSlot() {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter((t) => now - t < 60000);
  if (requestTimestamps.length >= MAX_RPM) {
    const waitMs = 60000 - (now - requestTimestamps[0]) + 1000;
    console.log(
      `\n   (rate limit, esperando ${Math.round(waitMs / 1000)}s)`
    );
    await sleep(waitMs);
  }
  requestTimestamps.push(Date.now());
}

/** Call Claude API with vision, with retry on rate limit errors */
async function callClaudeWithRetry(
  mime: string,
  base64Data: string,
  maxRetries = 3
): Promise<string> {
  // Claude vision supports: image/jpeg, image/png, image/gif, image/webp
  // For PDFs, Claude accepts application/pdf as document type
  const isPdf = mime === "application/pdf";

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await waitForClaudeSlot();

      const content: Anthropic.MessageCreateParams["messages"][0]["content"] =
        isPdf
          ? [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64Data,
                },
              },
              { type: "text", text: CHORD_PROMPT },
            ]
          : [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mime as
                    | "image/jpeg"
                    | "image/png"
                    | "image/gif"
                    | "image/webp",
                  data: base64Data,
                },
              },
              { type: "text", text: CHORD_PROMPT },
            ];

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        messages: [{ role: "user", content }],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";
      return text
        .replace(/```chordpro\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        (msg.includes("429") || msg.includes("rate")) &&
        attempt < maxRetries - 1
      ) {
        const backoff = (attempt + 1) * 15000;
        console.log(
          `\n   (429 retry ${attempt + 1}, esperando ${backoff / 1000}s)`
        );
        await sleep(backoff);
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

// ---- MAIN ----
async function main() {
  console.log("JEC HUB - Migracion de Dropbox v3 (Claude API)\n");

  // Step 1: List all Dropbox files
  console.log("Listando archivos de Dropbox...");
  const allFiles: Array<{ path: string; name: string; size: number }> = [];

  let result = await dbx.filesListFolder({ path: "", recursive: true });
  for (const entry of result.result.entries) {
    if (entry[".tag"] === "file") {
      allFiles.push({
        path: entry.path_lower || entry.path_display || "",
        name: entry.name,
        size: (entry as unknown as { size: number }).size || 0,
      });
    }
  }
  while (result.result.has_more) {
    result = await dbx.filesListFolderContinue({
      cursor: result.result.cursor,
    });
    for (const entry of result.result.entries) {
      if (entry[".tag"] === "file") {
        allFiles.push({
          path: entry.path_lower || entry.path_display || "",
          name: entry.name,
          size: (entry as unknown as { size: number }).size || 0,
        });
      }
    }
  }

  const imageFiles = allFiles.filter((f) => isImage(getFileType(f.name)));
  const otherFiles = allFiles.filter((f) => !isImage(getFileType(f.name)));

  console.log(`   Total: ${allFiles.length} archivos`);
  console.log(`   Imagenes/PDFs (procesables): ${imageFiles.length}`);
  console.log(`   Otros (audio/video/etc): ${otherFiles.length}\n`);

  // Step 2: Check already-processed files
  console.log("Verificando canciones ya existentes...");
  const { data: existingSongs } = await supabase
    .from("songs")
    .select("original_file_url")
    .eq("source_type", "import_dropbox");
  const processedPaths = new Set(
    (existingSongs || []).map(
      (s: { original_file_url: string | null }) => s.original_file_url
    )
  );
  console.log(`   Ya procesadas: ${processedPaths.size} canciones\n`);

  // Step 3: Download and process images with Claude API
  console.log("Descargando y procesando chord charts con Claude API...\n");

  let processed = 0;
  let failed = 0;
  let songsCreated = 0;
  let downloadErrors = 0;
  let claudeErrors = 0;
  let unknownSongs = 0;
  let insertErrors = 0;
  let skipped = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const storagePath = file.path.replace(/^\//, "").toLowerCase();
    const pct = Math.round(((i + 1) / imageFiles.length) * 100);

    // Skip already-processed files
    if (processedPaths.has(storagePath)) {
      skipped++;
      continue;
    }

    process.stdout.write(
      `\r  [${pct}%] ${i + 1}/${imageFiles.length} - ${file.name.substring(0, 50).padEnd(50)}  (songs: ${songsCreated}, skip: ${skipped}, fail: ${failed})`
    );

    try {
      // Download from Dropbox via direct HTTP
      let buffer: Buffer;
      try {
        buffer = await downloadFromDropbox(file.path);
      } catch (dlErr: unknown) {
        downloadErrors++;
        failed++;
        if (downloadErrors <= 5) {
          console.log(
            `\n   [DL ERROR] ${file.name}: ${dlErr instanceof Error ? dlErr.message : dlErr}`
          );
        }
        continue;
      }

      const mime = getFileType(file.name) || "image/jpeg";

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("originals")
        .upload(storagePath, buffer, {
          contentType: mime,
          upsert: true,
        });
      if (uploadError) {
        // Storage upload warning, continue processing
        if (songsCreated + failed <= 5) {
          console.log(
            `\n   [UPLOAD WARN] ${file.name}: ${uploadError.message}`
          );
        }
      }

      // Extract with Claude API (with retry on rate limit)
      let chordpro: string;
      try {
        chordpro = await callClaudeWithRetry(mime, buffer.toString("base64"));
      } catch (apiErr: unknown) {
        claudeErrors++;
        failed++;
        if (claudeErrors <= 5) {
          console.log(
            `\n   [CLAUDE ERROR] ${file.name}: ${apiErr instanceof Error ? apiErr.message : apiErr}`
          );
        }
        continue;
      }

      if (chordpro && !chordpro.includes("{title: Unknown}")) {
        // Parse title and key from ChordPro
        const titleMatch = chordpro.match(/\{title:\s*(.+?)\}/i);
        const artistMatch = chordpro.match(/\{artist:\s*(.+?)\}/i);
        const keyMatch = chordpro.match(/\{key:\s*(.+?)\}/i);

        const title =
          titleMatch?.[1]?.trim() || file.name.replace(/\.[^.]+$/, "");
        const artist = artistMatch?.[1]?.trim() || null;
        const key = keyMatch?.[1]?.trim() || "C";

        // Create song in database
        const { error: songError } = await supabase.from("songs").insert({
          title,
          artist,
          original_key: key,
          chordpro_content: chordpro,
          source_type: "import_dropbox",
          original_file_url: storagePath,
          status: "draft",
          tags: ["importado"],
        });

        if (!songError) {
          songsCreated++;
        } else {
          insertErrors++;
          failed++;
          if (insertErrors <= 5) {
            console.log(
              `\n   [INSERT ERROR] ${title}: ${songError.message}`
            );
          }
        }
      } else {
        unknownSongs++;
        failed++;
      }

      processed++;
    } catch (err: unknown) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      if (failed <= 5) {
        console.log(`\n   [OTHER ERROR] ${file.name}: ${msg}`);
      }
    }

    // Print periodic summary every 100 files
    if ((i + 1) % 100 === 0) {
      console.log(
        `\n   --- Progress: ${i + 1}/${imageFiles.length} | Songs: ${songsCreated} | Fails: ${failed} (DL:${downloadErrors} API:${claudeErrors} UNK:${unknownSongs} INS:${insertErrors}) ---`
      );
    }
  }

  // Step 4: Upload non-image files (audio, video, etc.)
  console.log("\n\nSubiendo archivos de audio/video...\n");
  let uploaded = 0;
  let uploadFails = 0;
  for (let i = 0; i < otherFiles.length; i++) {
    const file = otherFiles[i];
    process.stdout.write(
      `\r  [${Math.round(((i + 1) / otherFiles.length) * 100)}%] ${i + 1}/${otherFiles.length} - ${file.name.substring(0, 50).padEnd(50)}`
    );
    try {
      const buffer = await downloadFromDropbox(file.path);
      const storagePath = file.path.replace(/^\//, "").toLowerCase();
      await supabase.storage.from("originals").upload(storagePath, buffer, {
        contentType: getFileType(file.name) || "application/octet-stream",
        upsert: true,
      });
      uploaded++;
    } catch {
      uploadFails++;
    }
  }

  // Summary
  console.log("\n\nMIGRACION COMPLETADA\n");
  console.log(`   Archivos totales: ${allFiles.length}`);
  console.log(`   Canciones creadas: ${songsCreated}`);
  console.log(`   Ya existentes (saltadas): ${skipped}`);
  console.log(
    `   Otros archivos subidos: ${uploaded} (fallos: ${uploadFails})`
  );
  console.log(`   Fallos total: ${failed}`);
  console.log(
    `   Desglose: DL=${downloadErrors} CLAUDE=${claudeErrors} UNKNOWN=${unknownSongs} INSERT=${insertErrors}`
  );
}

main().catch(console.error);
