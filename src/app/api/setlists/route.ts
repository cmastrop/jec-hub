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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("service_type") || "";
    const month = searchParams.get("month") || "";
    const year = searchParams.get("year") || "";

    const admin = createAdminClient();

    let query = admin
      .from("setlists")
      .select("*")
      .order("service_date", { ascending: false, nullsFirst: false });

    if (serviceType) {
      query = query.eq("service_type", serviceType);
    }

    if (year && month) {
      const m = parseInt(month);
      const y = parseInt(year);
      const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
      const endMonth = m === 12 ? 1 : m + 1;
      const endYear = m === 12 ? y + 1 : y;
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
      query = query.gte("service_date", startDate).lt("service_date", endDate);
    } else if (year) {
      query = query.gte("service_date", `${year}-01-01`).lt("service_date", `${parseInt(year) + 1}-01-01`);
    } else if (month) {
      const currentYear = new Date().getFullYear();
      const m = parseInt(month);
      const startDate = `${currentYear}-${String(m).padStart(2, "0")}-01`;
      const endMonth = m === 12 ? 1 : m + 1;
      const endYear = m === 12 ? currentYear + 1 : currentYear;
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
      query = query.gte("service_date", startDate).lt("service_date", endDate);
    }

    const { data: setlists, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const setlistList = setlists || [];

    // Get song counts per setlist
    let songCountMap: Record<string, number> = {};
    if (setlistList.length > 0) {
      const setlistIds = setlistList.map((s) => s.id);
      const { data: songRows, error: countError } = await admin
        .from("setlist_songs")
        .select("setlist_id")
        .in("setlist_id", setlistIds);

      if (!countError && songRows) {
        songCountMap = songRows.reduce<Record<string, number>>((acc, row) => {
          acc[row.setlist_id] = (acc[row.setlist_id] || 0) + 1;
          return acc;
        }, {});
      }
    }

    const setlistsWithCount = setlistList.map((s) => ({
      ...s,
      song_count: songCountMap[s.id] || 0,
    }));

    return NextResponse.json({
      setlists: setlistsWithCount,
      total: setlistsWithCount.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const role = await getUserRole(user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Solo admins pueden crear programas" }, { status: 403 });
    }

    const body = await request.json();
    const { title, service_type, service_date, notes } = body;

    if (!title || !service_type) {
      return NextResponse.json(
        { error: "title y service_type son requeridos" },
        { status: 400 }
      );
    }

    const validTypes = ["domingo", "miercoles", "jovenes", "oracion", "especial", "otro"];
    if (!validTypes.includes(service_type)) {
      return NextResponse.json(
        { error: `service_type debe ser uno de: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("setlists")
      .insert({
        title,
        service_type,
        service_date: service_date || null,
        notes: notes || null,
        created_by: user.id,
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
