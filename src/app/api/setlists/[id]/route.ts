import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getUserRole(userId: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role || "member";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    // Fetch the setlist
    const { data: setlist, error: setlistError } = await admin
      .from("setlists")
      .select("*")
      .eq("id", id)
      .single();

    if (setlistError || !setlist) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    // Fetch setlist_songs ordered by position
    const { data: setlistSongs, error: songsError } = await admin
      .from("setlist_songs")
      .select("*")
      .eq("setlist_id", id)
      .order("position", { ascending: true });

    if (songsError) {
      return NextResponse.json({ error: songsError.message }, { status: 500 });
    }

    const songsList = setlistSongs || [];

    // Fetch song details for each setlist_song
    let songsWithDetails = songsList;
    if (songsList.length > 0) {
      const songIds = [...new Set(songsList.map((ss) => ss.song_id))];
      const { data: songs, error: songDetailsError } = await admin
        .from("songs")
        .select("id, title, artist, original_key")
        .in("id", songIds);

      if (songDetailsError) {
        return NextResponse.json({ error: songDetailsError.message }, { status: 500 });
      }

      const songMap: Record<string, { id: string; title: string; artist: string; original_key: string }> = {};
      if (songs) {
        for (const s of songs) {
          songMap[s.id] = s;
        }
      }

      songsWithDetails = songsList.map((ss) => ({
        ...ss,
        song: songMap[ss.song_id] || null,
      }));
    }

    return NextResponse.json({
      ...setlist,
      songs: songsWithDetails,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Fetch existing setlist to check ownership
    const { data: existing, error: fetchError } = await admin
      .from("setlists")
      .select("created_by")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    // Check: user is admin OR creator
    const role = await getUserRole(user.id);
    if (role !== "admin" && user.id !== existing.created_by) {
      return NextResponse.json(
        { error: "Solo admins o el creador pueden editar este programa" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.service_type !== undefined) {
      const validTypes = ["domingo", "miercoles", "jovenes", "oracion", "especial", "otro"];
      if (!validTypes.includes(body.service_type)) {
        return NextResponse.json(
          { error: `service_type debe ser uno de: ${validTypes.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.service_type = body.service_type;
    }
    if (body.service_date !== undefined) updateData.service_date = body.service_date;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data, error } = await admin
      .from("setlists")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Fetch existing setlist to check ownership
    const { data: existing, error: fetchError } = await admin
      .from("setlists")
      .select("created_by")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    // Check: user is admin OR creator
    const role = await getUserRole(user.id);
    if (role !== "admin" && user.id !== existing.created_by) {
      return NextResponse.json(
        { error: "Solo admins o el creador pueden eliminar este programa" },
        { status: 403 }
      );
    }

    const { error } = await admin
      .from("setlists")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
