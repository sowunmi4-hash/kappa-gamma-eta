import { audit } from "@/lib/audit";
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
    const { title, event_date, event_time, event_end_time, location, sl_url, sl_region, event_duration_minutes, dress_code, description, flyer_url } = body;
    if (!title || !event_date) return NextResponse.json({ error: "Title and date are required." }, { status: 400 });
    const { data } = await sb.rpc("create_event", {
      p_title: title, p_event_date: event_date,
      p_event_time: event_time || null,
      p_location: location || "", p_sl_url: sl_url || "", p_sl_region: sl_region || null, p_duration: event_duration_minutes || 60, p_event_end_time: event_end_time || null,
      p_dress_code: dress_code || "", p_description: description || "",
      p_flyer_url: flyer_url || "",
      p_member_id: m.id, p_member_name: m.display_name,
    });
    const eventId = data;

    // Format date nicely
    const dateStr = new Date(event_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    const timeStr = event_time ? ` at ${event_time.slice(0,5)}` : "";

    // Notify all sisters
    await sb.rpc("notify_all_sisters", {
      p_title: `📅 New Event: ${title}`,
      p_message: `${title} — ${dateStr}${timeStr}${location ? ` · ${location}` : ""}. Check the Events tab for details.`,
    });

    // Post to The Chalice
    await sb.rpc("create_news_post", {
      p_title: `📅 ${title}`,
      p_content: `A new event has been announced!

📅 ${dateStr}${timeStr}${location ? `
📍 ${location}` : ""}${dress_code ? `
👗 ${dress_code}` : ""}${description ? `

${description}` : ""}`,
      p_posted_by: m.display_name,
    });

    await audit(req, "Created event", "Events", title, { event_date, location });
    return NextResponse.json({ success: true, id: eventId });
  }

  if (action === "delete") {
    if (!["Admin","Founder","Co-Founder","President"].includes(m.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    // Grab flyer URL before deleting so we can clean up storage
    const { data: ev } = await sb.schema("members").from("events")
      .select("flyer_url").eq("id", body.event_id).single();
    await audit(req, "Deleted event", "Events", body.title || body.event_id, { event_id: body.event_id });
    await sb.rpc("delete_event", { p_event_id: body.event_id });
    if (ev?.flyer_url) {
      const marker = "/public/flyers/";
      const idx = (ev.flyer_url as string).indexOf(marker);
      if (idx !== -1) {
        await sb.storage.from("flyers").remove([(ev.flyer_url as string).substring(idx + marker.length)]);
      }
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
