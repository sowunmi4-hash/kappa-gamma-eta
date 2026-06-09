import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const { path, referrer } = await req.json();
  const country = req.headers.get("x-vercel-ip-country") || null;
  await sb.rpc("log_page_view", { p_path: path, p_referrer: referrer || null, p_country: country });
  return NextResponse.json({ ok: true });
}
