import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Get the song to find original_file_url
    const { data: song, error } = await admin
      .from("songs")
      .select("original_file_url, title")
      .eq("id", id)
      .single();

    if (error || !song) {
      return NextResponse.json(
        { error: "Cancion no encontrada" },
        { status: 404 }
      );
    }

    if (!song.original_file_url) {
      return NextResponse.json(
        { error: "No hay archivo original" },
        { status: 404 }
      );
    }

    // Generate signed URL (valid for 1 hour)
    const { data: signedData, error: signError } = await admin.storage
      .from("originals")
      .createSignedUrl(song.original_file_url, 3600);

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json(
        { error: "No se pudo generar URL del archivo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedData.signedUrl,
      path: song.original_file_url,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
