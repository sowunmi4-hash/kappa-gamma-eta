"use client";
import { useState, useEffect, useCallback } from "react";

type Member = { id:string; display_name:string; frat_name:string; role:string };
type Sister = { id:string; display_name:string; frat_name:string; sl_name:string; role:string };
type Prob   = { id:string; member_id:string; member_name:string; frat_name:string; reason:string; tda_points_at_time:number; started_at:string; ends_at:string; duration_days:number; set_by_name:string };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (d:string) => { const dt=new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };

const card:  React.CSSProperties = { background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"1.4rem 1.6rem", marginBottom:"1rem" };
const input: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", outline:"none" };
const lbl:   React.CSSProperties = { display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.6)", marginBottom:"0.4rem" };

function LiveCountdown({ endsAt }: { endsAt: string }) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setLeft("Expired"); return; }
      const d = Math.floor(diff/86400000);
      const h = Math.floor((diff%86400000)/3600000);
      const m = Math.floor((diff%3600000)/60000);
      setLeft(`${d}d ${h}h ${m}m`);
    };
    calc(); const t=setInterval(calc,60000); return ()=>clearInterval(t);
  }, [endsAt]);
  return <span style={{ color:"#ff6baa", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.1em" }}>{left}</span>;
}

export default function ProbationSection({ member }: { member: Member }) {
  const [sisters,     setSisters]     = useState<Sister[]>([]);
  const [probations,  setProbations]  = useState<Prob[]>([]);
  const [showForm,    setShowForm]    = useState(false);
  const [selSister,   setSelSister]   = useState("");
  const [duration,    setDuration]    = useState("7");
  const [reason,      setReason]      = useState("TDA points below 100 for the month");
  const [tdaPts,      setTdaPts]      = useState("");
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState("");

  const load = useCallback(async () => {
    const [s, p] = await Promise.all([
      fetch("/api/tda?type=sisters").then(r=>r.json()),
      fetch("/api/probation?type=all").then(r=>r.json()),
    ]);
    setSisters((s||[]).filter((x:Sister)=>!["Founder","Admin"].includes(x.role)));
    setProbations(p||[]);
  }, []);

  useEffect(()=>{ load(); }, [load]);

  const handleSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selSister||!duration) { setMsg("Select a sister and duration."); return; }
    setSaving(true); setMsg("");
    const s = sisters.find(x=>x.id===selSister);
    const r = await fetch("/api/probation", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"set", member_id:selSister, member_name:s?.display_name||"",
        frat_name:s?.frat_name||"", duration_days:parseInt(duration),
        reason, tda_points:parseInt(tdaPts)||0 }) });
    const d = await r.json();
    if (d.success) {
      setMsg("✓ Probation set."); setShowForm(false); setSelSister(""); setTdaPts(""); load();
    } else setMsg(d.error||"Something went wrong.");
    setSaving(false);
  };

  const handleLift = async (memberId:string, fratName:string) => {
    if (!confirm(`Lift probation for ${fratName}?`)) return;
    await fetch("/api/probation", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"lift", member_id:memberId }) });
    load();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"1.6rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(123,3,35,0.9)", marginBottom:"0.35rem" }}>Admin</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Probation</div>
          <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)" }}>Restrict portal access for sisters below 100 TDA points</div>
        </div>
        <button onClick={()=>{ setShowForm(!showForm); setMsg(""); }} style={{
          padding:"0.55rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem",
          letterSpacing:"0.18em", textTransform:"uppercase",
          background: showForm?"rgba(123,3,35,0.1)":"rgba(123,3,35,0.2)",
          border:"1px solid rgba(123,3,35,0.5)", color:"#ff6baa", cursor:"pointer",
        }}>
          {showForm ? "✕ Cancel" : "⚠ Place on Probation"}
        </button>
      </div>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(123,3,35,0.6),transparent)", marginBottom:"1.4rem", opacity:0.6 }} />

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSet} style={{ ...card, border:"1px solid rgba(123,3,35,0.4)", background:"rgba(123,3,35,0.06)", marginBottom:"1.4rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#ff6baa", marginBottom:"1.2rem" }}>New Probation</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lbl}>Sister *</label>
              <select value={selSister} onChange={e=>setSelSister(e.target.value)} style={input} required>
                <option value="">— Select a sister —</option>
                {sisters.map(s=>(
                  <option key={s.id} value={s.id}>{s.frat_name} ({s.sl_name})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Duration (days) *</label>
              <select value={duration} onChange={e=>setDuration(e.target.value)} style={input}>
                {[1,3,5,7,10,14,21,30].map(d=>(
                  <option key={d} value={d}>{d} day{d>1?"s":""}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>TDA Points at Time</label>
              <input type="number" value={tdaPts} onChange={e=>setTdaPts(e.target.value)} placeholder="e.g. 45" style={input} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lbl}>Reason</label>
              <input value={reason} onChange={e=>setReason(e.target.value)} style={input} />
            </div>
          </div>
          {msg && <p style={{ fontSize:"0.85rem", color:msg.startsWith("✓")?"#4DB87A":"#ff6baa", fontStyle:"italic", marginBottom:"0.8rem" }}>{msg}</p>}
          <button type="submit" disabled={saving} style={{
            padding:"0.65rem 2rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem",
            letterSpacing:"0.2em", textTransform:"uppercase",
            background:"rgba(123,3,35,0.2)", border:"1px solid rgba(123,3,35,0.5)",
            color:"#ff6baa", cursor:saving?"not-allowed":"pointer", opacity:saving?0.5:1,
          }}>
            {saving?"Placing…":"Place on Probation →"}
          </button>
        </form>
      )}

      {/* Active probations */}
      {probations.length ? (
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)", marginBottom:"0.8rem" }}>
            Active Probations ({probations.length})
          </div>
          {probations.map(p=>(
            <div key={p.id} style={{ ...card, borderLeft:"3px solid rgba(123,3,35,0.7)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"0.8rem", marginBottom:"0.7rem" }}>
                <div>
                  <div style={{ fontStyle:"italic", fontSize:"1rem", color:"#ff9ec8", marginBottom:"0.2rem" }}>{p.frat_name}</div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>
                    Set by {p.set_by_name} · {p.duration_days} day probation
                  </div>
                </div>
                <button onClick={()=>handleLift(p.member_id, p.frat_name)} style={{
                  padding:"0.4rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem",
                  letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer",
                  border:"1px solid rgba(77,184,122,0.35)", background:"rgba(77,184,122,0.08)", color:"#4DB87A",
                }}>Lift Probation</button>
              </div>
              <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.5)", marginBottom:"0.7rem" }}>{p.reason}</div>
              <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap", alignItems:"center" }}>
                {p.tda_points_at_time !== null && (
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>
                    Points: <span style={{ color:"#ff6baa" }}>{p.tda_points_at_time}</span>
                  </span>
                )}
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>
                  {fmt(p.started_at)} → {fmt(p.ends_at)}
                </span>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>
                  Time left: <LiveCountdown endsAt={p.ends_at} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...card, textAlign:"center", padding:"3rem" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.7rem" }}>✓</div>
          <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.35)" }}>No sisters are currently on probation.</p>
        </div>
      )}
    </div>
  );
}
