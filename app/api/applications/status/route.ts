import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: NextRequest) {
  const name = new URL(req.url).searchParams.get("name")?.trim();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const { data, error } = await sb.rpc("check_application_status", { p_iw_name: name });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { iw_name, slot } = await req.json();
  if (!iw_name || !slot) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const { data, error } = await sb.rpc("pick_interview_slot", { p_iw_name: iw_name, p_slot: slot });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 400 });
  return NextResponse.json(data);
}
