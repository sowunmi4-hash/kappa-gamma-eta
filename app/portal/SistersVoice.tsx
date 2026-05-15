"use client";
import { useState, useEffect, useCallback, useRef } from "react";

type Member = { id:string; display_name:string; frat_name:string; role:string };
type Submission = {
  id:string; category:string; description:string; related_page:string;
  status:string; admin_notes:string; member_name:string; frat_name:string;
  reviewed_by_name:string; reviewed_at:string; created_at:string;
};
type Message = {
  id:string; sender_name:string; sender_frat_name:string;
  is_admin:boolean; message:string; created_at:string;
};

const CATEGORIES = [
  { id:"Site Issue",       icon:"🔧", label:"Site Issue",      desc:"Something is broken or not working correctly" },
  { id:"Suggestion",       icon:"💡", label:"Suggestion",       desc:"An idea or improvement for the sisterhood or site" },
  { id:"General Feedback", icon:"💬", label:"General Feedback", desc:"Thoughts, feedback, or anything on your mind" },
];

const PAGES = ["Dashboard","Sisterhood","Events","The Chalice","Gallery","Notifications","My Profile","The Divine Accord","Sister's Voice","Dues","Regalia","Other"];

const STATUS_CFG: Record<string,{label:string;color:string;bg:string}> = {
  received:     { label:"Received",     color:"#D4AF37",              bg:"rgba(212,175,55,0.1)" },
  acknowledged: { label:"Acknowledged", color:"#7BA7D4",              bg:"rgba(123,167,212,0.1)" },
  in_progress:  { label:"In Progress",  color:"#ff9ec8",              bg:"rgba(255,107,170,0.1)" },
  resolved:     { label:"Resolved",     color:"#4DB87A",              bg:"rgba(77,184,122,0.1)" },
  dismissed:    { label:"Dismissed",    color:"rgba(245,237,216,0.3)",bg:"rgba(245,237,216,0.05)" },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (d:string) => { if(!d) return "—"; const dt=new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,"0")}`; };
const isAdmin = (r:string) => ["Admin","Founder"].includes(r);

const card:  React.CSSProperties = { background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"1.4rem 1.6rem", marginBottom:"1rem" };
const input: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", outline:"none" };
const lbl:   React.CSSProperties = { display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.6)", marginBottom:"0.4rem" };

type Tab = "submit"|"mine"|"admin";

// Thread component — shown inline on each submission
function SubmissionThread({ submission, member, onStatusChange }: {
  submission: Submission; member: Member; onStatusChange?: () => void;
}) {
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [replyText,   setReplyText]   = useState("");
  const [sending,     setSending]     = useState(false);
  const [editId,      setEditId]      = useState(false);
  const [editStatus,  setEditStatus]  = useState(submission.status);
  const [editNotes,   setEditNotes]   = useState(submission.admin_notes||"");
  const [updating,    setUpdating]    = useState(false);
  const [expanded,    setExpanded]    = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const r = await fetch(`/api/voice?type=messages&submission_id=${submission.id}`);
    const d = await r.json();
    setMessages(d);
  }, [submission.id]);

  useEffect(() => { if (expanded) loadMessages(); }, [expanded, loadMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await fetch("/api/voice", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"reply", submission_id:submission.id, message:replyText.trim() }) });
    setReplyText(""); loadMessages(); setSending(false);
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    await fetch("/api/voice", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"update_status", id:submission.id, status:editStatus, admin_notes:editNotes }) });
    setEditId(false); setUpdating(false);
    if (onStatusChange) onStatusChange();
  };

  const cfg = STATUS_CFG[submission.status]||STATUS_CFG.received;
  const canReply = !["resolved","dismissed"].includes(submission.status);
  const isSafareeElevated = member.sl_name === "safareehills" && member.is_elevated;

  return (
    <div style={card}>
      {/* Submission header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"0.5rem", marginBottom:"0.6rem" }}>
        <div style={{ display:"flex", gap:"0.6rem", alignItems:"center" }}>
          <span style={{ fontSize:"1rem" }}>{CATEGORIES.find(c=>c.id===submission.category)?.icon||"💬"}</span>
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5EDD8" }}>{submission.category}</div>
            {isAdmin(member.role) && <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,107,170,0.5)" }}>{submission.frat_name||submission.member_name}</div>}
          </div>
          {submission.related_page && <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)", borderLeft:"1px solid rgba(212,175,55,0.2)", paddingLeft:"0.6rem" }}>{submission.related_page}</span>}
        </div>
        <div style={{ display:"flex", gap:"0.6rem", alignItems:"center" }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", padding:"0.22rem 0.6rem", border:`1px solid ${cfg.color}40`, background:cfg.bg, color:cfg.color }}>{cfg.label}</span>
          <span style={{ fontStyle:"italic", fontSize:"0.75rem", color:"rgba(245,237,216,0.25)" }}>{fmt(submission.created_at)}</span>
        </div>
      </div>

      {/* Original description */}
      <div style={{ padding:"0.8rem 1rem", background:"rgba(255,107,170,0.04)", border:"1px solid rgba(255,107,170,0.1)", marginBottom:"0.8rem", borderRadius:"1px" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,107,170,0.4)", marginBottom:"0.3rem" }}>Original Report</div>
        <p style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.6)", lineHeight:1.7 }}>{submission.description}</p>
      </div>

      {/* Toggle thread */}
      <button onClick={()=>setExpanded(!expanded)} style={{
        fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.12em",
        textTransform:"uppercase", background:"transparent", border:"none",
        color:"rgba(212,175,55,0.5)", cursor:"pointer", padding:"0.3rem 0", marginBottom:expanded?"0.8rem":"0",
      }}>
        {expanded ? "▲ Hide Thread" : `▼ ${messages.length ? `View Thread (${messages.length})` : "Open Thread"}`}
      </button>

      {expanded && (
        <div>
          {/* Messages thread */}
          {messages.length > 0 && (
            <div style={{ borderLeft:"2px solid rgba(212,175,55,0.15)", paddingLeft:"1rem", marginBottom:"1rem", display:"flex", flexDirection:"column", gap:"0.7rem" }}>
              {messages.map(msg=>(
                <div key={msg.id} style={{ display:"flex", gap:"0.6rem", alignItems:"flex-start",
                  flexDirection: msg.is_admin?"row-reverse":"row" }}>
                  {/* Avatar dot */}
                  <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0,
                    background: msg.is_admin?"rgba(212,175,55,0.15)":"rgba(255,107,170,0.15)",
                    border: `1px solid ${msg.is_admin?"rgba(212,175,55,0.3)":"rgba(255,107,170,0.3)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem" }}>
                    {msg.is_admin?"⚙":"🌸"}
                  </div>
                  <div style={{ flex:1, maxWidth:"80%" }}>
                    <div style={{ display:"flex", gap:"0.5rem", alignItems:"baseline", marginBottom:"0.25rem",
                      justifyContent: msg.is_admin?"flex-end":"flex-start" }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase",
                        color: msg.is_admin?"rgba(212,175,55,0.7)":"rgba(255,107,170,0.7)" }}>{msg.sender_frat_name}</span>
                      <span style={{ fontStyle:"italic", fontSize:"0.72rem", color:"rgba(245,237,216,0.25)" }}>{fmt(msg.created_at)}</span>
                    </div>
                    <div style={{ padding:"0.7rem 0.9rem",
                      background: msg.is_admin?"rgba(212,175,55,0.06)":"rgba(255,107,170,0.06)",
                      border: `1px solid ${msg.is_admin?"rgba(212,175,55,0.15)":"rgba(255,107,170,0.12)"}`,
                      fontSize:"0.9rem", color:"rgba(245,237,216,0.65)", lineHeight:1.7,
                      borderRadius: msg.is_admin?"8px 2px 8px 8px":"2px 8px 8px 8px" }}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          {messages.length === 0 && (
            <div style={{ fontStyle:"italic", fontSize:"0.82rem", color:"rgba(245,237,216,0.25)", marginBottom:"0.8rem", textAlign:"center" }}>
              No replies yet — start the conversation below.
            </div>
          )}

          {/* Reply input */}
          {isSafareeElevated && (
        <div style={{ marginTop:"1rem", padding:"0.8rem 1rem", background:"rgba(255,107,170,0.06)", border:"1px solid rgba(255,107,170,0.2)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.8rem" }}>
          <span style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.5)", fontStyle:"italic" }}>Mark this ticket complete to revoke your elevated access.</span>
          <button onClick={async()=>{
            const r = await fetch("/api/voice", { method:"POST", headers:{"Content-Type":"application/json"},
              body: JSON.stringify({ action:"complete", ticket_id: submission.id }) });
            const d = await r.json();
            if(d?.success && onElevate) onElevate();
          }} style={{ padding:"0.45rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", background:"rgba(255,107,170,0.12)", border:"1px solid rgba(255,107,170,0.35)", color:"#ff6baa", cursor:"pointer" }}>
            ✓ Mark Complete & Revoke Access
          </button>
        </div>
      )}
      {canReply && (
            <div style={{ display:"flex", gap:"0.6rem", alignItems:"flex-end" }}>
              <textarea id="field-27" name="field-27"
                value={replyText}
                onChange={e=>setReplyText(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); handleReply(); }}}
                placeholder="Write a reply… (Enter to send, Shift+Enter for new line)"
                rows={2}
                style={{ ...input, flex:1, resize:"none" }}
              />
              <button onClick={handleReply} disabled={sending||!replyText.trim()} style={{
                padding:"0.55rem 1.1rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem",
                letterSpacing:"0.12em", textTransform:"uppercase",
                background: !replyText.trim()?"rgba(255,107,170,0.04)":"rgba(255,107,170,0.15)",
                border:`1px solid ${!replyText.trim()?"rgba(255,107,170,0.12)":"rgba(255,107,170,0.4)"}`,
                color: !replyText.trim()?"rgba(245,237,216,0.2)":"#ff9ec8",
                cursor: sending||!replyText.trim()?"not-allowed":"pointer", whiteSpace:"nowrap",
              }}>
                {sending ? "…" : "Send →"}
              </button>
            </div>
          )}

          {/* Admin: status update */}
          {isAdmin(member.role) && (
            <div style={{ marginTop:"0.8rem", borderTop:"1px solid rgba(212,175,55,0.1)", paddingTop:"0.8rem" }}>
              {!editId ? (
                <button onClick={()=>setEditId(true)} style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.12em", textTransform:"uppercase", background:"rgba(212,175,55,0.06)", border:"1px solid rgba(212,175,55,0.2)", color:"rgba(212,175,55,0.55)", cursor:"pointer", padding:"0.35rem 0.8rem" }}>
                  ⚙ Update Status
                </button>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.8rem" }}>
                  <div>
                    <label style={lbl}>Status</label>
                    <select id="field-28" name="field-28" value={editStatus} onChange={e=>setEditStatus(e.target.value)} style={input}>
                      <option value="received">Received</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Internal Note (optional)</label>
                    <input id="field-29" name="field-29" value={editNotes} onChange={e=>setEditNotes(e.target.value)} placeholder="Note visible to sister…" style={input} />
                  </div>
                  <div style={{ gridColumn:"1/-1", display:"flex", gap:"0.5rem" }}>
                    <button onClick={handleUpdateStatus} disabled={updating} style={{ padding:"0.45rem 1.1rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", background:"rgba(77,184,122,0.12)", border:"1px solid rgba(77,184,122,0.3)", color:"#4DB87A", cursor:"pointer" }}>{updating?"Saving…":"Save →"}</button>
                    <button onClick={()=>setEditId(false)} style={{ padding:"0.45rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", background:"transparent", border:"1px solid rgba(212,175,55,0.15)", color:"rgba(245,237,216,0.3)", cursor:"pointer" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SistersVoice({ member, onElevate }: { member: Member; onElevate?: () => void }) {
  const [tab,         setTab]         = useState<Tab>("submit");
  const [category,    setCategory]    = useState("");
  const [description, setDescription] = useState("");
  const [relPage,     setRelPage]     = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitMsg,   setSubmitMsg]   = useState("");
  const [accessCode,  setAccessCode]  = useState("");
  const [codeMsg,     setCodeMsg]     = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [activeCodes, setActiveCodes] = useState<{id:string;code:string;category:string;description:string;submitted_by:string;ticket_id:string;used:boolean}[]>([]);
  const isSafareehills = member.sl_name === "safareehills";
  const [mine,        setMine]        = useState<Submission[]>([]);
  const [all,         setAll]         = useState<Submission[]>([]);

  const load = useCallback(async (t:Tab) => {
    if (t==="mine"||t==="submit") {
      const r = await fetch("/api/voice");
      setMine(await r.json());
    }
    if (t==="admin"&&isAdmin(member.role)) {
      if (member.sl_name !== "safareehills") fetch("/api/voice/codes").then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setActiveCodes(d); });
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
              <select id="field-30" name="field-30" value={relPage} onChange={e=>setRelPage(e.target.value)} style={input}>
                <option value="">— No specific page —</option>
                {PAGES.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:"1.2rem" }}>
              <label style={lbl}>Describe your concern *</label>
              <textarea id="field-31" name="field-31" value={description} onChange={e=>setDescription(e.target.value)} rows={5} placeholder="Be as detailed as you like…" style={{ ...input, resize:"vertical" }} required />
            </div>
            {submitMsg && <div style={{ padding:"0.8rem 1rem", marginBottom:"1rem", border:`1px solid ${submitMsg.startsWith("✓")?"rgba(77,184,122,0.3)":"rgba(255,107,170,0.3)"}`, background:submitMsg.startsWith("✓")?"rgba(77,184,122,0.08)":"rgba(255,107,170,0.08)", fontStyle:"italic", fontSize:"0.88rem", color:submitMsg.startsWith("✓")?"#4DB87A":"#ff9ec8" }}>{submitMsg}</div>}
            <button type="submit" disabled={submitting||!category} style={{ padding:"0.75rem 2rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", background: !category?"rgba(255,107,170,0.05)":"rgba(255,107,170,0.15)", border:"1px solid rgba(255,107,170,0.4)", color:"#ff9ec8", cursor:submitting||!category?"not-allowed":"pointer", opacity:!category?0.5:1 }}>
              {submitting ? "Submitting…" : "Raise Your Voice →"}
            </button>
          </form>
        </div>
      )}

      {/* ── MY SUBMISSIONS ── */}
      {tab==="mine" && (
        mine.length ? mine.map(s=>(
          <SubmissionThread key={s.id} submission={s} member={member} onStatusChange={()=>load("mine")} />
        )) : (
          <div style={{ ...card, textAlign:"center", padding:"3rem" }}>
            <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>💙</div>
            <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.35)" }}>You haven't raised anything yet.</p>
          </div>
        )
      )}

      {/* ── ADMIN ALL REPORTS ── */}
      {/* Access code entry for Safareehills */}
      {isSafareehills && !member.is_elevated && (
        <div style={{ background:"rgba(212,175,55,0.06)", border:"1px solid rgba(212,175,55,0.2)", padding:"1.4rem", marginBottom:"1.2rem" }}>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.9rem", color:"#D4AF37", marginBottom:"0.4rem" }}>🔐 Enter Access Code</div>
          <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.5)", marginBottom:"1rem", fontStyle:"italic" }}>A Founder will share a one-time code with you to access admin functions.</div>
          <div style={{ display:"flex", gap:"0.8rem", flexWrap:"wrap" }}>
            <input id="access-code-input" name="access-code-input" value={accessCode} onChange={e=>setAccessCode(e.target.value.toUpperCase())} placeholder="KGE-XXXX" maxLength={8}
              style={{ padding:"0.6rem 1rem", background:"rgba(245,237,216,0.05)", border:"1px solid rgba(212,175,55,0.3)", color:"#F5EDD8", fontFamily:"'Cinzel',serif", fontSize:"0.9rem", letterSpacing:"0.2em", width:140, outline:"none" }} />
            <button disabled={codeLoading || accessCode.length < 8} onClick={async()=>{
              setCodeLoading(true); setCodeMsg("");
              const r = await fetch("/api/voice", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"use_code", code:accessCode }) });
              const d = await r.json();
              setCodeLoading(false);
              if(d?.success) { setCodeMsg("✓ Access granted!"); if(onElevate) onElevate(); }
              else setCodeMsg("⚠ " + (d?.error || "Invalid code"));
            }} style={{ padding:"0.6rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", background:"rgba(212,175,55,0.15)", border:"1px solid rgba(212,175,55,0.4)", color:"#D4AF37", cursor:"pointer" }}>
              {codeLoading ? "Checking…" : "Unlock Access"}
            </button>
          </div>
          {codeMsg && <div style={{ marginTop:"0.6rem", fontSize:"0.85rem", color: codeMsg.startsWith("✓") ? "#35df24" : "#ff6baa" }}>{codeMsg}</div>}
        </div>
      )}

      {/* Active codes panel — Founder only (not safareehills) */}
      {isAdmin(member.role) && member.sl_name !== "safareehills" && activeCodes.length > 0 && tab==="admin" && (
        <div style={{ background:"rgba(123,3,35,0.12)", border:"1px solid rgba(255,107,170,0.15)", padding:"1.2rem", marginBottom:"1.2rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#ff6baa", marginBottom:"0.8rem" }}>🔐 Active Access Codes — Share with Safareehills</div>
          {activeCodes.map(c2 => (
            <div key={c2.id} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"0.6rem 0", borderBottom:"0.5px solid rgba(255,107,170,0.1)", flexWrap:"wrap" }}>
              <code style={{ fontFamily:"monospace", fontSize:"1.1rem", color:"#D4AF37", letterSpacing:"0.15em", background:"rgba(212,175,55,0.1)", padding:"0.2rem 0.6rem", borderRadius:3 }}>{c2.code}</code>
              <span style={{ fontSize:"0.8rem", color:"rgba(245,237,216,0.5)" }}>{c2.category} — {c2.submitted_by}</span>
              <span style={{ fontSize:"0.75rem", fontStyle:"italic", color:"rgba(245,237,216,0.35)", flex:1 }}>{c2.description}</span>
              {c2.used && <span style={{ fontSize:"0.7rem", color:"#35df24" }}>✓ Used</span>}
            </div>
          ))}
        </div>
      )}

      {tab==="admin" && isAdmin(member.role) && (
        <div>
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginBottom:"1.2rem" }}>
            {Object.entries(STATUS_CFG).map(([k,v])=>(
              <span key={k} style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0.25rem 0.7rem", border:`1px solid ${v.color}40`, background:v.bg, color:v.color }}>
                {v.label}: {all.filter(s=>s.status===k).length}
              </span>
            ))}
          </div>
          {all.length ? all.map(s=>(
            <SubmissionThread key={s.id} submission={s} member={member} onStatusChange={()=>load("admin")} />
          )) : (
            <div style={{ ...card, textAlign:"center", padding:"3rem" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>💙</div>
              <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.35)" }}>No reports yet!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
