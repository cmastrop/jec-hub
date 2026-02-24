import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAllDropboxFiles, getFreshAccessToken } from "@/lib/dropbox/client";
import { getFileType, isProcessableByGemini } from "@/lib/migration/utils";

export const maxDuration = 60;

export async function POST() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Check if there's already work in progress (pending downloads or pending processing)
    const { count: pendingDownloads } = await admin
      .from("migrated_files")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: pendingProcess } = await admin
      .from("import_items")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: downloadedCount } = await admin
      .from("migrated_files")
      .select("*", { count: "exact", head: true })
      .eq("status", "downloaded");

    if ((pendingDownloads && pendingDownloads > 0) || (pendingProcess && pendingProcess > 0)) {
      // Reset any items stuck in "processing" back to "pending"
      await admin
        .from("import_items")
        .update({ status: "pending" })
        .eq("status", "processing");

      // Resume existing work — use the latest job
      const { data: existingJob } = await admin
        .from("import_jobs")
        .select("id")
        .eq("source", "dropbox")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { count: totalCount } = await admin
        .from("migrated_files")
        .select("*", { count: "exact", head: true });

      let jobId = existingJob?.id;

      if (!jobId) {
        const { data: newJob } = await admin
          .from("import_jobs")
          .insert({
            source: "dropbox",
            total_files: totalCount || 0,
            status: "pending",
          })
          .select()
          .single();
        jobId = newJob?.id;
      }

      // Consolidate: reassign ALL pending items from other jobs to the active job
      if (jobId) {
        await admin
          .from("import_items")
          .update({ job_id: jobId })
          .eq("status", "pending")
          .neq("job_id", jobId);
      }

      // Re-count pending after consolidation
      const { count: consolidatedPending } = await admin
        .from("import_items")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      return NextResponse.json({
        jobId,
        totalFiles: totalCount || 0,
        processableFiles: consolidatedPending || 0,
        downloadRemaining: pendingDownloads || 0,
        downloaded: downloadedCount || 0,
        resumed: true,
        // Tell frontend to skip download if no pending downloads
        skipDownload: !pendingDownloads || pendingDownloads === 0,
      });
    }

    // Fresh catalog: get token and scan Dropbox
    const accessToken = await getFreshAccessToken(user.id);

    // List all files from Dropbox
    const files = await listAllDropboxFiles(accessToken);

    // Create import job
    const { data: job, error: jobError } = await admin
      .from("import_jobs")
      .insert({
        source: "dropbox",
        total_files: files.length,
        status: "pending",
      })
      .select()
      .single();

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 });
    }

    // Batch insert into migrated_files (chunks of 500)
    for (let i = 0; i < files.length; i += 500) {
      const chunk = files.slice(i, i + 500).map((f) => ({
        dropbox_path: f.path,
        file_type: getFileType(f.name),
        file_size: f.size,
        dropbox_folder: f.folder,
        status: "pending" as const,
      }));
      await admin
        .from("migrated_files")
        .upsert(chunk, { onConflict: "dropbox_path", ignoreDuplicates: true });
    }

    // Create import_items for processable files only
    const processable = files.filter((f) =>
      isProcessableByGemini(getFileType(f.name))
    );
    for (let i = 0; i < processable.length; i += 500) {
      const chunk = processable.slice(i, i + 500).map((f) => ({
        job_id: job.id,
        original_filename: f.name,
        file_type: getFileType(f.name),
        storage_path: f.path,
        status: "pending" as const,
      }));
      await admin.from("import_items").insert(chunk);
    }

    return NextResponse.json({
      jobId: job.id,
      totalFiles: files.length,
      processableFiles: processable.length,
      mediaFiles: files.length - processable.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "DROPBOX_NOT_CONNECTED") {
      return NextResponse.json(
        { error: "Dropbox no conectado. Conectá tu cuenta primero." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
