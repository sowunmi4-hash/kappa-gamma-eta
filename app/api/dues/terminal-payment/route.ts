import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const SECRET = process.env.DUES_WEBHOOK_SECRET || "KGE-DUES-2026";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.secret !== SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sl_username, sl_uuid, amount_ls, period } = body;
  if (!sl_username || !amount_ls)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Record payment (also saves UUID inside the function)
  const { data } = await sb.rpc("record_dues_payment", {
    p_sl_name:     sl_username,
    p_amount_paid: amount_ls,
    p_period:      period || null,
    p_sl_uuid:     sl_uuid || null,
  });

  if (data?.error) return NextResponse.json({ error: data.error }, { status: 400 });
  return NextResponse.json(data);
}
