import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/permissions";

const BUCKET = "cms-media";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function publicUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

// GET /api/cms/media — lista de imagenes subidas (cualquier rol con acceso CMS)
export async function GET() {
  try {
    const auth = await requireRole(["pastor", "admin", "lider_ministerio"]);
    if (!auth.ok) return auth.response;

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("page_media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      (data ?? []).map((m) => ({ ...m, url: publicUrl(m.storage_path) }))
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// POST /api/cms/media — subir imagen (multipart form: file, alt_text?)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(["pastor", "admin", "lider_ministerio"]);
    if (!auth.ok) return auth.response;

    const formData = await request.formData();
    const file = formData.get("file");
    const altText = formData.get("alt_text");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado (JPG, PNG, WebP, GIF)" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Archivo muy grande (max 10MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .slice(0, 50);
    const storagePath = `${Date.now()}-${safeName}.${ext}`;

    const admin = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: media, error } = await admin
      .from("page_media")
      .insert({
        storage_path: storagePath,
        alt_text: typeof altText === "string" && altText ? altText : null,
        uploaded_by: auth.user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ...media, url: publicUrl(storagePath) }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
