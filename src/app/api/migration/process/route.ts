import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAIExtractor } from "@/lib/ai";
import { parseChordPro } from "@/lib/chordpro/parser";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { jobId, batchSize = 2 } = await request.json();
    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Get next batch of pending items
    const { data: items } = await admin
      .from("import_items")
      .select("*")
      .eq("job_id", jobId)
      .eq("status", "pending")
      .limit(Math.min(batchSize, 5));

    if (!items || items.length === 0) {
      // Check if there are still pending items (might be stuck in "processing")
      const { count: remaining } = await admin
        .from("import_items")
        .select("*", { count: "exact", head: true })
        .eq("job_id", jobId)
        .in("status", ["pending", "processing"]);

      return NextResponse.json({
        processed: 0,
        failed: 0,
        dailyLimitReached: false,
        remaining: remaining ?? 0,
      });
    }

    // Update job status to processing
    await admin
      .from("import_jobs")
      .update({ status: "processing" })
      .eq("id", jobId);

    let processed = 0;
    let failed = 0;
    let dailyLimitReached = false;
    const startTime = Date.now();

    for (const item of items) {
      // Safety: stop before Vercel timeout
      if (Date.now() - startTime > 50000) break;

      try {

        // Update item status
        await admin
          .from("import_items")
          .update({ status: "processing" })
          .eq("id", item.id);

        // Find the corresponding migrated file
        const { data: migrated } = await admin
          .from("migrated_files")
          .select("storage_path")
          .eq("dropbox_path", item.storage_path)
          .eq("status", "downloaded")
          .single();

        if (!migrated?.storage_path) {
          throw new Error("File not downloaded yet");
        }

        // Download from Supabase Storage
        const { data: fileData, error: dlError } = await admin.storage
          .from("originals")
          .download(migrated.storage_path);

        if (dlError || !fileData) {
          throw new Error(dlError?.message || "Failed to download from storage");
        }

        const buffer = Buffer.from(await fileData.arrayBuffer());

        // Extract with AI
        const extractor = getAIExtractor("claude");
        const result = await extractor.extractChordPro(
          buffer,
          item.file_type || "image/jpeg"
        );

        if (result.success && result.chordpro) {
          const parsed = parseChordPro(result.chordpro);

          // Create song as draft
          const { data: song } = await admin
            .from("songs")
            .insert({
              title: parsed.metadata.title || item.original_filename.replace(/\.[^.]+$/, ""),
              artist: parsed.metadata.artist || null,
              original_key: parsed.metadata.key || "C",
              tempo: parsed.metadata.tempo || null,
              time_signature: parsed.metadata.time || "4/4",
              chordpro_content: result.chordpro,
              source_type: "import_dropbox",
              original_file_url: migrated.storage_path,
              status: "draft",
              tags: ["importado"],
            })
            .select("id")
            .single();

          await admin
            .from("import_items")
            .update({
              status: "review",
              extracted_chordpro: result.chordpro,
              gemini_raw_response: result.chordpro,
              song_id: song?.id,
            })
            .eq("id", item.id);

          processed++;
        } else {
          throw new Error(result.error || "Empty Gemini response");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);

        if (message === "DAILY_LIMIT_REACHED") {
          await admin
            .from("import_jobs")
            .update({ status: "paused" })
            .eq("id", jobId);
          dailyLimitReached = true;
          break;
        }

        await admin
          .from("import_items")
          .update({ status: "failed", error_message: message })
          .eq("id", item.id);
        failed++;
      }
    }

    // Update job counters
    const { data: currentJob } = await admin
      .from("import_jobs")
      .select("processed_files, failed_files")
      .eq("id", jobId)
      .single();

    if (currentJob) {
      await admin
        .from("import_jobs")
        .update({
          processed_files: (currentJob.processed_files || 0) + processed,
          failed_files: (currentJob.failed_files || 0) + failed,
        })
        .eq("id", jobId);
    }

    // Count remaining pending items
    const { count: remaining } = await admin
      .from("import_items")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId)
      .eq("status", "pending");

    return NextResponse.json({
      processed,
      failed,
      dailyLimitReached,
      remaining: remaining ?? 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
