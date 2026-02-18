import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadDropboxFile, getFreshAccessToken } from "@/lib/dropbox/client";
import { toStoragePath } from "@/lib/migration/utils";

export const maxDuration = 60;

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB max per file

export async function POST(request: NextRequest) {
  try {
    const { batchSize = 5 } = await request.json();

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Get fresh access token — automatically refreshed, never expires
    const accessToken = await getFreshAccessToken(user.id);

    const admin = createAdminClient();

    // Get next batch of pending files, skip very large ones
    const { data: pending } = await admin
      .from("migrated_files")
      .select("*")
      .eq("status", "pending")
      .lt("file_size", MAX_FILE_SIZE)
      .order("file_size", { ascending: true })
      .limit(Math.min(batchSize, 5));

    if (!pending || pending.length === 0) {
      // Mark oversized files as skipped
      await admin
        .from("migrated_files")
        .update({ status: "error", error_message: "Archivo demasiado grande (>15MB)" })
        .eq("status", "pending")
        .gte("file_size", MAX_FILE_SIZE);

      const { count } = await admin
        .from("migrated_files")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      return NextResponse.json({ downloaded: 0, failed: 0, remaining: count || 0 });
    }

    let downloaded = 0;
    let failed = 0;
    const startTime = Date.now();

    for (const file of pending) {
      // Safety: stop if we're running close to the timeout (45s used)
      if (Date.now() - startTime > 45000) break;

      try {
        await admin
          .from("migrated_files")
          .update({ status: "downloading" })
          .eq("id", file.id);

        const { data } = await downloadDropboxFile(
          accessToken,
          file.dropbox_path
        );

        const storagePath = toStoragePath(file.dropbox_path);
        const { error: uploadError } = await admin.storage
          .from("originals")
          .upload(storagePath, data, {
            contentType: file.file_type || "application/octet-stream",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        await admin
          .from("migrated_files")
          .update({ status: "downloaded", storage_path: storagePath })
          .eq("id", file.id);

        downloaded++;
      } catch (err) {
        await admin
          .from("migrated_files")
          .update({
            status: "error",
            error_message: err instanceof Error ? err.message : String(err),
          })
          .eq("id", file.id);
        failed++;
      }
    }

    const { count } = await admin
      .from("migrated_files")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    return NextResponse.json({
      downloaded,
      failed,
      remaining: count || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "DROPBOX_NOT_CONNECTED") {
      return NextResponse.json(
        { error: "Dropbox no conectado" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
