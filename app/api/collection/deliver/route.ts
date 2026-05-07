import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

async function getM(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await sb.rpc("get_session_member", { p_token: token });
  return data?.[0] || null;
}

export async function POST(req: NextRequest) {
  const m = await getM(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { item_id, is_redelivery } = body;

  // 1. Check dues — if outstanding, block
  const { data: duesData } = await sb.rpc("get_my_dues", { p_member_id: m.id });
  const dues = (duesData || []) as Array<{status:string; remaining:number}>;
  const hasOutstanding = dues.some((d) => d.status !== "paid" && d.remaining > 0);
  if (hasOutstanding) {
    return NextResponse.json({
      error: "dues_unpaid",
      message: "Your dues are outstanding. Please visit the KGE Dues Terminal in-world to pay before accessing The Divine Collection."
    }, { status: 403 });
  }

  // 2. Get the item
  const { data: items } = await sb.rpc("get_collection_items", { p_member_id: m.id });
  const item = (items || []).find((i: {id:string}) => i.id === item_id);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  // 3. Get vendor URL
  const { data: vendorUrl } = await sb.rpc("get_vendor_url");
  if (!vendorUrl) {
    return NextResponse.json({
      error: "vendor_offline",
      message: "The KGE vendor is currently offline. Please try again later or contact a Founder."
    }, { status: 503 });
  }

  // 4. Fire delivery request to SL vendor
  try {
    const vendorRes = await fetch(vendorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deliver",
        sl_username: m.sl_name,
        item_name: item.name,
        item_key: item.item_key || "",
        secret: "KGE-VENDOR-2026",
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!vendorRes.ok) {
      const errText = await vendorRes.text();
      return NextResponse.json({ error: "delivery_failed", message: errText }, { status: 500 });
    }
  } catch {
    return NextResponse.json({
      error: "vendor_offline",
      message: "Could not reach the KGE vendor. Make sure the vendor object is rezzed and online in Second Life."
    }, { status: 503 });
  }

  // 5. Record the claim
  await sb.rpc("record_collection_claim", {
    p_member_id: m.id, p_item_id: item_id, p_is_redelivery: is_redelivery || false,
  });

  return NextResponse.json({ success: true });
}
