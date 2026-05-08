import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  const { data, error } = await sb.rpc("get_dues_terminal_location");
  if (error || !data) return NextResponse.json({ online: false });
  return NextResponse.json(data);
}
