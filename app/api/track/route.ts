import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function POST(req: NextRequest) {
  // Skip tracking if request comes from a logged-in member
  const token = req.cookies.get(COOKIE)?.value;
  if (token) return NextResponse.json({ ok: true, skipped: true });

  const { path, referrer } = await req.json();
  const country = req.headers.get("x-vercel-ip-country") || null;
  await sb.rpc("log_page_view", { p_path: path, p_referrer: referrer || null, p_country: country });
  return NextResponse.json({ ok: true });
}
