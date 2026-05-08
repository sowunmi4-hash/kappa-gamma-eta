import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  const { data } = await sb
    .schema("members")
    .from("vendor_registry")
    .select("region_name, parcel_name, pos_x, pos_y, pos_z, last_location_sync")
    .eq("vendor_secret", "KGE-VENDOR-2026")
    .single();
  if (!data) return NextResponse.json({ online: false });
  return NextResponse.json({
    online: true,
    region: data.region_name || null,
    parcel: data.parcel_name || null,
    x: data.pos_x ? Math.round(data.pos_x) : null,
    y: data.pos_y ? Math.round(data.pos_y) : null,
    z: data.pos_z ? Math.round(data.pos_z) : null,
    last_sync: data.last_location_sync,
  });
}
