import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { audit } from "@/lib/audit";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

async function getMember(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await sb.rpc("get_session_member", { p_token: token });
  return data?.[0] || null;
}

export async function GET(req: NextRequest) {
  const m = await getMember(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const submissionId = url.searchParams.get("submission_id");

  // Auto-delete dismissed tickets older than 24hrs on every load
  await sb.rpc("cleanup_dismissed_voice_tickets");

  // Get messages for a specific submission thread
  if (type === "messages" && submissionId) {
    const { data } = await sb.rpc("get_voice_messages", { p_submission_id: submissionId });
    return NextResponse.json(data || []);
  }

  if (type === "all" && ["Admin","Founder"].includes(m.role)) {
    const { data } = await sb.rpc("get_all_voice_submissions");
    return NextResponse.json(data || []);
  }
  const { data } = await sb.rpc("get_my_voice_submissions", { p_member_id: m.id });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const m = await getMember(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.action === "submit") {
    const { category, description, related_page } = body;
    if (!category || !description) return NextResponse.json({ error: "Category and description required." }, { status: 400 });
    const { data } = await sb.rpc("submit_sisters_voice", {
      p_member_id: m.id, p_member_name: m.display_name,
      p_category: category, p_description: description,
      p_related_page: related_page || "",
    });
    const ticketId = data;
    // Auto-generate access code for safareehills
    await sb.rpc("generate_voice_access_code", { p_ticket_id: ticketId });
    // Notify Safareehills of new ticket
    const { data: safaree } = await sb.schema("members").from("roster").select("id").eq("sl_name","safareehills").single();
    if (safaree) {
      await sb.rpc("notify_sister", {
        p_member_id: safaree.id,
        p_title: `💙 New Voice Ticket — ${category}`,
        p_message: `${m.display_name} submitted a new ${category} ticket. Check Sister's Voice to respond.`,
      });
    }
    return NextResponse.json({ success: true, id: ticketId });
  }

  if (body.action === "complete") {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await sb.rpc("complete_voice_ticket", { p_token: token, p_ticket_id: body.ticket_id });
    if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
    await audit(req, "Completed Voice ticket", "Voice", body.ticket_title || body.ticket_id, { ticket_id: body.ticket_id });
    return NextResponse.json(data);
  }

  if (body.action === "use_code") {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await sb.rpc("use_voice_access_code", { p_token: token, p_code: body.code });
    if (data?.error) return NextResponse.json({ error: data.error }, { status: 403 });
    return NextResponse.json(data);
  }

  if (body.action === "reply") {
    const { submission_id, message } = body;
    if (!submission_id || !message) return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    const isAdmin = ["Admin","Founder"].includes(m.role);
    await sb.rpc("add_voice_message", {
      p_submission_id: submission_id,
      p_sender_id: m.id,
      p_sender_name: m.display_name,
      p_sender_frat_name: m.frat_name,
      p_is_admin: isAdmin,
      p_message: message,
    });

    // Get ticket info to notify the right person(s)
    const { data: ticket } = await sb
      .schema("members")
      .from("sisters_voice")
      .select("member_id, member_name, category")
      .eq("id", submission_id)
      .single();

    if (ticket) {
      if (isAdmin) {
        // Admin/Founder replied → notify the sister who submitted
        await sb.rpc("notify_sister", {
          p_member_id: ticket.member_id,
          p_title: "💙 New Reply on Your Voice Ticket",
          p_message: `${m.display_name} replied to your ${ticket.category} ticket. Check Sister's Voice for their response.`,
        });
      } else {
        // Sister replied → notify Safareehills only
        const { data: safaree } = await sb
          .schema("members")
          .from("roster")
          .select("id")
          .eq("sl_name", "safareehills")
          .single();
        if (safaree) {
          await sb.rpc("notify_sister", {
            p_member_id: safaree.id,
            p_title: `💙 New Reply from ${m.display_name}`,
            p_message: `${m.display_name} replied to their ${ticket.category} ticket. Check Sister's Voice to respond.`,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  }

  if (body.action === "update_status") {
    if (m.role !== "Admin") return NextResponse.json({ error: "Only Admin can update ticket status." }, { status: 403 });
    await sb.rpc("update_voice_status", {
      p_id: body.id, p_status: body.status,
      p_admin_notes: body.admin_notes || "",
      p_reviewer_id: m.id, p_reviewer_name: m.display_name,
    });
    await audit(req, `Voice ticket marked ${body.status}`, "Voice", body.ticket_title || body.id, { status: body.status, ticket_id: body.id });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
