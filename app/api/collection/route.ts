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
  const { data } = await sb.rpc("get_collection_items", { p_member_id: m.id });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const m = await getM(req);
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["Founder","Admin"].includes(m.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();

  if (body.action === "add") {
    const { name, description, category, image_url, item_key } = body;
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const { data } = await sb.rpc("add_collection_item", {
      p_name: name, p_description: description || "",
      p_category: category || "Clothing", p_image_url: image_url || "",
      p_item_key: item_key || "", p_admin_name: m.display_name,
    });
    return NextResponse.json({ success: true, id: data });
  }

  if (body.action === "delete") {
    await sb.rpc("delete_collection_item", { p_id: body.id });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
