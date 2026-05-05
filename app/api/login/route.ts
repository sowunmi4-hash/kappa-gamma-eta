import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ONE_TIME_PASSWORD    = "SisterhoodKGE";
const COOKIE_NAME          = process.env.SESSION_COOKIE_NAME || "kge_session";
const SESSION_DAYS_NORMAL  = 1;
const SESSION_DAYS_REMEMBER = 30;

export async function POST(req: NextRequest) {
  try {
    const { sl_name, password, remember, new_password } = await req.json();

    if (!sl_name || !password) {
      return NextResponse.json({ error: "SL name and password are required." }, { status: 400 });
    }

    // ── Look up member via RPC ──
    const { data: rows, error } = await supabase.rpc("get_member_by_sl", {
      p_sl_name: sl_name.trim().toLowerCase(),
    });

    if (error || !rows || rows.length === 0) {
      return NextResponse.json({ error: "Sister not found. Check your SL username." }, { status: 401 });
    }

    const member = rows[0];

    // ── First-time login ──
    if (!member.password_hash) {
      if (password !== ONE_TIME_PASSWORD) {
        return NextResponse.json({ error: "Incorrect one-time password.", first_login: true }, { status: 401 });
      }
      if (!new_password || new_password.length < 6) {
        return NextResponse.json({ needs_new_password: true, first_login: true }, { status: 200 });
      }
      const hash = await bcrypt.hash(new_password, 12);
      await supabase.rpc("set_member_password", { p_member_id: member.id, p_hash: hash });
      member.password_hash = hash;
    } else {
      // ── Returning login ──
      const match = await bcrypt.compare(password, member.password_hash);
      if (!match) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
      }
    }

    // ── Create session ──
    const token     = randomBytes(48).toString("hex");
    const days      = remember ? SESSION_DAYS_REMEMBER : SESSION_DAYS_NORMAL;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await supabase.rpc("create_session", {
      p_member_id: member.id,
      p_token:     token,
      p_expires_at: expiresAt.toISOString(),
    });

    const res = NextResponse.json({
      success:      true,
      member_id:    member.id,
      display_name: member.display_name,
      frat_name:    member.frat_name,
      role:         member.role,
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires:  expiresAt,
      path:     "/",
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
