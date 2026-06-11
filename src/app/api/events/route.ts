import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// GET /api/events — Public: returns published events
export async function GET(request: NextRequest) {
  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status"); // admin can filter by status
  const from = searchParams.get("from"); // date range start (YYYY-MM-DD)
  const to = searchParams.get("to"); // date range end (YYYY-MM-DD)

  let query = admin
    .from("church_events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  // If no status filter, default to published (public access)
  if (status) {
    // Check if user is admin for non-published queries
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }
    query = query.eq("status", status);
  } else {
    query = query.eq("status", "published");
  }

  // Filtro por rango con solapamiento: un evento entra si empieza antes (o en) `to`
  // y termina después (o en) `from`. Para eventos de un solo día, end_date es null,
  // así que se compara contra event_date.
  if (to) query = query.lte("event_date", to);
  if (from) query = query.or(`end_date.gte.${from},and(end_date.is.null,event_date.gte.${from})`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/events — Admin only: create new event
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, event_date, end_date, start_time, end_time, location, event_type, status, recurring, recurring_day } = body;

  if (!title || !event_date) {
    return NextResponse.json({ error: "Título y fecha son requeridos" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("church_events")
    .insert({
      title,
      description: description || null,
      event_date,
      end_date: end_date || null,
      start_time: start_time || null,
      end_time: end_time || null,
      location: location || "73 Nollamara Ave, Nollamara WA 6061",
      event_type: event_type || "service",
      status: status || "draft",
      recurring: recurring || false,
      recurring_day: recurring_day || null,
      created_by: user.id,
      approved_by: status === "published" ? user.id : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
