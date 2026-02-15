import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Solo admins" }, { status: 403 });
    }

    const { data: songs, error } = await admin
      .from("songs")
      .select("id, title, artist, original_key, status, source_type, created_at")
      .order("title");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const groups: Record<string, typeof songs> = {};
    for (const song of songs || []) {
      const key = normalize(song.title);
      if (!groups[key]) groups[key] = [];
      groups[key].push(song);
    }

    const duplicates = Object.entries(groups)
      .filter(([, songs]) => songs.length > 1)
      .map(([normalizedTitle, songs]) => ({ normalizedTitle, songs }));

    return NextResponse.json({
      groups: duplicates,
      totalGroups: duplicates.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
