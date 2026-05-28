export async function register() {
  // Only run in production on Vercel, server-side only
  if (
    process.env.VERCEL_ENV !== "production" ||
    process.env.NEXT_RUNTIME === "edge"
  ) return;

  const commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE;
  const deploymentId  = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_URL || null;
  const branch        = process.env.VERCEL_GIT_COMMIT_REF || "main";
  const supabaseUrl   = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!commitMessage || !supabaseUrl || !supabaseKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/rpc/log_deployment_changelog`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "apikey":        supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        p_secret:         "KGE-CHANGELOG-2026",
        p_commit_message: commitMessage,
        p_deployment_id:  deploymentId,
        p_branch:         branch,
      }),
    });
  } catch {
    // Never crash the app over a changelog write
  }
}
