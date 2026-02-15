import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAIExtractor, type AIProvider } from "@/lib/ai";
import { parseChordPro } from "@/lib/chordpro/parser";

export const maxDuration = 60;

async function getUserRole(userId: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role || "member";
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const role = await getUserRole(user.id);
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Solo admins pueden importar canciones" },
        { status: 403 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const provider = (formData.get("provider") as string) || "gemini";

    if (!file) {
      return NextResponse.json(
        { error: "No se recibio archivo" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado. Usa JPG, PNG, WebP o PDF." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Maximo 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload original to Storage
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
    const storagePath = `uploads/${Date.now()}_${safeName}`;
    const admin = createAdminClient();

    await admin.storage.from("originals").upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

    // Extract with AI
    const extractor = getAIExtractor(provider as AIProvider);
    const result = await extractor.extractChordPro(buffer, file.type);

    if (!result.success || !result.chordpro) {
      return NextResponse.json(
        { error: result.error || "No se pudo extraer la cancion del archivo" },
        { status: 500 }
      );
    }

    // Parse ChordPro and create song
    const parsed = parseChordPro(result.chordpro);
    const sourceType =
      file.type === "application/pdf" ? "import_pdf" : "import_image";

    const { data: song, error } = await admin
      .from("songs")
      .insert({
        title:
          parsed.metadata.title ||
          file.name.replace(/\.[^.]+$/, "").replace(/_/g, " "),
        artist: parsed.metadata.artist || null,
        original_key: parsed.metadata.key || "C",
        tempo: parsed.metadata.tempo || null,
        time_signature: parsed.metadata.time || "4/4",
        chordpro_content: result.chordpro,
        source_type: sourceType,
        original_file_url: storagePath,
        status: "draft",
        tags: ["importado"],
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      songId: song?.id,
      success: true,
      provider: result.provider,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
