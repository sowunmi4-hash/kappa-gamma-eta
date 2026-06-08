import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: NextRequest) {
  const type = new URL(req.url).searchParams.get("type") || "repday";
  const { data } = await sb.rpc("get_collab_wall", { p_type: type });
  return NextResponse.json(data || { posts: [] });
}
