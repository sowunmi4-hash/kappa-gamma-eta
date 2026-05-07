import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes and API routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/probation") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/sisters") ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Portal routes require auth
  if (pathname.startsWith("/portal")) {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get session member
    const { data: members } = await sb.rpc("get_session_member", { p_token: token });
    if (!members?.length) return NextResponse.redirect(new URL("/login", req.url));

    const member = members[0];

    // Check probation — skip for founders/admins setting probation
    if (!["Founder","Admin"].includes(member.role)) {
      const { data: probStatus } = await sb.rpc("get_probation_status", { p_member_id: member.id });
      if (probStatus?.on_probation) {
        return NextResponse.redirect(new URL("/probation", req.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/probation"],
};
