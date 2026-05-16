import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { member_id } = await req.json();
  const { data } = await sb.rpc("founder_mark_dues_paid", { p_token: token, p_member_id: member_id });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  return NextResponse.json(data || { error: "No response" });
}
