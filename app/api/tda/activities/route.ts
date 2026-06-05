import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { audit } from "@/lib/audit";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await sb.rpc("get_tda_activities", { p_token: token });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, category, point_value, requires_proof } = await req.json();
  if (!name || !category || !point_value)
    return NextResponse.json({ error: "Name, category and points are required" }, { status: 400 });
  const { data } = await sb.rpc("add_tda_activity", {
    p_token: token, p_name: name, p_category: category,
    p_point_value: point_value, p_requires_proof: requires_proof || false,
  });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  await audit(req, `Added TDA activity: ${name}`, "TDA", name, { category, point_value });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { activity_id, is_active, activity_name } = await req.json();
  const { data } = await sb.rpc("toggle_tda_activity", { p_token: token, p_activity_id: activity_id, p_is_active: is_active });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  await audit(req, `${is_active ? "Activated" : "Deactivated"} TDA activity`, "TDA", activity_name || activity_id);
  return NextResponse.json({ ok: true });
}
