import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await sb.rpc("get_pledges", { p_token: token });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { member_id, pledge_name, duration_days, pledge_status } = await req.json();
  const { data } = await sb.rpc("update_pledge", {
    p_token: token, p_member_id: member_id,
    p_pledge_name: pledge_name || null,
    p_duration_days: duration_days || null,
    p_pledge_status: pledge_status || null,
  });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  return NextResponse.json({ success: true });
}
