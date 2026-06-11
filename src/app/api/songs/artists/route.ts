import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch ALL published songs with artist field (paginated to bypass 1000 row limit)
    const allRows: { artist: string | null }[] = [];
    let offset = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from("songs")
        .select("artist")
        .eq("status", "published")
        .not("artist", "is", null)
        .not("artist", "eq", "")
        .range(offset, offset + pageSize - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) break;
      allRows.push(...data);
      if (data.length < pageSize) break;
      offset += pageSize;
    }

    // Count songs per artist
    const counts: Record<string, number> = {};
    for (const row of allRows) {
      const artist = row.artist || "Desconocido";
      counts[artist] = (counts[artist] || 0) + 1;
    }

    // Sort alphabetically
    const artists = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));

    return NextResponse.json({ artists, total: artists.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
