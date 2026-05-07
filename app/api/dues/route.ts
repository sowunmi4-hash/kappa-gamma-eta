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

export async function GET(req: NextRequest) {
  const m = await getM(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url    = new URL(req.url);
  const type   = url.searchParams.get("type");
  const selPer = url.searchParams.get("period") || "";

  if (type === "report") {
    if (!["Founder","Admin"].includes(m.role))
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const [{ data: allReport }, { data: period }, { data: allPeriods }] = await Promise.all([
      sb.rpc("get_dues_report"),
      sb.rpc("get_active_dues_period"),
      sb.rpc("get_all_dues_periods"),
    ]);

    // Filter to selected period
    const filtered = selPer
      ? (allReport||[]).filter((r: Record<string,string>) => r.period === selPer)
      : (allReport||[]);

    return NextResponse.json({
      report: filtered,
      period: (period as Record<string,unknown>[])?.[0] || null,
      allPeriods: allPeriods || [],
    });
  }

  const { data } = await sb.rpc("get_my_dues", { p_member_id: m.id });
  const { data: period } = await sb.rpc("get_active_dues_period");
  return NextResponse.json({ dues: data||[], period: (period as Record<string,unknown>[])?.[0]||null });
}

export async function POST(req: NextRequest) {
  const m = await getM(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["Founder","Admin"].includes(m.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  const { period, amount, description, due_date } = body;
  if (!period || !amount) return NextResponse.json({ error: "Period and amount required" }, { status: 400 });
  const { data, error } = await sb.rpc("create_dues_period", {
    p_period: period, p_amount: amount,
    p_description: description || "", p_due_date: due_date || null,
    p_admin_name: m.display_name,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)  return NextResponse.json({ error: "Failed to create period" }, { status: 500 });
  return NextResponse.json({ success: true, id: data });
}
