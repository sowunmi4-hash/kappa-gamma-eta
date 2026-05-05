import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase   = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) await supabase.rpc("invalidate_session", { p_token: token });
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { expires: new Date(0), path: "/" });
  return res;
}
