import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auditSystem } from "@/lib/audit";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const SECRET = process.env.DUES_WEBHOOK_SECRET || "KGE-DUES-2026";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.secret !== SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sl_username, sl_uuid, amount_ls, period } = body;
  if (!sl_username || !amount_ls)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data } = await sb.rpc("record_dues_payment", {
    p_sl_name:     sl_username,
    p_amount_paid: amount_ls,
    p_period:      period || null,
    p_sl_uuid:     sl_uuid || null,
  });

  if (data?.error) return NextResponse.json({ error: data.error }, { status: 400 });

  // Audit as system entry (no portal session — payment came from in-world terminal)
  if (data?.frat_name) {
    await auditSystem(
      `Paid L$${amount_ls} dues via KGE Divine Crystal`,
      "Dues",
      data.frat_name,
      "Sister",
      data.period,
      { amount: amount_ls, status: data.new_status, sl_uuid }
    );
  }

  return NextResponse.json(data);
}
