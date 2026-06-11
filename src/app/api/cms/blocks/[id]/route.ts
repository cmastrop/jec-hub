import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireRole,
  requireMinistryAccess,
  type AuthResult,
} from "@/lib/auth/permissions";
import type { PageBlock } from "@/lib/types/cms";

async function requireBlockAccess(blockId: string): Promise<
  | { ok: true; auth: AuthResult & { ok: true }; block: PageBlock }
  | { ok: false; response: NextResponse }
> {
  const admin = createAdminClient();
  const { data: block } = await admin
    .from("page_blocks")
    .select("*")
    .eq("id", blockId)
    .single();

  if (!block) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Bloque no encontrado" }, { status: 404 }),
    };
  }

  const match = (block.page_slug as string).match(/^ministerios\/([a-z0-9-]+)$/);
  const auth = match
    ? await requireMinistryAccess(match[1])
    : await requireRole(["pastor", "admin"]);

  if (!auth.ok) return { ok: false, response: auth.response };

  return { ok: true, auth, block: block as PageBlock };
}

// PATCH /api/cms/blocks/[id] — editar contenido/estado de un bloque
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await requireBlockAccess(id);
    if (!access.ok) return access.response;

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.content_en && typeof body.content_en === "object") {
      updates.content_en = body.content_en;
    }
    if (body.content_es && typeof body.content_es === "object") {
      updates.content_es = body.content_es;
    }
    if (body.status === "draft" || body.status === "published") {
      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No hay campos validos para actualizar" },
        { status: 400 }
      );
    }

    updates.updated_by = access.auth.user.id;
    updates.updated_at = new Date().toISOString();

    const admin = createAdminClient();
    const { data: block, error } = await admin
      .from("page_blocks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(block);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/blocks/[id] — eliminar bloque
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await requireBlockAccess(id);
    if (!access.ok) return access.response;

    const admin = createAdminClient();
    const { error } = await admin.from("page_blocks").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
