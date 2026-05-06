import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json([]);
  const { data: members } = await sb.rpc("get_session_member", { p_token: token });
  if (!members?.length) return NextResponse.json([]);
  const { data } = await sb.rpc("get_notifications", { p_member_id: members[0].id });
  return NextResponse.json(data || []);
}
export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  await sb.rpc("mark_notification_read", { p_id: id });
  return NextResponse.json({ success: true });
}
