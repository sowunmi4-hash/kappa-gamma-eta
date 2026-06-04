import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const COOKIE = process.env.SESSION_COOKIE_NAME || "kge_session";

export async function audit(
  req: { cookies: { get: (name: string) => { value: string } | undefined } },
  action: string,
  category: string,
  targetName?: string,
  details?: Record<string, unknown>
) {
  try {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token) return;
    await sb.rpc("log_audit", {
      p_token:       token,
      p_action:      action,
      p_category:    category,
      p_target_name: targetName || null,
      p_details:     details || {},
    });
  } catch { /* never crash the app over an audit write */ }
}

export async function auditSystem(
  action: string,
  category: string,
  actorName: string,
  actorRole: string,
  targetName?: string,
  details?: Record<string, unknown>
) {
  try {
    await sb.rpc("log_audit_system", {
      p_action:      action,
      p_category:    category,
      p_actor_name:  actorName,
      p_actor_role:  actorRole,
      p_target_name: targetName || null,
      p_details:     details || {},
    });
  } catch { /* never crash */ }
}
