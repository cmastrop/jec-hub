import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole, requireMinistryAccess } from "@/lib/auth/permissions";

// PATCH /api/cms/blocks/reorder — { page_slug, ids: string[] } en el nuevo orden
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { page_slug, ids } = body;

    if (!page_slug || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "page_slug e ids son requeridos" },
        { status: 400 }
      );
    }

    const match = page_slug.match(/^ministerios\/([a-z0-9-]+)$/);
    const auth = match
      ? await requireMinistryAccess(match[1])
      : await requireRole(["pastor", "admin"]);
    if (!auth.ok) return auth.response;

    const admin = createAdminClient();

    for (let i = 0; i < ids.length; i++) {
      const { error } = await admin
        .from("page_blocks")
        .update({ position: i, updated_by: auth.user.id })
        .eq("id", ids[i])
        .eq("page_slug", page_slug);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
