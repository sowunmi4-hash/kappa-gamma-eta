import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/sisters") ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: members } = await sb.rpc("get_session_member", { p_token: token });
  if (!members?.length) return NextResponse.redirect(new URL("/login", req.url));

  const member = members[0];
  const isAdmin = ["Founder","Admin"].includes(member.role);

  // Guide route — auth only, no other checks
  if (pathname.startsWith("/guide")) {
    if (isAdmin) return NextResponse.redirect(new URL("/portal", req.url));
    return NextResponse.next();
  }

  // Probation check (skip for admins)
  if (pathname.startsWith("/portal") && !isAdmin) {
    const { data: probStatus } = await sb.rpc("get_probation_status", { p_member_id: member.id });
    if (probStatus?.on_probation) return NextResponse.redirect(new URL("/probation", req.url));

    // Guide check — must complete guide before accessing portal
    const { data: guideComplete } = await sb.rpc("is_guide_complete", { p_member_id: member.id });
    if (!guideComplete) return NextResponse.redirect(new URL("/guide", req.url));
  }

  // Probation page
  if (pathname.startsWith("/probation")) {
    if (isAdmin) return NextResponse.redirect(new URL("/portal", req.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/guide/:path*", "/guide", "/probation"],
};
