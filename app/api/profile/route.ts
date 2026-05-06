import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: members } = await sb.rpc("get_session_member", { p_token: token });
  if (!members?.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const m = members[0];
  const { bio, favourite_quote, hobbies, portrait_url, banner_url, new_password } = await req.json();
  await sb.rpc("upsert_member_profile", {
    p_member_id: m.id, p_bio: bio || "", p_quote: favourite_quote || "",
    p_hobbies: hobbies || "", p_portrait_url: portrait_url || "", p_banner_url: banner_url || "",
  });
  if (new_password && new_password.length >= 6) {
    const hash = await bcrypt.hash(new_password, 12);
    await sb.rpc("set_member_password", { p_member_id: m.id, p_hash: hash });
  }
  return NextResponse.json({ success: true });
}
