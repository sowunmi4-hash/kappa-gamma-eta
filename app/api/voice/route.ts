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
  const type = new URL(req.url).searchParams.get("type");
  if (type === "all" && ["Admin","Founder"].includes(m.role)) {
    const { data } = await sb.rpc("get_all_voice_submissions");
    return NextResponse.json(data || []);
  }
  const { data } = await sb.rpc("get_my_voice_submissions", { p_member_id: m.id });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const m = await getMember(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.action === "submit") {
    const { category, description, related_page } = body;
    if (!category || !description) return NextResponse.json({ error: "Category and description required." }, { status: 400 });
    const { data } = await sb.rpc("submit_sisters_voice", {
      p_member_id: m.id, p_member_name: m.display_name,
      p_category: category, p_description: description,
      p_related_page: related_page || "",
    });
    return NextResponse.json({ success: true, id: data });
  }

  if (body.action === "update_status") {
    if (!["Admin","Founder"].includes(m.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    await sb.rpc("update_voice_status", {
      p_id: body.id, p_status: body.status,
      p_admin_notes: body.admin_notes || "",
      p_reviewer_id: m.id, p_reviewer_name: m.display_name,
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
