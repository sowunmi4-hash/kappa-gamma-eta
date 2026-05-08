import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const { secret, region, parcel, x, y, z, object_key } = await req.json();
  if (!secret || !region) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const { data } = await sb.rpc("sync_dues_terminal", {
    p_secret: secret, p_region: region, p_parcel: parcel || "",
    p_x: x ?? 0, p_y: y ?? 0, p_z: z ?? 0,
    p_object_key: object_key || null,
  });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 401 });
  return NextResponse.json({ success: true });
}
