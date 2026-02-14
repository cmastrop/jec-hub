import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    const admin = createAdminClient();

    if (jobId) {
      const { data: job } = await admin
        .from("import_jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      // Get item status breakdown
      const { data: items } = await admin
        .from("import_items")
        .select("status")
        .eq("job_id", jobId);

      const counts = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        skipped: 0,
        review: 0,
      };
      for (const item of items || []) {
        const s = item.status as keyof typeof counts;
        if (s in counts) counts[s]++;
      }

      return NextResponse.json({ job, itemBreakdown: counts });
    }

    // Get overall download progress
    const { count: totalFiles } = await admin
      .from("migrated_files")
      .select("*", { count: "exact", head: true });

    const { count: downloaded } = await admin
      .from("migrated_files")
      .select("*", { count: "exact", head: true })
      .eq("status", "downloaded");

    const { count: pending } = await admin
      .from("migrated_files")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: errors } = await admin
      .from("migrated_files")
      .select("*", { count: "exact", head: true })
      .eq("status", "error");

    // Get latest job
    const { data: latestJob } = await admin
      .from("import_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      downloadProgress: {
        total: totalFiles || 0,
        downloaded: downloaded || 0,
        pending: pending || 0,
        errors: errors || 0,
      },
      latestJob,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
