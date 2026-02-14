import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAllDropboxFiles } from "@/lib/dropbox/client";
import { getFileType, isProcessableByGemini } from "@/lib/migration/utils";

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    if (!accessToken) {
      return NextResponse.json(
        { error: "accessToken is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
