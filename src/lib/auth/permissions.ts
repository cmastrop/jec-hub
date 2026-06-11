import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type Role = "pastor" | "admin" | "lider_ministerio" | "member";

export interface AuthProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
}

export type AuthResult =
  | { ok: true; user: User; profile: AuthProfile }
  | { ok: false; response: NextResponse };

/** Roles con acceso global (siempre pasan los checks). */
const GLOBAL_ROLES: Role[] = ["pastor", "admin"];

function unauthorized(): AuthResult {
  return {
    ok: false,
    response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
  };
}

function forbidden(message = "No tienes permisos suficientes"): AuthResult {
  return {
    ok: false,
    response: NextResponse.json({ error: message }, { status: 403 }),
  };
}

/**
 * Verifica que haya un usuario autenticado y retorna su perfil.
 * Uso en route handlers:
 *   const auth = await requireAuth();
 *   if (!auth.ok) return auth.response;
 *   const { user, profile } = auth;
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return unauthorized();

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) return unauthorized();

  return { ok: true, user, profile: profile as AuthProfile };
}

/**
 * Verifica que el usuario tenga uno de los roles indicados.
 * pastor y admin siempre pasan (acceso global).
 */
export async function requireRole(roles: Role[]): Promise<AuthResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (GLOBAL_ROLES.includes(auth.profile.role) || roles.includes(auth.profile.role)) {
    return auth;
  }

  return forbidden();
}

/**
 * Verifica acceso de gestion a un ministerio:
 * - pastor/admin: siempre pasan
 * - lider_ministerio: pasa si esta en ministry_members del ministerio
 *   con role 'lider' o 'colaborador'
 */
export async function requireMinistryAccess(ministrySlug: string): Promise<AuthResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (GLOBAL_ROLES.includes(auth.profile.role)) return auth;

  if (auth.profile.role !== "lider_ministerio") {
    return forbidden("Solo lideres de ministerio");
  }

  const admin = createAdminClient();
  const { data: ministry } = await admin
    .from("ministries")
    .select("id")
    .eq("slug", ministrySlug)
    .single();

  if (!ministry) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Ministerio no encontrado" }, { status: 404 }),
    };
  }

  const { data: membership } = await admin
    .from("ministry_members")
    .select("id, role")
    .eq("ministry_id", ministry.id)
    .eq("user_id", auth.user.id)
    .in("role", ["lider", "colaborador"])
    .maybeSingle();

  if (!membership) {
    return forbidden("No tienes acceso a este ministerio");
  }

  return auth;
}
