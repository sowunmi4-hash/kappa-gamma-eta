import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: members } = await sb.rpc("get_session_member", { p_token: token });
  const m = members?.[0];
  if (!m || !["Founder","Admin"].includes(m.role) || m.sl_name === "safareehills")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data } = await sb.rpc("get_active_voice_codes");
  return NextResponse.json(data || []);
}
