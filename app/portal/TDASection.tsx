"use client";
import { useState, useEffect, useCallback } from "react";

type Tab = "overview"|"leaderboard"|"submit"|"my_submissions"|"campaign"|"goals"|"admin_review"|"admin_adjust"|"admin_titles"|"admin_rewards"|"admin_activities";
type Member = { id:string; display_name:string; frat_name:string; role:string };
type Activity = { id:string; name:string; category:string; point_value:number; requires_proof:boolean };
type Submission = { id:string; activity_name:string; category:string; point_value:number; status:string; description:string; review_notes:string; created_at:string; member_name:string; proof_url:string; event_name:string };
type LeaderRow = { member_id:string; display_name:string; frat_name:string; rank:number; lifetime_points:number; current_points:number };
type Goal = { id:string; type:string; label:string; target:number; current:number; period_end:string };
type Sister = { id:string; display_name:string; frat_name:string; role:string };
type TitleDef = { id:string; name:string; cycle:string; description:string };
type ActiveTitle = { title_name:string; member_name:string; frat_name:string; assigned_from:string };

const CAT_COLOR: Record<string,string> = { Event:"#D4AF37", Recruitment:"#ff6baa", Social:"#7BA7D4", Campaign:"#ff9ec8", Collab:"#4DB87A", Leadership:"#C0392B", Sisterhood:"#9B59B6", General:"rgba(245,237,216,0.4)" };
const STATUS_COLOR: Record<string,string> = { pending:"#D4AF37", approved:"#4DB87A", denied:"#C0392B", needs_proof:"#ff9ec8", under_review:"#7BA7D4", cancelled:"rgba(245,237,216,0.3)" };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (d:string) => { const dt=new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };

const S = {
  card:  { background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"1.4rem 1.6rem" } as React.CSSProperties,
  input: { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", outline:"none" } as React.CSSProperties,
  btn:   (active=true) => ({ padding:"0.55rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.18em", textTransform:"uppercase" as const, background:active?"rgba(255,107,170,0.15)":"rgba(255,107,170,0.05)", border:"1px solid rgba(255,107,170,0.35)", color:"#ff9ec8", cursor:"pointer", transition:"all 0.2s", opacity:active?1:0.5 }),
  goldBtn: { padding:"0.55rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.18em", textTransform:"uppercase" as const, background:"rgba(212,175,55,0.1)", border:"1px solid rgba(212,175,55,0.3)", color:"#fff0a0", cursor:"pointer" },
  tag:   (c:string) => ({ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase" as const, padding:"0.18rem 0.5rem", border:`1px solid ${c}40`, background:`${c}15`, color:c }),
};

const isAdmin = (role:string) => ["Admin","Founder"].includes(role);

// ── TDA Rewards leaderboard state ─────────────────────────────
function TDARewards({ member }: { member: Member }) {
  const [board,    setBoard]    = useState<{rank:number;member_id:string;member_name:string;sl_name:string;total_points:number}[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [issuing,  setIssuing]  = useState<string|null>(null);
  const [msg,      setMsg]      = useState("");
  const [month,    setMonth]    = useState(() => {
    const d = new Date();
    return d.toLocaleString("en-GB",{month:"long",year:"numeric"});
  });

  useEffect(() => {
    fetch("/api/tda/rewards").then(r=>r.json()).then(d => {
      setBoard(d?.leaderboard || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const issue = async (memberId: string, title: string) => {
    const name = board.find(b=>b.member_id===memberId)?.member_name || "";
    if (!confirm(`Award ${title} title to ${name} for ${month}?\n\nThis will:\n• ${title==="Elite"?"Post Sister of the Month to The Chalice\n• ":""}Reset ALL sisters' TDA points to 0\n• Notify all sisters`)) return;
    setIssuing(memberId + title);
    const r = await fetch("/api/tda/rewards", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ member_id: memberId, title, month }) });
    let d = null;
    try { d = await r.json(); } catch(e) {}
    setIssuing(null);
    if (d?.success) {
      setMsg(`✓ ${title} awarded to ${d.awarded_to}. All points reset.`);
      setBoard(prev => prev.map(b => ({ ...b, total_points: 0 })));
    } else {
      setMsg("⚠ " + (d?.error || JSON.stringify(d) || "null response"));
    }
  };

  const lbl: React.CSSProperties = { fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)" };
  const input: React.CSSProperties = { padding:"0.6rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.25)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", outline:"none" };

  return (
    <div>
      <div style={{ marginBottom:"1.6rem" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#D4AF37", marginBottom:"0.35rem" }}>Founder / Admin Only</div>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Monthly Reward</div>
        <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)", marginTop:"0.3rem" }}>Award Elite & Diamond — resets all sister points</div>
      </div>

      {/* Month label */}
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.6rem", flexWrap:"wrap" }}>
        <label htmlFor="reward-month" style={lbl}>Reward Month</label>
        <input id="reward-month" name="reward-month" value={month} onChange={e=>setMonth(e.target.value)} style={{...input, width:160}} />
      </div>

      {msg && (
        <div style={{ marginBottom:"1.2rem", padding:"0.7rem 1rem", background: msg.startsWith("✓") ? "rgba(53,223,36,0.08)" : "rgba(255,107,170,0.08)", border:`1px solid ${msg.startsWith("✓") ? "rgba(53,223,36,0.25)" : "rgba(255,107,170,0.25)"}`, color: msg.startsWith("✓") ? "#35df24" : "#ff6baa", fontSize:"0.9rem" }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ padding:"2rem", textAlign:"center", color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>Loading leaderboard…</div>
      ) : board.length === 0 ? (
        <div style={{ padding:"2rem", textAlign:"center", color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>No TDA points recorded yet.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"0.8rem" }}>
          {board.slice(0,10).map((s, idx) => {
            const isElite   = idx === 0;
            const isDiamond = idx === 1;
            const colour    = isElite ? "#D4AF37" : isDiamond ? "#75ffff" : "rgba(245,237,216,0.4)";
            return (
              <div key={s.member_id} style={{ background:"#120709", border:`1px solid ${isElite ? "rgba(212,175,55,0.3)" : isDiamond ? "rgba(117,255,255,0.15)" : "rgba(212,175,55,0.08)"}`, padding:"1rem 1.4rem", display:"flex", alignItems:"center", gap:"1.2rem", flexWrap:"wrap" }}>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.3rem", color:colour, minWidth:32, textAlign:"center" }}>
                  {isElite ? "✦" : isDiamond ? "💎" : `#${idx+1}`}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.7rem", color:"#F5EDD8", marginBottom:"0.2rem" }}>{s.member_name}</div>
                  <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.35)" }}>@{s.sl_name}</div>
                </div>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.1rem", color:colour, minWidth:60, textAlign:"right" }}>
                  {s.total_points} pts
                </div>
                {(isElite || isDiamond) && (
                  <button
                    onClick={()=>issue(s.member_id, isElite ? "Elite" : "Diamond")}
                    disabled={issuing !== null}
                    style={{ padding:"0.45rem 1rem", fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.14em", textTransform:"uppercase",
                      background: isElite ? "rgba(212,175,55,0.12)" : "rgba(117,255,255,0.08)",
                      border:`1px solid ${isElite ? "rgba(212,175,55,0.4)" : "rgba(117,255,255,0.25)"}`,
                      color: isElite ? "#D4AF37" : "#75ffff", cursor:"pointer" }}>
                    {issuing === s.member_id+(isElite?"Elite":"Diamond") ? "Issuing…" : `Award ${isElite ? "✦ Elite" : "💎 Diamond"}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop:"1.5rem", padding:"0.8rem 1rem", background:"rgba(123,3,35,0.08)", border:"1px solid rgba(123,3,35,0.15)" }}>
        <p style={{ margin:0, fontSize:"0.8rem", color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>
          Awarding Elite posts Sister of the Month to The Chalice &amp; notifies all sisters. Both titles reset ALL sister points to 0. L$5,000 is handled by Founder in-world.
        </p>
      </div>
    </div>
  );
}

export default function TDASection({ member, eventAttendance, onAttendanceUpdate }: { member: Member; eventAttendance: {weekly:number;monthly:number;yearly:number}|null; onAttendanceUpdate: (a:{weekly:number;monthly:number;yearly:number})=>void }) {
  const [tab, setTab]                 = useState<Tab>("overview");
  const [activityList, setActivityList] = useState<{id:string;name:string;category:string;point_value:number;requires_proof:boolean;is_active:boolean}[]>([]);
  const [actName,    setActName]      = useState("");
  const [actCat,     setActCat]       = useState("Sisterhood");
  const [actPts,     setActPts]       = useState(10);
  const [actProof,   setActProof]     = useState(false);
  const [actMsg,     setActMsg]       = useState("");
  const [overview, setOverview]       = useState<Record<string,unknown>|null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [activities, setActivities]   = useState<Activity[]>([]);
  const [mySubmissions, setMySubs]    = useState<Submission[]>([]);
  const [pending, setPending]         = useState<Submission[]>([]);
  const [campaign, setCampaign]       = useState<Record<string,unknown>|null>(null);
  const [goals, setGoals]             = useState<Goal[]>([]);
  const [titles, setTitles]           = useState<ActiveTitle[]>([]);
  const [transactions, setTransactions] = useState<Record<string,unknown>[]>([]);
  const [sisters, setSisters]         = useState<Sister[]>([]);
  const [titleDefs, setTitleDefs]     = useState<TitleDef[]>([]);

  // Submit form
  const [selActivity, setSelActivity] = useState<Activity|null>(null);
  const [desc, setDesc]               = useState("");
  const [proof, setProof]             = useState("");
  const [eventName, setEventName]     = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [submitMsg, setSubmitMsg]     = useState("");

  // Admin adjust form
  const [adjMember, setAdjMember]     = useState("");
  const [adjPoints, setAdjPoints]     = useState("");
  const [adjReason, setAdjReason]     = useState("");
  const [adjType,   setAdjType]   = useState("bonus");
  const [adjTarget, setAdjTarget] = useState("both");
  const [adjMsg, setAdjMsg]           = useState("");

  // Admin title form
  const [selTitle, setSelTitle]       = useState("");
  const [selTitleMember, setSelTitleMember] = useState("");
  const [titleMsg, setTitleMsg]       = useState("");

  const fetch_ = useCallback(async (type:string) => {
    const r = await fetch(`/api/tda?type=${type}`);
    return r.json();
  }, []);

  useEffect(() => {
    fetch_("overview").then(setOverview);
    fetch_("leaderboard").then(setLeaderboard);
    fetch_("campaign").then(setCampaign);
    fetch_("goals").then(setGoals);
    fetch_("titles").then(setTitles);
    fetch_("activities").then(setActivities);
  }, [fetch_]);

  const loadTab = useCallback(async (t:Tab) => {
    setTab(t);
    if (t === "admin_activities") {
      const r = await fetch("/api/tda/activities");
      const d = await r.json();
      setActivityList(d.activities || []);
    }
    if (t==="my_submissions")  fetch_("my_submissions").then(setMySubs);
    if (t==="admin_review")    fetch_("pending").then(setPending);
    if (t==="admin_adjust")  { fetch_("sisters").then(setSisters); }
    if (t==="admin_titles")  { fetch_("sisters").then(setSisters); fetch_("tda_title_list").then(setTitleDefs); }
    if (t==="submit")          fetch_("activities").then(setActivities);
    if (t==="overview")      { fetch_("overview").then(setOverview); fetch_("transactions").then(setTransactions);
      fetch("/api/tda/attendance").then(r=>r.json()).then(d=>{ if(d?.weekly!=null) onAttendanceUpdate(d); }); }
  }, [fetch_]);

  const handleSubmit = async () => {
    if (!selActivity) return;
    setSubmitting(true); setSubmitMsg("");
    const r = await fetch("/api/tda", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"submit_activity", activity_id:selActivity.id, activity_name:selActivity.name, category:selActivity.category, point_value:selActivity.point_value, description:desc, proof_url:proof, event_name:eventName }) });
    const d = await r.json();
    setSubmitMsg(d.success ? "✓ Submitted! Awaiting review." : "Something went wrong.");
    if (d.success) { setSelActivity(null); setDesc(""); setProof(""); setEventName(""); fetch_("my_submissions").then(setMySubs); }
    setSubmitting(false);
  };

  const handleReview = async (id:string, status:string, notes="") => {
    await fetch("/api/tda", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"review", id, status, notes }) });
    fetch_("pending").then(setPending); fetch_("leaderboard").then(setLeaderboard); fetch_("overview").then(setOverview);
  };

  const handleAdjust = async () => {
    if (!adjMember||!adjPoints||!adjReason) { setAdjMsg("Fill all fields."); return; }
    const pts = parseInt(adjPoints); if (isNaN(pts)) { setAdjMsg("Invalid points."); return; }
    const s = sisters.find(s=>s.id===adjMember);
    const r = await fetch("/api/tda", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"manual_adjust", member_id:adjMember, member_name:s?.display_name||"", points:pts, type:adjType, reason:adjReason, target:adjTarget }) });
    const d = await r.json();
    if (d.error) { setAdjMsg("⚠ " + d.error); return; }
    setAdjMsg("✓ Adjustment applied."); setAdjPoints(""); setAdjReason("");
    fetch_("leaderboard").then(setLeaderboard); fetch_("overview").then(setOverview);
  };

  const handleAssignTitle = async () => {
    if (!selTitle||!selTitleMember) { setTitleMsg("Select title and sister."); return; }
    const t = titleDefs.find(t=>t.id===selTitle);
    const s = sisters.find(s=>s.id===selTitleMember);
    await fetch("/api/tda", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"assign_title", title_id:selTitle, title_name:t?.name||"", member_id:selTitleMember, member_name:s?.display_name||"" }) });
    setTitleMsg("✓ Title assigned!"); fetch_("titles").then(setTitles);
  };

  const bal     = overview?.balance as Record<string,number>|null;
  const tier    = overview?.tier    as Record<string,unknown>|null;
  const nextTier= overview?.next_tier as Record<string,unknown>|null;
  const rank    = overview?.rank    as number|null;
  const pending_ = overview?.pending as number;
  const myTitle  = overview?.title   as string|null;
  const camp = campaign as { campaign:Record<string,unknown>; tasks:Record<string,unknown>[]; completed:number; sisters:number }|null;

  const weeklyGoals  = goals.filter(g=>g.type==="weekly");
  const monthlyGoals = goals.filter(g=>g.type==="monthly");

  const tabs: { id:Tab; label:string; adminOnly?:boolean }[] = [
    { id:"overview",      label:"Overview" },
    { id:"leaderboard",   label:"Leaderboard" },
    { id:"submit",        label:"Submit Activity" },
    { id:"my_submissions",label:"My Submissions" },
    { id:"campaign",      label:"Campaign" },
    { id:"goals",         label:"Chapter Goals" },
    ...(isAdmin(member.role) ? [
      { id:"admin_review"      as Tab, label:"⚙ Review",      adminOnly:true },
      { id:"admin_adjust"      as Tab, label:"⚙ Adjust",      adminOnly:true },
      { id:"admin_titles"      as Tab, label:"⚙ Titles",      adminOnly:true },
      { id:"admin_rewards"     as Tab, label:"⚙ Monthly Reward", adminOnly:true },
      { id:"admin_activities"  as Tab, label:"⚙ Activities",  adminOnly:true },
    ] : []),
  ];

  const goalBar = (g:Goal) => {
    const pct = Math.min(100, Math.round((g.current/g.target)*100));
    return (
      <div key={g.id} style={{ marginBottom:"0.9rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem" }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.65)" }}>{g.label}</span>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", color:"#D4AF37" }}>{g.current} / {g.target}</span>
        </div>
        <div style={{ height:6, background:"rgba(212,175,55,0.1)", borderRadius:3 }}>
          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, var(--wine-lt), #ff6baa, #D4AF37)`, borderRadius:3, transition:"width 0.5s" }} />
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom:"1.4rem" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--wine-lt)", marginBottom:"0.3rem" }}>Kappa Gamma Eta</div>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"var(--cream)" }}>The Divine Accord</div>
        <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)" }}>Points · Recognition · Titles · Goals</div>
        <div style={{ height:1, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"1rem 0", opacity:0.3 }} />
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:"2px", marginBottom:"1.6rem", borderBottom:"1px solid rgba(212,175,55,0.14)", paddingBottom:"0.8rem" }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>loadTab(t.id)} style={{ padding:"0.45rem 1rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", border:"none", background: tab===t.id?"rgba(255,107,170,0.18)":"transparent", color: tab===t.id?"#ff9ec8": t.adminOnly?"rgba(212,175,55,0.5)":"rgba(245,237,216,0.4)", borderBottom: tab===t.id?"2px solid #ff6baa":"2px solid transparent", transition:"all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab==="overview" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.4rem" }}>
            <div style={{ ...S.card, textAlign:"center" }}>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2rem", color:"var(--wine-lt)", lineHeight:1 }}>{bal?.current_points||0}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)", marginTop:4 }}>Current Points</div>
            </div>
            <div style={{ ...S.card, textAlign:"center" }}>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2rem", color:"#ff6baa", lineHeight:1 }}>{bal?.lifetime_points||0}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)", marginTop:4 }}>Lifetime Points</div>
            </div>
            <div style={{ ...S.card, textAlign:"center" }}>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2rem", color:"#7BA7D4", lineHeight:1 }}>#{rank||"—"}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)", marginTop:4 }}>Rank</div>
            </div>
            <div style={{ ...S.card, textAlign:"center" }}>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2rem", color:"#fff0a0", lineHeight:1 }}>{pending_||0}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)", marginTop:4 }}>Pending</div>
            </div>
          </div>

          {/* Event Attendance Tracker */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.4rem" }}>
            {[
              { label:"This Week", count: eventAttendance?.weekly ?? 0, goal: 3 },
              { label:"This Month", count: eventAttendance?.monthly ?? 0, goal: 12 },
              { label:"This Year", count: eventAttendance?.yearly ?? 0, goal: 144 },
            ].map(a => (
              <div key={a.label} style={{ ...S.card, textAlign:"center", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${a.count>=a.goal?"#35df24":"rgba(212,175,55,0.4)"},transparent)` }} />
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.5rem" }}>{a.label}</div>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", lineHeight:1, marginBottom:"0.5rem" }}>
                  <span style={{ fontSize:"2rem", color: a.count >= a.goal ? "#35df24" : "#D4AF37" }}>{a.count}</span>
                  <span style={{ fontSize:"1.1rem", color:"rgba(245,237,216,0.3)" }}>/{a.goal}</span>
                </div>
                <div style={{ height:4, background:"rgba(245,237,216,0.06)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:2, background: a.count>=a.goal ? "#35df24" : "linear-gradient(90deg,#ff6baa,#D4AF37)", width:`${Math.min(100,(a.count/a.goal)*100)}%`, transition:"width 0.5s" }} />
                </div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(245,237,216,0.25)", marginTop:"0.4rem" }}>Events Attended</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem", marginBottom:"1.2rem" }}>
            {/* Tier */}
            <div style={S.card}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"0.8rem" }}>Recognition Tier</div>
              {tier ? (
                <div>
                  <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.1rem", color:"#D4AF37", marginBottom:"0.3rem" }}>{tier.name as string}</div>
                  <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.45)", marginBottom:"0.6rem" }}>{tier.reward as string}</div>
                  {nextTier && (
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem" }}>
                        <span style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.35)" }}>Next: {nextTier.name as string}</span>
                        <span style={{ fontSize:"0.78rem", color:"#D4AF37" }}>{(bal?.lifetime_points||0)} / {nextTier.points_required as number}</span>
                      </div>
                      <div style={{ height:5, background:"rgba(212,175,55,0.1)", borderRadius:3 }}>
                        <div style={{ height:"100%", borderRadius:3, background:"linear-gradient(90deg,#ff6baa,#D4AF37)", width:`${Math.min(100,((bal?.lifetime_points||0)/(nextTier.points_required as number))*100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ height:5, background:"rgba(212,175,55,0.1)", borderRadius:3 }}>
                    <div style={{ height:"100%", borderRadius:3, background:"linear-gradient(90deg,#ff6baa,#D4AF37)", width:`${Math.min(100,((bal?.lifetime_points||0)/100)*100)}%` }} />
                  </div>
                </div>
              )}
              {myTitle && <div style={{ marginTop:"0.8rem", ...S.tag("#D4AF37") }}>{myTitle}</div>}
            </div>

            {/* Recent transactions */}
            <div style={S.card}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"0.8rem" }}>Recent Activity</div>
              {transactions.length ? transactions.slice(0,5).map((t,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.45rem 0", borderBottom:"1px solid rgba(212,175,55,0.08)" }}>
                  <div>
                    <div style={{ fontSize:"0.85rem", color:"#F5EDD8" }}>{t.reason as string}</div>
                    <div style={{ fontSize:"0.72rem", color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>{fmt(t.created_at as string)}</div>
                  </div>
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.7rem", color:(t.points as number)>0?"#4DB87A":"#C0392B", flexShrink:0, marginLeft:"1rem" }}>{(t.points as number)>0?"+":""}{t.points as number}</span>
                </div>
              )) : <p style={{ fontStyle:"italic", fontSize:"0.85rem", color:"rgba(245,237,216,0.3)" }}>No activity yet — submit your first activity!</p>}
            </div>
          </div>

          {/* Weekly goals mini */}
          <div style={S.card}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>This Week's Chapter Goals</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              {weeklyGoals.map(goalBar)}
            </div>
          </div>
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {tab==="leaderboard" && (
        <div style={S.card}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>Sister Leaderboard — Lifetime Points</div>
          {leaderboard.map((s,i)=>(
            <div key={s.member_id} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"0.9rem 0", borderBottom:"1px solid rgba(212,175,55,0.1)" }}>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.2rem", color: i===0?"var(--wine-lt)":i===1?"rgba(200,200,210,0.7)":i===2?"#C87941":"rgba(245,237,216,0.3)", width:32, textAlign:"center", flexShrink:0 }}>
                {i===0?"👑":i===1?"②":i===2?"③":`#${s.rank}`}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontStyle:"italic", fontSize:"0.9rem", color:"#ff9ec8" }}>{s.frat_name}</div>
                <div style={{ fontSize:"0.8rem", color:"rgba(245,237,216,0.45)" }}>{s.display_name}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.1rem", color:"#D4AF37" }}>{s.lifetime_points}</div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)" }}>pts lifetime</div>
              </div>
            </div>
          ))}
          {!leaderboard.length && <p style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.3)", textAlign:"center", padding:"2rem 0" }}>No points earned yet — the board awaits its first queen 👑</p>}
        </div>
      )}

      {/* ── SUBMIT ACTIVITY ── */}
      {tab==="submit" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem" }}>
          <div style={S.card}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>Choose Activity</div>
            {["Event","Recruitment","Social","Campaign","Collab","Leadership","Sisterhood"].map(cat=>(
              <div key={cat} style={{ marginBottom:"0.8rem" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:CAT_COLOR[cat], marginBottom:"0.4rem" }}>{cat}</div>
                {activities.filter(a=>a.category===cat).map(a=>(
                  <div key={a.id} onClick={()=>setSelActivity(a)} style={{ padding:"0.55rem 0.8rem", marginBottom:"0.25rem", cursor:"pointer", border:`1px solid ${selActivity?.id===a.id?"rgba(255,107,170,0.5)":"rgba(212,175,55,0.1)"}`, background:selActivity?.id===a.id?"rgba(255,107,170,0.1)":"transparent", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all 0.2s" }}>
                    <span style={{ fontSize:"0.88rem", color:"#F5EDD8" }}>{a.name}{a.requires_proof&&<span style={{ marginLeft:"0.4rem", ...S.tag("#7BA7D4"), fontSize:"0.4rem" }}>proof req.</span>}</span>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color:"#D4AF37", flexShrink:0, marginLeft:"0.8rem" }}>+{a.point_value}pts</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={S.card}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>Submission Details</div>
            {selActivity ? (
              <div>
                <div style={{ background:"rgba(255,107,170,0.08)", border:"1px solid rgba(255,107,170,0.2)", padding:"0.8rem", marginBottom:"1.1rem" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#ff9ec8", marginBottom:"0.2rem" }}>{selActivity.name}</div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ ...S.tag(CAT_COLOR[selActivity.category]) }}>{selActivity.category}</span>
                    <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1rem", color:"#D4AF37" }}>+{selActivity.point_value}</span>
                  </div>
                </div>

                <div style={{ marginBottom:"0.9rem" }}>
                  <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", display:"block", marginBottom:"0.4rem" }}>Event / Context Name</label>
                  <input id="field-9" name="field-9" value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. Sisterhood Mixer May 2026" style={S.input} />
                </div>
                <div style={{ marginBottom:"0.9rem" }}>
                  <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", display:"block", marginBottom:"0.4rem" }}>Description</label>
                  <textarea id="field-10" name="field-10" value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="Brief description of your activity…" style={{ ...S.input, resize:"vertical" }} />
                </div>
                {selActivity.requires_proof && (
                  <div style={{ marginBottom:"0.9rem" }}>
                    <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,107,170,0.6)", display:"block", marginBottom:"0.4rem" }}>Proof URL (required)</label>
                    <input id="field-11" name="field-11" value={proof} onChange={e=>setProof(e.target.value)} placeholder="Link to photo, post or evidence…" style={S.input} />
                  </div>
                )}

                {submitMsg && <p style={{ fontSize:"0.85rem", color:submitMsg.startsWith("✓")?"#4DB87A":"#C0392B", fontStyle:"italic", marginBottom:"0.8rem" }}>{submitMsg}</p>}
                <button onClick={handleSubmit} disabled={submitting} style={{ ...S.btn(!submitting), width:"100%" }}>
                  {submitting ? "Submitting…" : "Submit for Review →"}
                </button>
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
                <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>⚜</div>
                <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.3)", fontSize:"0.9rem" }}>Select an activity from the left to submit it for review.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MY SUBMISSIONS ── */}
      {tab==="my_submissions" && (
        <div style={S.card}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>My Submission History</div>
          {mySubmissions.length ? mySubmissions.map(s=>(
            <div key={s.id} style={{ padding:"1rem 0", borderBottom:"1px solid rgba(212,175,55,0.1)", display:"flex", gap:"1rem", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:"0.6rem", alignItems:"center", marginBottom:"0.3rem", flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5EDD8" }}>{s.activity_name}</span>
                  <span style={S.tag(CAT_COLOR[s.category]||"rgba(245,237,216,0.4)")}>{s.category}</span>
                </div>
                {s.description && <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.4)", marginBottom:"0.25rem" }}>{s.description}</div>}
                {s.review_notes && <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>Review note: {s.review_notes}</div>}
                <div style={{ fontSize:"0.72rem", color:"rgba(245,237,216,0.25)", marginTop:"0.25rem" }}>{fmt(s.created_at)}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1rem", color:"#D4AF37", marginBottom:"0.3rem" }}>+{s.point_value}</div>
                <span style={S.tag(STATUS_COLOR[s.status]||"rgba(245,237,216,0.3)")}>{s.status}</span>
              </div>
            </div>
          )) : <p style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.3)", textAlign:"center", padding:"2rem 0" }}>No submissions yet — submit your first activity!</p>}
        </div>
      )}

      {/* ── CAMPAIGN ── */}
      {tab==="campaign" && (
        <div>
          {camp?.campaign ? (
            <div>
              <div style={{ ...S.card, marginBottom:"1.2rem", background:"linear-gradient(135deg, rgba(123,3,35,0.2), rgba(212,175,55,0.05))", border:"1px solid rgba(123,3,35,0.4)" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#ff6baa", marginBottom:"0.4rem" }}>Active Campaign — {(camp.campaign.month as number) ? `Month ${camp.campaign.month}` : ""}</div>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.3rem", color:"#F5EDD8", marginBottom:"0.3rem" }}>{camp.campaign.name as string}</div>
                <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.45)", marginBottom:"1rem" }}>{camp.campaign.focus as string}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.4rem", color:"#D4AF37" }}>{camp.completed}/{camp.campaign.tasks_target as number}</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)" }}>Tasks Done</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.4rem", color:"#ff6baa" }}>{camp.sisters}/{camp.campaign.sisters_target as number}</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)" }}>Sisters Involved</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.4rem", color:"#4DB87A" }}>{Math.round((camp.completed/(camp.campaign.tasks_target as number))*100)||0}%</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)" }}>Progress</div>
                  </div>
                </div>
                <div style={{ marginTop:"1rem", height:8, background:"rgba(212,175,55,0.1)", borderRadius:4 }}>
                  <div style={{ height:"100%", borderRadius:4, background:"linear-gradient(90deg,var(--wine-lt),#ff6baa,#D4AF37)", width:`${Math.min(100,(camp.completed/(camp.campaign.tasks_target as number))*100)}%`, transition:"width 0.5s" }} />
                </div>
              </div>

              <div style={S.card}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>Campaign Tasks</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.8rem" }}>
                  {(camp.tasks||[]).map((t:Record<string,unknown>)=>(
                    <div key={t.id as string} style={{ padding:"0.9rem 1rem", border:"1px solid rgba(212,175,55,0.14)", background:"rgba(255,107,170,0.04)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <span style={{ fontSize:"0.88rem", color:"#F5EDD8", flex:1, marginRight:"0.5rem" }}>{t.name as string}</span>
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color:"#D4AF37", flexShrink:0 }}>+{t.point_value as number}pts</span>
                      </div>
                      {(t.requires_proof as boolean) && <span style={{ ...S.tag("#7BA7D4"), fontSize:"0.4rem", marginTop:"0.4rem", display:"inline-block" }}>proof required</span>}
                    </div>
                  ))}
                </div>
                <p style={{ marginTop:"1rem", fontStyle:"italic", fontSize:"0.82rem", color:"rgba(245,237,216,0.3)" }}>Submit campaign tasks via the Submit Activity tab — select the matching campaign task from the Campaign category.</p>
              </div>
            </div>
          ) : (
            <div style={{ ...S.card, textAlign:"center", padding:"4rem 2rem" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>🏺</div>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>No active campaign</p>
            </div>
          )}
        </div>
      )}

      {/* ── CHAPTER GOALS ── */}
      {tab==="goals" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem" }}>
          <div style={S.card}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>📅 Weekly Goals</div>
            {weeklyGoals.map(goalBar)}
            {!weeklyGoals.length && <p style={{ fontStyle:"italic", fontSize:"0.85rem", color:"rgba(245,237,216,0.3)" }}>No weekly goals set.</p>}
          </div>
          <div style={S.card}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>📆 Monthly Goals</div>
            {monthlyGoals.map(goalBar)}
            {!monthlyGoals.length && <p style={{ fontStyle:"italic", fontSize:"0.85rem", color:"rgba(245,237,216,0.3)" }}>No monthly goals set.</p>}
          </div>
          {/* Active Titles */}
          <div style={{ ...S.card, gridColumn:"1 / -1" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>👑 Current Title Holders</div>
            {titles.length ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.8rem" }}>
                {titles.map((t,i)=>(
                  <div key={i} style={{ padding:"0.8rem 1rem", border:"1px solid rgba(212,175,55,0.14)", background:"rgba(212,175,55,0.04)" }}>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#D4AF37", marginBottom:"0.25rem" }}>{t.title_name}</div>
                    <div style={{ fontStyle:"italic", fontSize:"0.85rem", color:"#ff9ec8" }}>{t.frat_name}</div>
                    <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.35)" }}>{t.member_name}</div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontStyle:"italic", fontSize:"0.85rem", color:"rgba(245,237,216,0.3)" }}>No titles assigned yet.</p>}
          </div>
        </div>
      )}

      {/* ── ADMIN: REVIEW ── */}
      {tab==="admin_review" && isAdmin(member.role) && (
        <div style={S.card}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>Pending Submissions ({pending.length})</div>
          {pending.length ? pending.map(s=>(
            <div key={s.id} style={{ padding:"1rem 0", borderBottom:"1px solid rgba(212,175,55,0.1)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.5rem" }}>
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.62rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5EDD8", marginBottom:"0.2rem" }}>{s.activity_name}</div>
                  <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.3rem" }}>
                    <span style={S.tag(CAT_COLOR[s.category]||"rgba(245,237,216,0.4)")}>{s.category}</span>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", color:"rgba(245,237,216,0.4)" }}>{s.member_name} · {fmt(s.created_at)}</span>
                  </div>
                  {s.description && <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.4)", marginBottom:"0.2rem" }}>{s.description}</div>}
                  {s.proof_url && <div style={{ fontSize:"0.78rem", color:"#7BA7D4" }}>Proof: {s.proof_url}</div>}
                  {s.event_name && <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.3)" }}>Event: {s.event_name}</div>}
                </div>
                <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.1rem", color:"#D4AF37", flexShrink:0, marginLeft:"1rem" }}>+{s.point_value}</span>
              </div>
              <div style={{ display:"flex", gap:"0.6rem" }}>
                <button onClick={()=>handleReview(s.id,"approved")} style={{ ...S.goldBtn, fontSize:"0.52rem", padding:"0.4rem 0.9rem", background:"rgba(123,3,35,0.2)", borderColor:"rgba(123,3,35,0.5)", color:"var(--wine-lt)" }}>✓ Approve</button>
                <button onClick={()=>handleReview(s.id,"needs_proof","Please provide proof.")} style={{ ...S.btn(), fontSize:"0.52rem", padding:"0.4rem 0.9rem", background:"rgba(123,167,212,0.1)", borderColor:"rgba(123,167,212,0.3)", color:"#9EC5EA" }}>Needs Proof</button>
                <button onClick={()=>handleReview(s.id,"denied","Submission denied.")} style={{ ...S.btn(), fontSize:"0.52rem", padding:"0.4rem 0.9rem", background:"rgba(192,57,43,0.1)", borderColor:"rgba(192,57,43,0.3)", color:"#E74C3C" }}>✗ Deny</button>
              </div>
            </div>
          )) : <p style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.3)", textAlign:"center", padding:"2rem 0" }}>No pending submissions — all clear! ✓</p>}
        </div>
      )}

      {/* ── ADMIN: ADJUST ── */}
      {tab==="admin_adjust" && isAdmin(member.role) && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem" }}>
          <div style={S.card}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>Manual Point Adjustment</div>
            <div style={{ marginBottom:"0.9rem" }}>
              <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", display:"block", marginBottom:"0.4rem" }}>Sister</label>
              <select id="field-12" name="field-12" value={adjMember} onChange={e=>setAdjMember(e.target.value)} style={{ ...S.input }}>
                <option value="">Select sister…</option>
                {sisters.map(s=><option key={s.id} value={s.id}>{s.frat_name} — {s.display_name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:"0.9rem" }}>
              <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", display:"block", marginBottom:"0.4rem" }}>Type</label>
              <select id="field-13" name="field-13" value={adjType} onChange={e=>setAdjType(e.target.value)} style={{ ...S.input }}>
                <option value="bonus">Bonus</option>
                <option value="manual">Manual Award</option>
                <option value="deduction">Deduction</option>
              </select>
            </div>
            <div style={{ marginBottom:"0.9rem" }}>
              <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", display:"block", marginBottom:"0.4rem" }}>Adjust Which Balance?</label>
              <select id="field-14" name="field-14" value={adjTarget} onChange={e=>setAdjTarget(e.target.value)} style={{ ...S.input }}>
                <option value="both">Both (Current + Lifetime)</option>
                <option value="current">Current Points only</option>
                <option value="lifetime">Lifetime Points only</option>
              </select>
            </div>
            <div style={{ marginBottom:"0.9rem" }}>
              <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", display:"block", marginBottom:"0.4rem" }}>Points (use negative to deduct)</label>
              <input id="field-15" name="field-15" value={adjPoints} onChange={e=>setAdjPoints(e.target.value)} type="number" placeholder="e.g. 25 or -10" style={S.input} />
            </div>
            <div style={{ marginBottom:"1rem" }}>
              <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", display:"block", marginBottom:"0.4rem" }}>Reason (required)</label>
              <input id="field-16" name="field-16" value={adjReason} onChange={e=>setAdjReason(e.target.value)} placeholder="e.g. Founder-approved bonus for event organisation" style={S.input} />
            </div>
            {adjMsg && <p style={{ fontSize:"0.85rem", color:adjMsg.startsWith("✓")?"#4DB87A":"#C0392B", fontStyle:"italic", marginBottom:"0.8rem" }}>{adjMsg}</p>}
            <button onClick={handleAdjust} style={{ ...S.goldBtn, width:"100%" }}>Apply Adjustment →</button>
          </div>

          {/* Leaderboard mini */}
          <div style={S.card}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>Current Point Totals</div>
            {leaderboard.map(s=>(
              <div key={s.member_id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.6rem 0", borderBottom:"1px solid rgba(212,175,55,0.08)" }}>
                <div>
                  <div style={{ fontStyle:"italic", fontSize:"0.85rem", color:"#ff9ec8" }}>{s.frat_name}</div>
                  <div style={{ fontSize:"0.75rem", color:"rgba(245,237,216,0.35)" }}>{s.display_name}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem", color:"#D4AF37" }}>{s.lifetime_points} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ADMIN: TITLES ── */}
      {tab==="admin_rewards" && isAdmin(member.role) && (
        <TDARewards member={member} />
      )}
      {tab==="admin_titles" && isAdmin(member.role) && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem" }}>
          <div style={S.card}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>Assign Official Title</div>
            <div style={{ marginBottom:"0.9rem" }}>
              <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", display:"block", marginBottom:"0.4rem" }}>Title</label>
              <select id="field-17" name="field-17" value={selTitle} onChange={e=>setSelTitle(e.target.value)} style={{ ...S.input }}>
                <option value="">Select title…</option>
                {titleDefs.map(t=><option key={t.id} value={t.id}>{t.name} ({t.cycle})</option>)}
              </select>
            </div>
            <div style={{ marginBottom:"1rem" }}>
              <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", display:"block", marginBottom:"0.4rem" }}>Assign to Sister</label>
              <select id="field-18" name="field-18" value={selTitleMember} onChange={e=>setSelTitleMember(e.target.value)} style={{ ...S.input }}>
                <option value="">Select sister…</option>
                {sisters.map(s=><option key={s.id} value={s.id}>{s.frat_name} — {s.display_name}</option>)}
              </select>
            </div>
            {titleMsg && <p style={{ fontSize:"0.85rem", color:titleMsg.startsWith("✓")?"#4DB87A":"#C0392B", fontStyle:"italic", marginBottom:"0.8rem" }}>{titleMsg}</p>}
            <button onClick={handleAssignTitle} style={{ ...S.goldBtn, width:"100%" }}>Assign Title →</button>
          </div>

          <div style={S.card}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>Current Title Holders</div>
            {titles.length ? titles.map((t,i)=>(
              <div key={i} style={{ padding:"0.7rem 0", borderBottom:"1px solid rgba(212,175,55,0.1)" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#D4AF37", marginBottom:"0.2rem" }}>{t.title_name}</div>
                <div style={{ fontStyle:"italic", fontSize:"0.85rem", color:"#ff9ec8" }}>{t.frat_name}</div>
                <div style={{ fontSize:"0.75rem", color:"rgba(245,237,216,0.35)" }}>Since {fmt(t.assigned_from)}</div>
              </div>
            )) : <p style={{ fontStyle:"italic", fontSize:"0.85rem", color:"rgba(245,237,216,0.3)" }}>No titles assigned yet.</p>}
          </div>
        </div>
      )}

      {/* ── ADMIN: ACTIVITIES ── */}
      {tab==="admin_activities" && isAdmin(member.role) && (
        <div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8", marginBottom:"0.4rem" }}>Manage Activities</div>
          <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)", marginBottom:"1.6rem" }}>Add new activities sisters can earn points for</div>

          {/* Add form */}
          <div style={{ background:"#120709", border:"1px solid rgba(212,175,55,0.15)", padding:"1.4rem", marginBottom:"1.8rem" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.6)", marginBottom:"1rem" }}>Add New Activity</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
              <div>
                <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)", marginBottom:"0.4rem" }}>Activity Name</label>
                <input value={actName} onChange={e=>setActName(e.target.value)} placeholder="e.g. Post on Social Media" style={{ width:"100%", background:"rgba(245,237,216,0.04)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", padding:"0.55rem 0.8rem", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", boxSizing:"border-box" }} />
              </div>
              <div>
                <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)", marginBottom:"0.4rem" }}>Category</label>
                <select value={actCat} onChange={e=>setActCat(e.target.value)} style={{ width:"100%", background:"#120709", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", padding:"0.55rem 0.8rem", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", boxSizing:"border-box" }}>
                  {["Sisterhood","Event","Campaign","Collab"].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.2rem" }}>
              <div>
                <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)", marginBottom:"0.4rem" }}>Points</label>
                <input type="number" min={1} max={100} value={actPts} onChange={e=>setActPts(parseInt(e.target.value)||0)} style={{ width:"100%", background:"rgba(245,237,216,0.04)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", padding:"0.55rem 0.8rem", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", boxSizing:"border-box" }} />
              </div>
              <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:"0.1rem" }}>
                <label style={{ display:"flex", alignItems:"center", gap:"0.6rem", cursor:"pointer" }}>
                  <input type="checkbox" checked={actProof} onChange={e=>setActProof(e.target.checked)} />
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.5)" }}>Requires Proof</span>
                </label>
              </div>
            </div>
            {actMsg && <p style={{ fontSize:"0.85rem", color:actMsg.startsWith("✓")?"#4DB87A":"#C0392B", fontStyle:"italic", marginBottom:"0.8rem" }}>{actMsg}</p>}
            <button onClick={async ()=>{
              if (!actName.trim()) { setActMsg("⚠ Activity name is required"); return; }
              if (actPts < 1)      { setActMsg("⚠ Points must be at least 1"); return; }
              setActMsg("");
              const r = await fetch("/api/tda/activities", { method:"POST", headers:{"Content-Type":"application/json"},
                body: JSON.stringify({ name:actName.trim(), category:actCat, point_value:actPts, requires_proof:actProof }) });
              const d = await r.json();
              if (d.error) { setActMsg("⚠ " + d.error); return; }
              setActMsg("✓ Activity added!");
              setActName(""); setActPts(10); setActProof(false);
              const r2 = await fetch("/api/tda/activities");
              const d2 = await r2.json();
              setActivityList(d2.activities || []);
            }} style={{ padding:"0.55rem 1.4rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.15em", textTransform:"uppercase", background:"rgba(255,107,170,0.15)", border:"1px solid rgba(255,107,170,0.4)", color:"#ff9ec8", cursor:"pointer" }}>
              + Add Activity
            </button>
          </div>

          {/* Existing activities grouped by category */}
          {["Sisterhood","Event","Campaign","Collab"].map(cat => {
            const catActs = activityList.filter(a=>a.category===cat);
            if (!catActs.length) return null;
            return (
              <div key={cat} style={{ marginBottom:"1.4rem" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", borderBottom:"1px solid rgba(212,175,55,0.1)", paddingBottom:"0.5rem", marginBottom:"0.8rem" }}>{cat}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                  {catActs.map(a=>(
                    <div key={a.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#120709", border:`1px solid ${a.is_active?"rgba(212,175,55,0.12)":"rgba(245,237,216,0.05)"}`, padding:"0.7rem 1rem", opacity:a.is_active?1:0.5 }}>
                      <div style={{ flex:1 }}>
                        <span style={{ fontSize:"0.9rem", color:a.is_active?"#F5EDD8":"rgba(245,237,216,0.4)" }}>{a.name}</span>
                        {a.requires_proof && <span style={{ marginLeft:"0.6rem", fontFamily:"'Cinzel',serif", fontSize:"0.38rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(117,255,255,0.5)", border:"1px solid rgba(117,255,255,0.2)", padding:"0.1rem 0.4rem" }}>Proof</span>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", color:"#D4AF37" }}>{a.point_value} pts</span>
                        <button onClick={async ()=>{
                          const r = await fetch("/api/tda/activities", { method:"PATCH", headers:{"Content-Type":"application/json"},
                            body: JSON.stringify({ activity_id:a.id, is_active:!a.is_active, activity_name:a.name }) });
                          const d = await r.json();
                          if (!d.error) setActivityList(prev=>prev.map(x=>x.id===a.id?{...x,is_active:!a.is_active}:x));
                        }} style={{ padding:"0.3rem 0.7rem", fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", border:`1px solid ${a.is_active?"rgba(192,57,43,0.3)":"rgba(77,184,122,0.3)"}`, background:a.is_active?"rgba(192,57,43,0.08)":"rgba(77,184,122,0.08)", color:a.is_active?"rgba(192,57,43,0.7)":"#4DB87A" }}>
                          {a.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
