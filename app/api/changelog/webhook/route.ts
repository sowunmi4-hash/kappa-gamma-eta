import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WEBHOOK_SECRET = process.env.CHANGELOG_WEBHOOK_SECRET || "KGE-CHANGELOG-2026";

export async function POST(req: NextRequest) {
  // Verify secret from header or query param
  const secret =
    req.headers.get("x-webhook-secret") ||
    new URL(req.url).searchParams.get("secret");

  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Vercel deployment webhook payload
  const type = body?.type;
  if (type !== "deployment.succeeded") {
    // Ignore non-success events silently
    return NextResponse.json({ ok: true });
  }

  const deployment   = body?.payload?.deployment || body?.payload || {};
  const meta         = deployment?.meta || {};
  const commitMsg    = meta?.githubCommitMessage || meta?.gitlabCommitMessage || "Site updated";
  const deploymentId = deployment?.id || deployment?.deploymentId || null;
  const branch       = meta?.githubCommitRef || meta?.branchAlias || "main";

  // Skip bot/auto commits (dependabot, merge commits, etc.)
  const skip = ["merge pull request", "dependabot", "chore(deps)", "auto-"].some(
    (s) => commitMsg.toLowerCase().startsWith(s)
  );
  if (skip) return NextResponse.json({ ok: true, skipped: true });

  const { error } = await sb
    .schema("members")
    .from("website_changelog")
    .insert({
      commit_message: commitMsg,
      deployment_id:  deploymentId,
      branch,
      deployed_at:    new Date().toISOString(),
    });

  if (error) {
    console.error("Changelog insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
