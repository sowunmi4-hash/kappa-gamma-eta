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

export async function GET() {
  const { data } = await sb.rpc("get_news");
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const m = await getMember(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === "create") {
    const { title, content, pinned } = body;
    if (!title || !content) return NextResponse.json({ error: "Title and content required." }, { status: 400 });
    const { data } = await sb.rpc("create_news_post", {
      p_title: title, p_content: content,
      p_pinned: pinned || false,
      p_member_id: m.id, p_member_name: m.display_name,
    });
    await audit(req, "Created Chalice post", "Chalice", title);
    return NextResponse.json({ success: true, id: data });
  }

  if (action === "delete") {
    if (!["Admin","Founder","Co-Founder","President"].includes(m.role))
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // If the post was created by an Admin, only Admin can delete it
    const { data: post } = await sb.schema("members").from("kge_news")
      .select("posted_by_name").eq("id", body.id).single();
    if (post?.posted_by_name?.toLowerCase().includes("admin") && m.role !== "Admin")
      return NextResponse.json({ error: "Only the Admin can delete this post." }, { status: 403 });
    await audit(req, "Deleted Chalice post", "Chalice", body.title || body.id, { post_id: body.id });
    await sb.rpc("delete_news_post", { p_id: body.id });
    return NextResponse.json({ success: true });
  }

  if (action === "toggle_pin") {
    await audit(req, body.pinned ? "Pinned Chalice post" : "Unpinned Chalice post", "Chalice", body.title || body.id);
    await sb.rpc("toggle_pin_post", { p_id: body.id, p_pinned: body.pinned });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
