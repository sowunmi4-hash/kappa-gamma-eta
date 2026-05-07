import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const SECRET = process.env.DUES_WEBHOOK_SECRET || "KGE-DUES-2026";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sl_username = searchParams.get("sl_username") || "";
  const { data } = await sb.rpc("get_dues_status", { p_sl_name: sl_username });
  return NextResponse.json(data || { found: "no" });
}
