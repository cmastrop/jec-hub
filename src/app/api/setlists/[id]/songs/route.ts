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

async function canEditSetlist(
  userId: string,
  setlistId: string
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const admin = createAdminClient();

  const { data: setlist, error } = await admin
    .from("setlists")
    .select("created_by")
    .eq("id", setlistId)
    .single();

  if (error || !setlist) {
    return { allowed: false, error: "Programa no encontrado", status: 404 };
  }

  const role = await getUserRole(userId);
  if (role !== "admin" && userId !== setlist.created_by) {
    return {
      allowed: false,
      error: "Solo admins o el creador pueden modificar este programa",
      status: 403,
    };
  }

  return { allowed: true };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: setlistId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const access = await canEditSetlist(user.id, setlistId);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const body = await request.json();
    const { song_id, transpose_key, capo, notes } = body;

    if (!song_id) {
      return NextResponse.json(
        { error: "song_id es requerido" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Verify song exists
    const { data: song, error: songError } = await admin
      .from("songs")
      .select("id")
      .eq("id", song_id)
      .single();

    if (songError || !song) {
      return NextResponse.json(
        { error: "Cancion no encontrada" },
        { status: 404 }
      );
    }

    // Get max position for this setlist
    const { data: maxRow } = await admin
      .from("setlist_songs")
      .select("position")
      .eq("setlist_id", setlistId)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const nextPosition = maxRow ? maxRow.position + 1 : 1;

    const { data, error } = await admin
      .from("setlist_songs")
      .insert({
        setlist_id: setlistId,
        song_id,
        position: nextPosition,
        transpose_key: transpose_key || null,
        capo: capo ?? 0,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
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
    const { id: setlistId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const access = await canEditSetlist(user.id, setlistId);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const body = await request.json();
    const { songs } = body;

    if (!songs || !Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json(
        { error: "songs debe ser un array con al menos un elemento" },
        { status: 400 }
      );
    }

    // Validate each entry has id and position
    for (const s of songs) {
      if (!s.id || typeof s.position !== "number") {
        return NextResponse.json(
          {
            error:
              "Cada elemento debe tener id (string) y position (number)",
          },
          { status: 400 }
        );
      }
    }

    const admin = createAdminClient();

    // Fetch all existing setlist_songs for this setlist BEFORE deleting
    const { data: existingRows, error: fetchError } = await admin
      .from("setlist_songs")
      .select("*")
      .eq("setlist_id", setlistId);

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // Build a map of existing rows by id
    const existingMap: Record<string, (typeof existingRows)[number]> = {};
    for (const row of existingRows || []) {
      existingMap[row.id] = row;
    }

    // Validate all referenced ids exist in this setlist
    for (const s of songs) {
      if (!existingMap[s.id]) {
        return NextResponse.json(
          { error: `setlist_song con id ${s.id} no encontrado en este programa` },
          { status: 400 }
        );
      }
    }

    // Delete all existing setlist_songs for this setlist
    const { error: deleteError } = await admin
      .from("setlist_songs")
      .delete()
      .eq("setlist_id", setlistId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // Re-insert with new positions, preserving all other fields
    const rowsToInsert = songs.map((s) => {
      const original = existingMap[s.id];
      return {
        id: original.id,
        setlist_id: original.setlist_id,
        song_id: original.song_id,
        position: s.position,
        transpose_key: original.transpose_key,
        capo: original.capo,
        notes: original.notes,
      };
    });

    const { error: insertError } = await admin
      .from("setlist_songs")
      .insert(rowsToInsert);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
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
    const { id: setlistId } = await params;
    const { searchParams } = new URL(request.url);
    const songEntryId = searchParams.get("song_id");

    if (!songEntryId) {
      return NextResponse.json(
        { error: "song_id query param es requerido (id del setlist_song)" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const access = await canEditSetlist(user.id, setlistId);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const admin = createAdminClient();

    const { error } = await admin
      .from("setlist_songs")
      .delete()
      .eq("id", songEntryId)
      .eq("setlist_id", setlistId);

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
