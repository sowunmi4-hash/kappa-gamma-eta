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
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "overview") {
    const { data } = await sb.rpc("get_tda_overview", { p_member_id: m.id });
    return NextResponse.json(data);
  }
  if (type === "leaderboard") {
    const { data } = await sb.rpc("get_tda_leaderboard");
    return NextResponse.json(data || []);
  }
  if (type === "activities") {
    const { data } = await sb.rpc("get_tda_activities");
    return NextResponse.json(data || []);
  }
  if (type === "my_submissions") {
    const { data } = await sb.rpc("get_my_submissions", { p_member_id: m.id });
    return NextResponse.json(data || []);
  }
  if (type === "pending") {
    const { data } = await sb.rpc("get_pending_submissions");
    return NextResponse.json(data || []);
  }
  if (type === "campaign") {
    const { data } = await sb.rpc("get_active_campaign");
    return NextResponse.json(data || null);
  }
  if (type === "goals") {
    const { data } = await sb.rpc("get_chapter_goals", { p_type: "all" });
    return NextResponse.json(data || []);
  }
  if (type === "titles") {
    const { data } = await sb.rpc("get_active_titles");
    return NextResponse.json(data || []);
  }
  if (type === "transactions") {
    const { data } = await sb.rpc("get_tda_transactions", { p_member_id: m.id });
    return NextResponse.json(data || []);
  }
  if (type === "sisters") {
    const { data } = await sb.rpc("get_all_sisters");
    return NextResponse.json(data || []);
  }
  if (type === "tda_title_list") {
    const { data } = await sb.from("tda_titles" as never).select("*").order("sort_order");
    return NextResponse.json(data || []);
  }
  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const m = await getMember(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === "submit_activity") {
    const { activity_id, activity_name, category, point_value, description, proof_url, event_name } = body;
    const { data } = await sb.rpc("submit_tda_activity", {
      p_member_id: m.id, p_member_name: m.display_name,
      p_activity_id: activity_id, p_activity_name: activity_name,
      p_category: category, p_point_value: point_value,
      p_description: description || "", p_proof_url: proof_url || "",
      p_event_name: event_name || "",
    });
    return NextResponse.json({ success: true, id: data });
  }

  if (action === "review") {
    const { id, status, notes } = body;
    await sb.rpc("review_tda_submission", {
      p_id: id, p_status: status, p_reviewer_id: m.id,
      p_reviewer_name: m.display_name, p_notes: notes || "",
    });
    return NextResponse.json({ success: true });
  }

  if (action === "manual_adjust") {
    const { member_id, member_name, points, type, reason } = body;
    const { data: result } = await sb.rpc("manual_tda_adjustment", {
      p_member_id: member_id, p_member_name: member_name,
      p_points: points, p_type: type, p_reason: reason,
      p_admin_id: m.id, p_admin_name: m.display_name,
    });
    if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (action === "assign_title") {
    const { title_id, title_name, member_id, member_name } = body;
    await sb.rpc("assign_tda_title", {
      p_title_id: title_id, p_title_name: title_name,
      p_member_id: member_id, p_member_name: member_name,
      p_admin_id: m.id, p_admin_name: m.display_name,
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
