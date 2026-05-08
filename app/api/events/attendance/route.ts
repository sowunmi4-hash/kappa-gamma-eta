import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const { sl_username, sl_uuid, region, secret } = await req.json();
  if (!sl_username || !region) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const { data, error } = await sb.rpc("log_event_attendance", {
    p_sl_username: sl_username,
    p_sl_uuid:     sl_uuid || "",
    p_region:      region,
    p_secret:      secret || "",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
