import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireRole,
  requireMinistryAccess,
  type AuthResult,
} from "@/lib/auth/permissions";

const BLOCK_TYPES = [
  "hero",
  "text",
  "image",
  "gallery",
  "verse",
  "cta",
  "video",
  "features",
  "leader",
];

/**
 * Acceso de edicion segun la pagina: las paginas de ministerio
 * ("ministerios/<slug>") las gestiona el lider del ministerio;
 * el resto solo pastor/admin.
 */
async function requirePageAccess(pageSlug: string): Promise<AuthResult> {
  const match = pageSlug.match(/^ministerios\/([a-z0-9-]+)$/);
  if (match) return requireMinistryAccess(match[1]);
  return requireRole(["pastor", "admin"]);
}

// GET /api/cms/blocks?page_slug=X — publico, solo bloques published
// GET /api/cms/blocks?page_slug=X&all=true — editor, requiere acceso a la pagina
export async function GET(request: NextRequest) {
  try {
    const pageSlug = request.nextUrl.searchParams.get("page_slug");
    const all = request.nextUrl.searchParams.get("all") === "true";

    if (!pageSlug) {
      return NextResponse.json({ error: "page_slug es requerido" }, { status: 400 });
    }

    if (all) {
      const auth = await requirePageAccess(pageSlug);
      if (!auth.ok) return auth.response;
    }

    const admin = createAdminClient();
    let query = admin
      .from("page_blocks")
      .select("*")
      .eq("page_slug", pageSlug)
      .order("position");

    if (!all) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// POST /api/cms/blocks — crear bloque (requiere acceso a la pagina)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page_slug, block_type, content_en, content_es, status } = body;

    if (!page_slug || !block_type) {
      return NextResponse.json(
        { error: "page_slug y block_type son requeridos" },
        { status: 400 }
      );
    }
    if (!BLOCK_TYPES.includes(block_type)) {
      return NextResponse.json({ error: "block_type invalido" }, { status: 400 });
    }

    const auth = await requirePageAccess(page_slug);
    if (!auth.ok) return auth.response;

    const admin = createAdminClient();

    // Vincular al ministerio si la pagina es de un ministerio
    let ministryId: string | null = null;
    const match = page_slug.match(/^ministerios\/([a-z0-9-]+)$/);
    if (match) {
      const { data: ministry } = await admin
        .from("ministries")
        .select("id")
        .eq("slug", match[1])
        .single();
      ministryId = ministry?.id ?? null;
    }

    // Posicion al final de la pagina
    const { data: last } = await admin
      .from("page_blocks")
      .select("position")
      .eq("page_slug", page_slug)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: block, error } = await admin
      .from("page_blocks")
      .insert({
        page_slug,
        ministry_id: ministryId,
        block_type,
        position: (last?.position ?? -1) + 1,
        content_en: content_en ?? {},
        content_es: content_es ?? {},
        status: status === "published" ? "published" : "draft",
        created_by: auth.user.id,
        updated_by: auth.user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(block, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
