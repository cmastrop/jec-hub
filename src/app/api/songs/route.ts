import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const key = searchParams.get("key") || "";
    const status = searchParams.get("status") || "published";
    const artist = searchParams.get("artist") || "";
    const sourceType = searchParams.get("source_type") || "";
    const tag = searchParams.get("tag") || "";
    const sort = searchParams.get("sort") || "title";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("songs")
      .select("id, title, artist, original_key, tags, status, source_type, created_at", {
        count: "exact",
      })
      .range(offset, offset + limit - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,artist.ilike.%${search}%`
      );
    }

    if (key) {
      query = query.eq("original_key", key);
    }

    if (artist) {
      query = query.ilike("artist", `%${artist}%`);
    }

    if (sourceType) {
      query = query.eq("source_type", sourceType);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    // Sort
    switch (sort) {
      case "artist":
        query = query.order("artist", { ascending: true, nullsFirst: false });
        break;
      case "created_at":
        query = query.order("created_at", { ascending: false });
        break;
      case "key":
        query = query.order("original_key", { ascending: true });
        break;
      default:
        query = query.order("title", { ascending: true });
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      songs: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
