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

  if (type === "overview") {
    if (!["Founder","Admin"].includes(m.role))
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const { data } = await sb.rpc("get_guide_overview");
    return NextResponse.json(data || []);
  }

  const { data: progress } = await sb.rpc("get_guide_progress", { p_member_id: m.id });
  const { data: complete } = await sb.rpc("is_guide_complete", { p_member_id: m.id });
  return NextResponse.json({ progress: progress || [], complete: complete || false });
}

export async function POST(req: NextRequest) {
  const m = await getM(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.action === "mark_read") {
    await sb.rpc("mark_guide_section_read", { p_member_id: m.id, p_section_id: body.section_id });
    return NextResponse.json({ success: true });
  }
  if (body.action === "complete") {
    await sb.rpc("complete_guide", { p_member_id: m.id });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
