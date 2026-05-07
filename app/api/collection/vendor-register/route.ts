import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { secret, url } = body;
  if (!secret || !url) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const { data } = await sb.rpc("register_vendor", { p_secret: secret, p_url: url });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 401 });
  return NextResponse.json({ success: true });
}
