import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { audit } from "@/lib/audit";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { member_id, member_name } = await req.json();
  if (!member_id) return NextResponse.json({ error: "Missing member_id" }, { status: 400 });
  const { data } = await sb.rpc("remove_member", { p_token: token, p_member_id: member_id });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  await audit(req, "Removed member from roster", "Roster", member_name || member_id, { member_id });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { member_id, member_name, role } = await req.json();
  if (!member_id) return NextResponse.json({ error: "Missing member_id" }, { status: 400 });
  const { data } = await sb.rpc("update_member_role", { p_token: token, p_member_id: member_id, p_role: role });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  await audit(req, `Changed role to ${role}`, "Roster", member_name || member_id, { member_id, role });
  return NextResponse.json({ success: true });
}
