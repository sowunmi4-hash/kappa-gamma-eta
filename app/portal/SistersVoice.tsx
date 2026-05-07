"use client";
import { useState, useEffect, useCallback } from "react";

type Member = { id:string; display_name:string; frat_name:string; role:string };
type Submission = {
  id:string; category:string; description:string; related_page:string;
  status:string; admin_notes:string; member_name:string;
  reviewed_by_name:string; reviewed_at:string; created_at:string;
};

const CATEGORIES = [
  { id:"Site Issue",       icon:"🔧", label:"Site Issue",       desc:"Something is broken or not working correctly" },
  { id:"Suggestion",       icon:"💡", label:"Suggestion",        desc:"An idea or improvement for the sorority or website" },
  { id:"General Feedback", icon:"💬", label:"General Feedback",  desc:"Thoughts, feedback, or anything on your mind" },
];

const PAGES = ["Dashboard","Sisterhood","Events","The Chalice","Gallery","Notifications","My Profile","The Divine Accord","Sister's Voice","Other"];

const STATUS_CONFIG: Record<string,{ label:string; color:string; bg:string }> = {
  received:     { label:"Received",     color:"#D4AF37",              bg:"rgba(212,175,55,0.1)" },
  acknowledged: { label:"Acknowledged", color:"#7BA7D4",              bg:"rgba(123,167,212,0.1)" },
  in_progress:  { label:"In Progress",  color:"#ff9ec8",              bg:"rgba(255,107,170,0.1)" },
  resolved:     { label:"Resolved",     color:"#4DB87A",              bg:"rgba(77,184,122,0.1)" },
  dismissed:    { label:"Dismissed",    color:"rgba(245,237,216,0.3)",bg:"rgba(245,237,216,0.05)" },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (d:string) => { const dt=new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };
const isAdmin = (role:string) => ["Admin","Founder"].includes(role);

const card:  React.CSSProperties = { background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"1.4rem 1.6rem", marginBottom:"1rem" };
const input: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", outline:"none" };
const lbl:   React.CSSProperties = { display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.6)", marginBottom:"0.4rem" };

type Tab = "submit"|"mine"|"admin";

export default function SistersVoice({ member }: { member: Member }) {
  const [tab,         setTab]         = useState<Tab>("submit");
  const [category,    setCategory]    = useState("");
  const [description, setDescription] = useState("");
  const [relPage,     setRelPage]     = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitMsg,   setSubmitMsg]   = useState("");

  const [mine,        setMine]        = useState<Submission[]>([]);
  const [all,         setAll]         = useState<Submission[]>([]);

  // Admin inline edit
  const [editId,      setEditId]      = useState<string|null>(null);
  const [editStatus,  setEditStatus]  = useState("");
  const [editNotes,   setEditNotes]   = useState("");
  const [updating,    setUpdating]    = useState(false);

  const load = useCallback(async (t:Tab) => {
    if (t==="mine" || t==="submit") {
      const r = await fetch("/api/voice");
      setMine(await r.json());
    }
    if (t==="admin" && isAdmin(member.role)) {
      const r = await fetch("/api/voice?type=all");
      setAll(await r.json());
    }
  }, [member.role]);

  useEffect(() => { load(tab); }, [tab, load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category||!description) { setSubmitMsg("Please select a category and add a description."); return; }
    setSubmitting(true); setSubmitMsg("");
    const r = await fetch("/api/voice", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"submit", category, description, related_page:relPage }) });
    const d = await r.json();
    if (d.success) {
      setSubmitMsg("✓ Your voice has been heard. We'll review it shortly.");
      setCategory(""); setDescription(""); setRelPage("");
      load("mine");
    } else setSubmitMsg(d.error||"Something went wrong.");
    setSubmitting(false);
  };

  const handleUpdate = async (id:string) => {
    setUpdating(true);
    await fetch("/api/voice", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"update_status", id, status:editStatus, admin_notes:editNotes }) });
    setEditId(null); setUpdating(false);
    load("admin");
  };

  const statusTag = (s:string) => {
    const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.received;
    return <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", padding:"0.22rem 0.6rem", border:`1px solid ${cfg.color}40`, background:cfg.bg, color:cfg.color }}>{cfg.label}</span>;
  };

  const tabs: { id:Tab; label:string; adminOnly?:boolean }[] = [
    { id:"submit", label:"💙 Raise Your Voice" },
    { id:"mine",   label:"My Submissions" },
    ...(isAdmin(member.role) ? [{ id:"admin" as Tab, label:"⚙ All Reports", adminOnly:true }] : []),
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:"1.6rem" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#ff6baa", marginBottom:"0.35rem" }}>Kappa Gamma Eta</div>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Sister's Voice</div>
        <div style={{ fontStyle:"italic", fontSize:"0.9rem", color:"rgba(245,237,216,0.4)" }}>Every sister is heard. Every concern matters.</div>
      </div>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,#ff6baa,transparent)", marginBottom:"1.4rem", opacity:0.4 }} />

      {/* Tabs */}
      <div style={{ display:"flex", gap:2, marginBottom:"1.6rem", borderBottom:"1px solid rgba(212,175,55,0.14)", paddingBottom:"0.8rem" }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"0.45rem 1rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", border:"none", background: tab===t.id?"rgba(255,107,170,0.18)":"transparent", color: tab===t.id?"#ff9ec8": t.adminOnly?"rgba(212,175,55,0.5)":"rgba(245,237,216,0.4)", borderBottom: tab===t.id?"2px solid #ff6baa":"2px solid transparent", transition:"all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SUBMIT ── */}
      {tab==="submit" && (
        <div>
          {/* Category picker */}
          <div style={{ marginBottom:"1.4rem" }}>
            <label style={lbl}>What would you like to raise?</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.8rem" }}>
              {CATEGORIES.map(c=>(
                <div key={c.id} onClick={()=>setCategory(c.id)} style={{ padding:"1rem", border:`1px solid ${category===c.id?"rgba(255,107,170,0.5)":"rgba(212,175,55,0.15)"}`, background: category===c.id?"rgba(255,107,170,0.1)":"rgba(34,16,24,0.5)", cursor:"pointer", transition:"all 0.2s", textAlign:"center" }}>
                  <div style={{ fontSize:"1.6rem", marginBottom:"0.5rem" }}>{c.icon}</div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.1em", textTransform:"uppercase", color: category===c.id?"#ff9ec8":"#F5EDD8", marginBottom:"0.3rem" }}>{c.label}</div>
                  <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.4)", lineHeight:1.4 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:"1rem" }}>
              <label style={lbl}>Related Page (optional)</label>
              <select value={relPage} onChange={e=>setRelPage(e.target.value)} style={{ ...input }}>
                <option value="">— No specific page —</option>
                {PAGES.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:"1.2rem" }}>
              <label style={lbl}>Describe your concern *</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={5}
                placeholder="Be as detailed as you like. The more context you give, the better we can help…"
                style={{ ...input, resize:"vertical" }} required />
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", color:"rgba(245,237,216,0.25)", marginTop:"0.4rem", textAlign:"right" }}>{description.length} / 2000</div>
            </div>

            {submitMsg && (
              <div style={{ padding:"0.8rem 1rem", marginBottom:"1rem", border:`1px solid ${submitMsg.startsWith("✓")?"rgba(77,184,122,0.3)":"rgba(255,107,170,0.3)"}`, background:submitMsg.startsWith("✓")?"rgba(77,184,122,0.08)":"rgba(255,107,170,0.08)", fontStyle:"italic", fontSize:"0.88rem", color:submitMsg.startsWith("✓")?"#4DB87A":"#ff9ec8" }}>
                {submitMsg}
              </div>
            )}

            <button type="submit" disabled={submitting||!category} style={{ padding:"0.75rem 2rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", background: !category?"rgba(255,107,170,0.05)":"rgba(255,107,170,0.15)", border:"1px solid rgba(255,107,170,0.4)", color:"#ff9ec8", cursor:submitting||!category?"not-allowed":"pointer", opacity:!category?0.5:1 }}>
              {submitting ? "Submitting…" : "Raise Your Voice →"}
            </button>
          </form>
        </div>
      )}

      {/* ── MY SUBMISSIONS ── */}
      {tab==="mine" && (
        <div>
          {mine.length ? mine.map(s=>(
            <div key={s.id} style={card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.6rem", flexWrap:"wrap", gap:"0.5rem" }}>
                <div style={{ display:"flex", gap:"0.6rem", alignItems:"center" }}>
                  <span style={{ fontSize:"1.1rem" }}>{CATEGORIES.find(c=>c.id===s.category)?.icon||"💬"}</span>
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5EDD8" }}>{s.category}</span>
                  {s.related_page && <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)", borderLeft:"1px solid rgba(212,175,55,0.2)", paddingLeft:"0.6rem" }}>{s.related_page}</span>}
                </div>
                {statusTag(s.status)}
              </div>
              <p style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.55)", lineHeight:1.7, marginBottom:s.admin_notes?"0.7rem":"0" }}>{s.description}</p>
              {s.admin_notes && (
                <div style={{ padding:"0.7rem 1rem", background:"rgba(117,255,255,0.05)", border:"1px solid rgba(117,255,255,0.15)", marginTop:"0.7rem" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--cyan)", marginBottom:"0.3rem" }}>Admin Response</div>
                  <p style={{ fontSize:"0.88rem", color:"rgba(245,237,216,0.55)", lineHeight:1.6 }}>{s.admin_notes}</p>
                </div>
              )}
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.2)", marginTop:"0.7rem" }}>Submitted {fmt(s.created_at)}</div>
            </div>
          )) : (
            <div style={{ ...card, textAlign:"center", padding:"3rem" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>💙</div>
              <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.35)" }}>You haven't raised anything yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ── ADMIN ALL REPORTS ── */}
      {tab==="admin" && isAdmin(member.role) && (
        <div>
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginBottom:"1.2rem" }}>
            {Object.entries(STATUS_CONFIG).map(([k,v])=>(
              <span key={k} style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0.25rem 0.7rem", border:`1px solid ${v.color}40`, background:v.bg, color:v.color }}>
                {v.label}: {all.filter(s=>s.status===k).length}
              </span>
            ))}
          </div>

          {all.length ? all.map(s=>(
            <div key={s.id} style={{ ...card, borderLeft:`3px solid ${STATUS_CONFIG[s.status]?.color||"#D4AF37"}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.6rem", flexWrap:"wrap", gap:"0.5rem" }}>
                <div>
                  <div style={{ display:"flex", gap:"0.6rem", alignItems:"center", marginBottom:"0.3rem" }}>
                    <span style={{ fontSize:"1rem" }}>{CATEGORIES.find(c=>c.id===s.category)?.icon||"💬"}</span>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5EDD8" }}>{s.category}</span>
                    {s.related_page && <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)" }}>· {s.related_page}</span>}
                  </div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,107,170,0.6)" }}>From: {s.member_name}</div>
                </div>
                <div style={{ display:"flex", gap:"0.6rem", alignItems:"center" }}>
                  {statusTag(s.status)}
                  <span style={{ fontStyle:"italic", fontSize:"0.75rem", color:"rgba(245,237,216,0.25)" }}>{fmt(s.created_at)}</span>
                </div>
              </div>

              <p style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.6)", lineHeight:1.7, marginBottom:"0.8rem" }}>{s.description}</p>

              {s.admin_notes && editId!==s.id && (
                <div style={{ padding:"0.6rem 1rem", background:"rgba(117,255,255,0.05)", border:"1px solid rgba(117,255,255,0.15)", marginBottom:"0.8rem" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--cyan)", marginBottom:"0.25rem" }}>Your response</div>
                  <p style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.5)" }}>{s.admin_notes}</p>
                </div>
              )}

              {editId===s.id ? (
                <div style={{ borderTop:"1px solid rgba(212,175,55,0.14)", paddingTop:"0.9rem" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.8rem", marginBottom:"0.8rem" }}>
                    <div>
                      <label style={lbl}>Update Status</label>
                      <select value={editStatus} onChange={e=>setEditStatus(e.target.value)} style={{ ...input }}>
                        <option value="received">Received</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Response / Notes</label>
                      <input value={editNotes} onChange={e=>setEditNotes(e.target.value)} placeholder="Optional message to the sister…" style={input} />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:"0.6rem" }}>
                    <button onClick={()=>handleUpdate(s.id)} disabled={updating} style={{ padding:"0.5rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.15em", textTransform:"uppercase", background:"rgba(77,184,122,0.15)", border:"1px solid rgba(77,184,122,0.3)", color:"#4DB87A", cursor:"pointer" }}>{updating?"Saving…":"Save →"}</button>
                    <button onClick={()=>setEditId(null)} style={{ padding:"0.5rem 1rem", fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.15em", textTransform:"uppercase", background:"transparent", border:"1px solid rgba(212,175,55,0.2)", color:"rgba(245,237,216,0.35)", cursor:"pointer" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>{ setEditId(s.id); setEditStatus(s.status); setEditNotes(s.admin_notes||""); }} style={{ padding:"0.4rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.25)", color:"rgba(212,175,55,0.6)", cursor:"pointer" }}>
                  Manage →
                </button>
              )}
            </div>
          )) : (
            <div style={{ ...card, textAlign:"center", padding:"3rem" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>💙</div>
              <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.35)" }}>No reports yet — the sisters are happy!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
