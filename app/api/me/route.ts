import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await sb.rpc("get_session_member", { p_token: token });
  if (!data?.length) return NextResponse.json({ error: "Session expired" }, { status: 401 });
  const member = data[0];
  const { data: profile } = await sb.rpc("get_member_profile", { p_member_id: member.id });

  // Lazy trigger: fire and forget — wrapped in async IIFE to avoid TS Promise issues
  void (async () => { try { await sb.rpc("run_auto_probation"); } catch { /* silent */ } })();

  return NextResponse.json({ member, profile: profile?.[0] || null });
}
