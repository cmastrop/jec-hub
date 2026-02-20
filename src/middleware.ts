import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // === Church domain detection ===
  // Rewrite root domain (jesuseselcamino.com.au) to church landing page
  const hostname = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  ).replace(/:\d+$/, ""); // strip port for local dev

  const isChurchDomain =
    hostname === "jesuseselcamino.com.au" ||
    hostname === "www.jesuseselcamino.com.au";

  // Church sub-routes that get rewritten to /iglesia/*
  const churchSubRoutes = ["/nosotros", "/ministerios", "/eventos", "/contacto", "/testimonios", "/donar", "/sermones", "/en-vivo"];

  if (isChurchDomain) {
    // Root path → rewrite to /iglesia (URL stays clean)
    if (request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/iglesia";
      return NextResponse.rewrite(url);
    }
    // Rewrite known church sub-routes (e.g. /nosotros → /iglesia/nosotros)
    if (churchSubRoutes.some((r) => request.nextUrl.pathname === r || request.nextUrl.pathname.startsWith(r + "/"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/iglesia" + request.nextUrl.pathname;
      return NextResponse.rewrite(url);
    }
    // Allow /iglesia routes through without auth
    if (request.nextUrl.pathname.startsWith("/iglesia")) {
      return NextResponse.next();
    }
  }

  // Allow /iglesia route directly (for testing and direct access)
  if (request.nextUrl.pathname.startsWith("/iglesia")) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip middleware if Supabase is not configured yet
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login (except for public routes)
  const publicRoutes = ["/login", "/registro", "/"];
  const isPublicRoute =
    publicRoutes.some((route) => request.nextUrl.pathname === route) ||
    request.nextUrl.pathname.startsWith("/api");

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/registro")) {
    const url = request.nextUrl.clone();
    url.pathname = "/canciones";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.webp|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
