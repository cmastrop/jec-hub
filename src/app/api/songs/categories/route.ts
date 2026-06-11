import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const CATEGORY_ORDER = [
  "Adoración Español",
  "Cantautores",
  "Worship Inglés",
  "Rock/Pop Cristiano",
  "Alabanza Latina",
  "Alabanza General",
];

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch ALL published songs with tags (paginated to bypass 1000 row limit)
    const allRows: { tags: string[] | null }[] = [];
    let offset = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from("songs")
        .select("tags")
        .eq("status", "published")
        .range(offset, offset + pageSize - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) break;
      allRows.push(...data);
      if (data.length < pageSize) break;
      offset += pageSize;
    }

    // Count songs per category (from tags)
    const counts: Record<string, number> = {};
    for (const row of allRows) {
      const tags = row.tags || [];
      for (const tag of tags) {
        if (CATEGORY_ORDER.includes(tag)) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      }
    }

    // Return in defined order
    const categories = CATEGORY_ORDER
      .filter((cat) => counts[cat])
      .map((name) => ({ name, count: counts[name] || 0 }));

    return NextResponse.json({ categories, total: categories.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
