import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { audit } from "@/lib/audit";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await sb.rpc("get_tda_leaderboard", { p_token: token });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  return NextResponse.json(data || { leaderboard: [] });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { member_id, member_name, title, month } = await req.json();
  if (!member_id || !title || !month) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const { data, error } = await sb.rpc("issue_tda_reward", {
    p_token: token, p_member_id: member_id, p_title: title, p_month: month,
  });
  if (error) {
    console.error("issue_tda_reward error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "No response from server" }, { status: 500 });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  await audit(req, `Issued ${title}`, "TDA", member_name || member_id, { title, month, member_id });
  return NextResponse.json(data);
}
