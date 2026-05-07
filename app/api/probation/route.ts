import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

async function getM(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await sb.rpc("get_session_member", { p_token: token });
  return data?.[0] || null;
}

export async function GET(req: NextRequest) {
  const m = await getM(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = new URL(req.url).searchParams.get("type");

  // Check own probation status
  if (type === "status") {
    const { data } = await sb.rpc("get_probation_status", { p_member_id: m.id });
    return NextResponse.json(data);
  }
  // Admin: get all active probations
  if (type === "all" && ["Founder","Admin"].includes(m.role)) {
    const { data } = await sb.rpc("get_all_probations");
    return NextResponse.json(data || []);
  }
  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const m = await getM(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["Founder","Admin"].includes(m.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();

  if (body.action === "set") {
    const { member_id, member_name, frat_name, duration_days, reason, tda_points } = body;
    const { data } = await sb.rpc("set_probation", {
      p_member_id: member_id, p_member_name: member_name, p_frat_name: frat_name,
      p_duration_days: duration_days, p_reason: reason || "TDA points below 100 for the month",
      p_tda_points: tda_points || 0, p_admin_id: m.id, p_admin_name: m.display_name,
    });
    return NextResponse.json({ success: true, id: data });
  }

  if (body.action === "lift") {
    await sb.rpc("lift_probation", { p_member_id: body.member_id, p_admin_name: m.display_name });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
