import { NextRequest, NextResponse } from "next/server";

const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export function middleware(request: NextRequest) {
  const session = request.cookies.get(COOKIE)?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/portal/:path*"] };
