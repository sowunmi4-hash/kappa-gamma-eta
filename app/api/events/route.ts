import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  const { data: events } = await sb.rpc("get_events");
  if (token) {
    const { data: members } = await sb.rpc("get_session_member", { p_token: token });
    if (members?.length) {
      const { data: rsvps } = await sb.rpc("get_member_rsvps", { p_member_id: members[0].id });
      const rsvpSet = new Set((rsvps || []).map((r: { event_id: string }) => r.event_id));
      return NextResponse.json((events || []).map((e: Record<string, unknown>) => ({ ...e, rsvpd: rsvpSet.has(e.id as string) })));
    }
  }
  return NextResponse.json(events || []);
}
