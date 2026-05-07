import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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
  const type = new URL(req.url).searchParams.get("type");

  if (type === "public") {
    const { data } = await sb.rpc("get_public_gallery");
    return NextResponse.json(data || []);
  }
  if (type === "private") {
    const { data } = await sb.rpc("get_private_gallery", { p_member_id: m.id });
    return NextResponse.json(data || []);
  }
  if (type === "repday") {
    if (["Founder","Admin"].includes(m.role)) {
      const { data } = await sb.rpc("get_repday_submissions");
      return NextResponse.json({ isAdmin: true, posts: data || [] });
    }
    const { data } = await sb.rpc("get_my_repday", { p_member_id: m.id });
    return NextResponse.json({ isAdmin: false, posts: data || [] });
  }
  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const m = await getMember(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.action === "add") {
    const { gallery_type, image_url, caption } = body;
    const { data } = await sb.rpc("add_gallery_post", {
      p_member_id: m.id, p_member_name: m.display_name,
      p_frat_name: m.frat_name, p_gallery_type: gallery_type,
      p_image_url: image_url, p_caption: caption || "",
    });
    return NextResponse.json({ success: true, id: data });
  }

  if (body.action === "delete") {
    await sb.rpc("delete_gallery_post", { p_id: body.id, p_member_id: m.id });
    return NextResponse.json({ success: true });
  }

  if (body.action === "save_repday") {
    if (!["Founder","Admin"].includes(m.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    await sb.rpc("save_repday_photo", { p_id: body.id, p_saved: body.saved });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
