import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { member_id } = await req.json();
  if (!member_id) return NextResponse.json({ error: "Missing member_id" }, { status: 400 });
  const { data } = await sb.rpc("remove_member", { p_token: token, p_member_id: member_id });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  return NextResponse.json({ success: true });
}
