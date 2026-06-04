import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = new URL(req.url).searchParams.get("status") || undefined;
  const { data, error } = await sb.rpc("get_applications", { p_token: token, p_status: status ?? null });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.iw_name?.trim() || !b.age?.trim() || !b.why_kge?.trim() || !b.sisterhood_meaning?.trim() || !b.brings_to_kge?.trim())
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  if (parseInt(b.age) < 18)
    return NextResponse.json({ error: "You must be 18 or older to apply." }, { status: 400 });
  const { data, error } = await sb.rpc("submit_application", {
    p_iw_name: b.iw_name.trim(), p_age: b.age.trim(),
    p_instagram: b.instagram?.trim() || null,
    p_has_discord: b.has_discord?.trim() || null,
    p_prev_sorority: b.prev_sorority === true,
    p_online_freq: b.online_freq || null,
    p_can_pay_dues: b.can_pay_dues === true,
    p_instagram_daily: b.instagram_daily === true,
    p_can_pledge: b.can_pledge === true,
    p_why_kge: b.why_kge.trim(),
    p_sisterhood_meaning: b.sisterhood_meaning.trim(),
    p_brings_to_kge: b.brings_to_kge.trim(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 409 });

  // Notify all Founders that a new application has been submitted
  const { data: founders } = await sb
    .schema("members")
    .from("roster")
    .select("id")
    .eq("role", "Founder");

  if (founders && founders.length > 0) {
    await Promise.all(founders.map((f: { id: string }) =>
      sb.rpc("notify_sister", {
        p_member_id: f.id,
        p_title: "📋 New Sorority Application",
        p_message: `${b.iw_name.trim()} has submitted an application to join KGΗ. Review it in the Applications tab.`,
      })
    ));
  }

  return NextResponse.json(data, { status: 201 });
}

import { audit } from "@/lib/audit";

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, review_notes, interview_slots, applicant_name } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  const { data, error } = await sb.rpc("review_application", {
    p_token: token,
    p_id: id,
    p_status: status,
    p_review_notes: review_notes || null,
    p_interview_slots: interview_slots && interview_slots.length > 0 ? interview_slots : null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
  await audit(req, `Application ${status}`, "Applications", applicant_name || id, { status, review_notes });
  return NextResponse.json(data);
}
