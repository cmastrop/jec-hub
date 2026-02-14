import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadDropboxFile } from "@/lib/dropbox/client";
import { toStoragePath } from "@/lib/migration/utils";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { accessToken, batchSize = 50 } = await request.json();
    if (!accessToken) {
      return NextResponse.json(
        { error: "accessToken is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Get next batch of pending files
    const { data: pending } = await admin
      .from("migrated_files")
      .select("*")
      .eq("status", "pending")
      .limit(batchSize);

    if (!pending || pending.length === 0) {
      const { count } = await admin
        .from("migrated_files")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      return NextResponse.json({ downloaded: 0, failed: 0, remaining: count || 0 });
    }

    let downloaded = 0;
    let failed = 0;

    for (const file of pending) {
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
