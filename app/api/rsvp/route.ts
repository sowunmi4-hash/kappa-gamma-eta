import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { event_id, action } = await req.json();
  const { data: members } = await sb.rpc("get_session_member", { p_token: token });
  if (!members?.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const m = members[0];
  if (action === "remove") {
    await sb.rpc("remove_rsvp", { p_event_id: event_id, p_member_id: m.id });
  } else {
    await sb.rpc("add_rsvp", { p_event_id: event_id, p_member_id: m.id, p_member_name: m.display_name });
  }
  return NextResponse.json({ success: true });
}
