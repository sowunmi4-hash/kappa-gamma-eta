"use client";
import { useState, useEffect, useCallback } from "react";

type Member = { id:string; display_name:string; frat_name:string; role:string; sl_name:string };
type DueRow  = { period:string; amount_due:number; total_paid:number; remaining:number; credit:number; status:string; due_date:string; payments:Payment[] };
type Payment = { amount:number; date:string; method:string };
type Report  = { member_name:string; frat_name:string; sl_name:string; period:string; amount_due:number; total_paid:number; remaining:number; status:string; due_date:string };
type Period  = { period:string; amount:number; description:string; due_date:string };
type PeriodSummary = { id:string; period:string; amount:number; is_active:boolean };

const STATUS_CFG: Record<string,{label:string;color:string;bg:string}> = {
  paid:    { label:"✓ Paid",    color:"#4DB87A", bg:"rgba(77,184,122,0.1)" },
  partial: { label:"⬤ Partial", color:"#D4AF37", bg:"rgba(212,175,55,0.1)" },
  unpaid:  { label:"✗ Unpaid",  color:"#ff6baa", bg:"rgba(255,107,170,0.1)" },
};
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (d:string) => { if(!d) return "—"; const dt=new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };
const isAdmin = (r:string) => ["Founder","Admin"].includes(r);

const card: React.CSSProperties = { background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"1.4rem 1.6rem", marginBottom:"1rem" };
const input: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", outline:"none" };
const lbl:   React.CSSProperties = { display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.6)", marginBottom:"0.4rem" };

export default function DuesSection({ member }: { member: Member }) {
  const [terminalLoc, setTerminalLoc] = useState<{online:boolean; region?:string; x?:number; y?:number; z?:number} | null>(null);
  useEffect(() => {
    fetch("/api/dues/terminal-location")
      .then(r => r.json())
      .then(setTerminalLoc)
      .catch(() => setTerminalLoc({ online: false }));
  }, []);
  const [dues,      setDues]      = useState<DueRow[]>([]);
  const [report,    setReport]    = useState<Report[]>([]);
  const [period,    setPeriod]    = useState<Period|null>(null);
  const [tab,       setTab]       = useState<"mine"|"report"|"create">(isAdmin(member.role)?"report":"mine");
  const [periods,   setPeriods]   = useState<Period[]>([]);
  const [selPeriod, setSelPeriod] = useState<string>("");
  const [showCreate,setShowCreate]= useState(false);

  // Create form
  const [cPeriod,   setCPeriod]   = useState("");
  const [cAmount,   setCAmount]   = useState("");
  const [cDesc,     setCDesc]     = useState("");
  const [cDate,     setCDate]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState("");

  const loadReport = useCallback(async (p: string) => {
    const r = await fetch(`/api/dues?type=report&period=${encodeURIComponent(p)}`);
    const d = await r.json();
    setReport(d.report||[]); setPeriod(d.period||null);
    if (d.allPeriods?.length) {
      setPeriods(d.allPeriods);
    }
  }, []);

  const load = useCallback(async () => {
    if (isAdmin(member.role)) {
      const r = await fetch("/api/dues?type=report");
      const d = await r.json();
      setReport(d.report||[]); setPeriod(d.period||null);
      if (d.allPeriods?.length) {
        setPeriods(d.allPeriods);
        const active = d.allPeriods.find((p: any) => p.is_active);
        const first = d.allPeriods[0];
        const def = active?.period || first?.period || "";
        setSelPeriod(def);
        if (def) {
          const r2 = await fetch(`/api/dues?type=report&period=${encodeURIComponent(def)}`);
          const d2 = await r2.json();
          setReport(d2.report||[]);
        }
      }
    }
    const r2 = await fetch("/api/dues");
    const d2 = await r2.json();
    setDues(d2.dues||[]); if(!period) setPeriod(d2.period||null);
  }, [member.role]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cPeriod||!cAmount) { setMsg("Period and amount required."); return; }
    setSaving(true); setMsg("");
    const r = await fetch("/api/dues", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ period:cPeriod, amount:parseFloat(cAmount), description:cDesc, due_date:cDate||null }) });
    const d = await r.json();
    if (d.success) {
      setMsg("✓ Dues period created and assigned to all sisters!");
      setCPeriod(""); setCAmount(""); setCDesc(""); setCDate("");
      setShowCreate(false); load();
    } else setMsg(d.error||"Something went wrong.");
    setSaving(false);
  };

  const statusTag = (s:string) => {
    const cfg = STATUS_CFG[s]||STATUS_CFG.unpaid;
    return <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", padding:"0.22rem 0.6rem", border:`1px solid ${cfg.color}40`, background:cfg.bg, color:cfg.color }}>{cfg.label}</span>;
  };

  // Summary totals for report
  const totalDue  = report.reduce((a,r)=>a+r.amount_due,0);
  const totalPaid = report.reduce((a,r)=>a+r.total_paid,0);
  const totalOwed = report.reduce((a,r)=>a+r.remaining,0);

  return (
    <div>
      {/* Crystal Hero */}
      <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
        <style>{`
          @keyframes duesFloat {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-16px); }
          }
        `}</style>
        <img
          src="/regalia-crystal.png"
          alt="KGE Dues Terminal"
          style={{
            width:"clamp(260px,32vw,420px)",
            display:"block",
            margin:"0 auto",
            animation:"duesFloat 3.5s ease-in-out infinite",
            filter:"drop-shadow(0 0 40px rgba(255,107,170,0.7)) drop-shadow(0 0 100px rgba(255,107,170,0.35))",
            mixBlendMode:"screen",
          }}
        />
        <div style={{ marginTop:"0.8rem" }}>
          {terminalLoc?.online && terminalLoc.region ? (
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:"rgba(123,3,35,0.2)", border:"1px solid rgba(212,175,55,0.18)", padding:"0.6rem 1.4rem" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#35df24", display:"inline-block", flexShrink:0, boxShadow:"0 0 6px #35df24" }} />
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(212,175,55,0.85)" }}>
                ✦ Dues Terminal — {terminalLoc.region}{terminalLoc.x != null ? ` (${terminalLoc.x}, ${terminalLoc.y}, ${terminalLoc.z})` : ""}
              </span>
            </div>
          ) : (
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:"rgba(123,3,35,0.15)", border:"1px solid rgba(212,175,55,0.1)", padding:"0.6rem 1.4rem" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"rgba(245,237,216,0.2)", display:"inline-block", flexShrink:0 }} />
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(245,237,216,0.35)" }}>Location syncing…</span>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"1.6rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#D4AF37", marginBottom:"0.35rem" }}>Kappa Gamma Eta</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Dues</div>
        </div>
        {isAdmin(member.role) && (
          <button onClick={()=>setShowCreate(!showCreate)} style={{
            padding:"0.55rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem",
            letterSpacing:"0.18em", textTransform:"uppercase",
            background: showCreate?"rgba(212,175,55,0.1)":"rgba(212,175,55,0.12)",
            border:"1px solid rgba(212,175,55,0.35)", color:"#fff0a0", cursor:"pointer",
          }}>
            {showCreate ? "✕ Cancel" : "⚙ New Dues Period"}
          </button>
        )}
      </div>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", marginBottom:"1.4rem", opacity:0.4 }} />

      {/* Active period banner */}
      {period && (
        <div style={{ ...card, border:"1px solid rgba(212,175,55,0.3)", background:"rgba(212,175,55,0.05)", marginBottom:"1.4rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.5rem" }}>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.2rem" }}>Active Period</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.9rem", letterSpacing:"0.08em", color:"#fff0a0" }}>{period.period}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.2rem" }}>Amount</div>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.1rem", color:"#D4AF37" }}>L${period.amount}</div>
            </div>
            {period.due_date && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.2rem" }}>Due</div>
                <div style={{ fontSize:"0.88rem", color:"rgba(245,237,216,0.6)" }}>{fmt(period.due_date)}</div>
              </div>
            )}
          </div>
          {period.description && <p style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)", marginTop:"0.6rem" }}>{period.description}</p>}
          <div style={{ marginTop:"0.8rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>
            🏺 Touch the KGE Dues Terminal in-world to make payment
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && isAdmin(member.role) && (
        <form onSubmit={handleCreate} style={{ ...card, border:"1px solid rgba(212,175,55,0.25)", background:"rgba(212,175,55,0.04)", marginBottom:"1.4rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#fff0a0", marginBottom:"1.2rem" }}>New Dues Period</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
            <div>
              <label style={lbl}>Period Name *</label>
              <input value={cPeriod} onChange={e=>setCPeriod(e.target.value)} placeholder="e.g. May 2026" style={input} required />
            </div>
            <div>
              <label style={lbl}>Amount (L$) *</label>
              <input type="number" value={cAmount} onChange={e=>setCAmount(e.target.value)} placeholder="e.g. 500" style={input} required />
            </div>
            <div>
              <label style={lbl}>Due Date</label>
              <input type="date" value={cDate} onChange={e=>setCDate(e.target.value)} style={input} />
            </div>
            <div>
              <label style={lbl}>Description</label>
              <input value={cDesc} onChange={e=>setCDesc(e.target.value)} placeholder="Optional note" style={input} />
            </div>
          </div>
          <p style={{ fontStyle:"italic", fontSize:"0.82rem", color:"rgba(245,237,216,0.35)", marginBottom:"0.8rem" }}>
            Creating this period will automatically assign dues to all 6 sisters and set the terminal amount.
          </p>
          {msg && <p style={{ fontSize:"0.85rem", color:msg.startsWith("✓")?"#4DB87A":"#ff6baa", fontStyle:"italic", marginBottom:"0.8rem" }}>{msg}</p>}
          <button type="submit" disabled={saving} style={{ padding:"0.65rem 2rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", background:"rgba(212,175,55,0.15)", border:"1px solid rgba(212,175,55,0.4)", color:"#fff0a0", cursor:saving?"not-allowed":"pointer", opacity:saving?0.5:1 }}>
            {saving?"Creating…":"Create & Assign →"}
          </button>
        </form>
      )}

      {/* Tabs — only shown for admins */}
      {isAdmin(member.role) && (
        <div style={{ display:"flex", gap:2, marginBottom:"1.4rem", borderBottom:"1px solid rgba(212,175,55,0.14)" }}>
          {[["report","📊 Dues Report"],["mine","My Dues"]] .map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t as "mine"|"report")} style={{
              padding:"0.5rem 1.1rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem",
              letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer",
              border:"none", background:"transparent",
              color: tab===t?"#D4AF37":"rgba(245,237,216,0.35)",
              borderBottom: tab===t?"2px solid #D4AF37":"2px solid transparent",
              transition:"all 0.2s",
            }}>{l}</button>
          ))}
        </div>
      )}

      {/* ── DUES REPORT (founder/admin) ── */}
      {tab==="report" && isAdmin(member.role) && (
        <div>
          {/* Period dropdown */}
          {periods.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.4rem", flexWrap:"wrap" }}>
              <label style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)" }}>Viewing Period:</label>
              <select
                value={selPeriod}
                onChange={e=>{ setSelPeriod(e.target.value); loadReport(e.target.value); }}
                style={{ padding:"0.5rem 2rem 0.5rem 0.9rem", background:"#1c0d12", border:"1px solid rgba(212,175,55,0.3)", color:"#fff0a0", fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"0.1em", outline:"none", cursor:"pointer" }}
              >
                {periods.map((p:any)=>(
                  <option key={p.period} value={p.period}>
                    {p.period}{p.is_active?" (Active)":""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Summary */}
          {report.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.4rem" }}>
              {[["Total Due","L$"+totalDue,"rgba(245,237,216,0.5)"],["Collected","L$"+totalPaid,"#4DB87A"],["Outstanding","L$"+totalOwed,"#ff6baa"]].map(([l,v,c])=>(
                <div key={l} style={{ ...card, textAlign:"center", padding:"1rem" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.3rem" }}>{l}</div>
                  <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.3rem", color:c as string }}>{v}</div>
                </div>
              ))}
            </div>
          )}

          {report.length ? (
            <div>
              {report.map((r,i)=>(
                <div key={i} style={{ ...card, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.8rem" }}>
                  <div>
                    <div style={{ fontStyle:"italic", fontSize:"0.95rem", color:"#ff9ec8", marginBottom:"0.2rem" }}>{r.frat_name}</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)" }}>{r.sl_name} · {r.period}</div>
                  </div>
                  <div style={{ display:"flex", gap:"1.2rem", alignItems:"center", flexWrap:"wrap" }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>Due</div>
                      <div style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.6)" }}>L${r.amount_due}</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>Paid</div>
                      <div style={{ fontSize:"0.9rem", color:"#4DB87A" }}>L${r.total_paid}</div>
                    </div>
                    {r.remaining > 0 && (
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>Owed</div>
                        <div style={{ fontSize:"0.9rem", color:"#ff6baa" }}>L${r.remaining}</div>
                      </div>
                    )}
                    {statusTag(r.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...card, textAlign:"center", padding:"3rem" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.7rem" }}>💰</div>
              <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.3)" }}>No dues periods created yet. Use "⚙ New Dues Period" above.</p>
            </div>
          )}
        </div>
      )}

      {/* ── MY DUES (all sisters) ── */}
      {tab==="mine" && (
        <div>
          {dues.length ? dues.map((d,i)=>(
            <div key={i} style={card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem", flexWrap:"wrap", gap:"0.5rem" }}>
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5EDD8", marginBottom:"0.25rem" }}>{d.period}</div>
                  {d.due_date && <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.4)" }}>Due: {fmt(d.due_date)}</div>}
                </div>
                {statusTag(d.status)}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:d.payments?.length?"1rem":"0" }}>
                {[["Amount Due","L$"+d.amount_due,"rgba(245,237,216,0.5)"],["Paid","L$"+d.total_paid,"#4DB87A"],d.remaining>0?["Remaining","L$"+d.remaining,"#ff6baa"]:["Status","Paid ✓","#4DB87A"]].map(([l,v,c])=>(
                  <div key={l} style={{ textAlign:"center", padding:"0.8rem", background:"rgba(212,175,55,0.03)", border:"1px solid rgba(212,175,55,0.1)" }}>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(212,175,55,0.45)", marginBottom:"0.3rem" }}>{l}</div>
                    <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.1rem", color:c as string }}>{v}</div>
                  </div>
                ))}
              </div>

              {d.credit > 0 && (
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#4DB87A", marginBottom:"0.8rem" }}>
                  💙 L${d.credit} credit toward next period
                </div>
              )}

              {d.payments?.length > 0 && (
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)", marginBottom:"0.5rem" }}>Payment History</div>
                  {d.payments.map((p,pi)=>(
                    <div key={pi} style={{ display:"flex", justifyContent:"space-between", padding:"0.4rem 0", borderTop:"1px solid rgba(212,175,55,0.08)", fontSize:"0.85rem" }}>
                      <span style={{ color:"#4DB87A" }}>L${p.amount}</span>
                      <span style={{ color:"rgba(245,237,216,0.4)" }}>{p.method}</span>
                      <span style={{ color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>{fmt(p.date)}</span>
                    </div>
                  ))}
                </div>
              )}

              {d.remaining > 0 && (
                <div style={{ marginTop:"0.8rem", padding:"0.7rem 1rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(255,107,170,0.15)", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,107,170,0.6)" }}>
                  🏺 Visit the KGE Dues Terminal in-world to pay L${d.remaining}
                </div>
              )}
            </div>
          )) : (
            <div style={{ ...card, textAlign:"center", padding:"3rem" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.7rem" }}>💰</div>
              <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.3)" }}>No dues assigned yet. Check back soon.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
