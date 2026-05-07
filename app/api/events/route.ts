import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

async function getMember(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await sb.rpc("get_session_member", { p_token: token });
  return data?.[0] || null;
}

export async function GET(req: NextRequest) {
  const m = await getMember(req);
  const isOfficer = m && ["Admin","Founder","President"].includes(m.role);
  // Officers see all events, members see upcoming only
  if (isOfficer) {
    const { data } = await sb.rpc("get_all_events");
    if (m) {
      const { data: rsvps } = await sb.rpc("get_member_rsvps", { p_member_id: m.id });
      const rsvpSet = new Set((rsvps || []).map((r: { event_id: string }) => r.event_id));
      return NextResponse.json((data || []).map((e: Record<string,unknown>) => ({ ...e, rsvpd: rsvpSet.has(e.id as string) })));
    }
    return NextResponse.json(data || []);
  }
  const { data: events } = await sb.rpc("get_events");
  if (m) {
    const { data: rsvps } = await sb.rpc("get_member_rsvps", { p_member_id: m.id });
    const rsvpSet = new Set((rsvps || []).map((r: { event_id: string }) => r.event_id));
    return NextResponse.json((events || []).map((e: Record<string,unknown>) => ({ ...e, rsvpd: rsvpSet.has(e.id as string) })));
  }
  return NextResponse.json(events || []);
}

export async function POST(req: NextRequest) {
  const m = await getMember(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === "create") {
    const { title, event_date, event_time, location, sl_url, dress_code, description } = body;
    if (!title || !event_date) return NextResponse.json({ error: "Title and date are required." }, { status: 400 });
    const { data } = await sb.rpc("create_event", {
      p_title: title, p_event_date: event_date,
      p_event_time: event_time || null,
      p_location: location || "", p_sl_url: sl_url || "",
      p_dress_code: dress_code || "", p_description: description || "",
      p_member_id: m.id, p_member_name: m.display_name,
    });
    return NextResponse.json({ success: true, id: data });
  }

  if (action === "delete") {
    if (!["Admin","Founder","President"].includes(m.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await sb.rpc("delete_event", { p_event_id: body.event_id });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
