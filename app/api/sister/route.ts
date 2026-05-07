import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: NextRequest) {
  const sl_name = new URL(req.url).searchParams.get("sl_name");
  if (!sl_name) return NextResponse.json({ error: "sl_name required" }, { status: 400 });
  const { data } = await sb.rpc("get_public_sister_profile", { p_sl_name: sl_name });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
