"use client";
import { useState, useEffect, useCallback } from "react";

type Member = { id:string; display_name:string; frat_name:string; role:string; sl_name:string };
type Pledge = {
  id:string; sl_name:string; display_name:string; pledge_name:string|null;
  pledge_start:string|null; pledge_end_date:string|null; pledge_duration_days:number; pledge_status:string; created_at:string;
};

const input: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", outline:"none", boxSizing:"border-box" };
const lbl: React.CSSProperties = { display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.6)", marginBottom:"0.4rem" };

const STATUS_CFG: Record<string,{label:string;color:string;bg:string}> = {
  active:         { label:"Pledging",         color:"#35df24", bg:"rgba(53,223,36,0.08)" },
  not_successful: { label:"Not Successful",   color:"#ff6baa", bg:"rgba(255,107,170,0.08)" },
  complete:       { label:"✓ Complete",        color:"#D4AF37", bg:"rgba(212,175,55,0.08)" },
  rejected:       { label:"Rejected",          color:"rgba(245,237,216,0.3)", bg:"rgba(245,237,216,0.04)" },
};

export default function PledgesSection({ member }: { member: Member }) {
  const [pledges, setPledges]   = useState<Pledge[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<string|null>(null);
  const [msg, setMsg]           = useState<{id:string;text:string;ok:boolean}|null>(null);

  // Edit form state
  const [ePledgeName, setEPledgeName] = useState("");
  const [eStartDate,  setEStartDate]  = useState("");
  const [eEndDate,    setEEndDate]    = useState("");
  const [eSaving,     setESaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/pledges");
    const d = await r.json();
    setPledges(d.pledges || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (p: Pledge) => {
    setEditing(p.id);
    setEPledgeName(p.pledge_name || "");
    setEStartDate(p.pledge_start ? p.pledge_start.slice(0,10) : "");
    setEEndDate(p.pledge_end_date || "");
  };

  const saveDetails = async (id: string) => {
    setESaving(true);
    const r = await fetch("/api/pledges", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ member_id: id, pledge_name: ePledgeName||null, start_date: eStartDate||null, end_date: eEndDate||null })
    });
    setESaving(false);
    if (r.ok) { setEditing(null); load(); setMsg({id, text:"Details saved.", ok:true}); }
    else setMsg({id, text:"Failed to save.", ok:false});
  };

  const action = async (id: string, status: string, label: string) => {
    if (!confirm(`Mark this pledge as "${label}"?`)) return;
    const r = await fetch("/api/pledges", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ member_id: id, pledge_status: status })
    });
    if (r.ok) { load(); setMsg({id, text:`Marked as ${label}.`, ok:true}); }
    else setMsg({id, text:"Action failed.", ok:false});
  };

  const daysLeft = (p: Pledge) => {
    if (!p.pledge_start || !p.pledge_duration_days) return null;
    const end = new Date(new Date(p.pledge_start).getTime() + p.pledge_duration_days * 86400000);
    const diff = Math.ceil((end.getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"1.6rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#D4AF37", marginBottom:"0.35rem" }}>Kappa Gamma Eta</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Pledges</div>
          <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)" }}>Manage active pledges — set names, timelines, and process decisions</div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding:"3rem", textAlign:"center", color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>Loading pledges…</div>
      ) : pledges.length === 0 ? (
        <div style={{ padding:"3rem", textAlign:"center", background:"#120709", border:"1px solid rgba(212,175,55,0.1)" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>🌸</div>
          <p style={{ color:"rgba(245,237,216,0.35)", fontStyle:"italic" }}>No active pledges at this time.</p>
          <p style={{ color:"rgba(245,237,216,0.25)", fontSize:"0.85rem" }}>When an application is accepted, the pledge will appear here.</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
          {pledges.map(p => {
            const cfg = STATUS_CFG[p.pledge_status] || STATUS_CFG.active;
            const days = daysLeft(p);
            const isEditing = editing === p.id;
            const isActive = p.pledge_status === "active" || p.pledge_status === "not_successful";

            return (
              <div key={p.id} style={{ background:"#120709", border:"1px solid rgba(212,175,55,0.14)", overflow:"hidden", position:"relative" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)" }} />
                <div style={{ padding:"1.5rem" }}>
                  {/* Top row */}
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"0.8rem", marginBottom:"1rem" }}>
                    <div>
                      <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1rem", color:"#F5EDD8", marginBottom:"0.2rem" }}>
                        {p.pledge_name || p.display_name}
                      </div>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.15em", color:"rgba(245,237,216,0.35)", textTransform:"uppercase" }}>
                        @{p.sl_name}
                        {p.pledge_name && <span style={{ color:"rgba(212,175,55,0.4)", marginLeft:"0.6rem" }}>· {p.display_name}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", padding:"0.25rem 0.7rem", background:cfg.bg, border:`1px solid ${cfg.color}40`, color:cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Timer info */}
                  <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap", marginBottom:"1.2rem" }}>
                    {p.pledge_start && (
                      <div>
                        <div style={lbl}>Started</div>
                        <div style={{ color:"rgba(245,237,216,0.6)", fontSize:"0.9rem" }}>{new Date(p.pledge_start).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</div>
                      </div>
                    )}
                    <div>
                      <div style={lbl}>Duration</div>
                      <div style={{ color:"rgba(245,237,216,0.6)", fontSize:"0.9rem" }}>{p.pledge_duration_days} days</div>
                    </div>
                    {days !== null && (
                      <div>
                        <div style={lbl}>Days Remaining</div>
                        <div style={{ color: days < 0 ? "#ff6baa" : days < 7 ? "#D4AF37" : "#35df24", fontSize:"0.9rem", fontFamily:"'Cinzel',serif" }}>
                          {days < 0 ? "Overdue" : `${days} days`}
                        </div>
                      </div>
                    )}
                  </div>

                  {msg?.id === p.id && (
                    <div style={{ marginBottom:"1rem", padding:"0.5rem 0.8rem", background: msg.ok ? "rgba(53,223,36,0.08)" : "rgba(255,107,170,0.08)", border:`1px solid ${msg.ok ? "rgba(53,223,36,0.2)" : "rgba(255,107,170,0.2)"}`, color: msg.ok ? "#35df24" : "#ff6baa", fontSize:"0.85rem" }}>
                      {msg.text}
                    </div>
                  )}

                  {/* Edit form */}
                  {isEditing ? (
                    <div style={{ borderTop:"1px solid rgba(212,175,55,0.1)", paddingTop:"1.2rem" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
                        <div>
                          <label style={lbl}>Pledge Name</label>
                          <input id="field-42" name="field-42" value={ePledgeName} onChange={e=>setEPledgeName(e.target.value)} placeholder="e.g. Rose of the East" style={input} />
                        </div>
                        <div>
                          <label style={lbl}>Start Date</label>
                          <input id="field-43" name="field-43" type="date" value={eStartDate} onChange={e=>setEStartDate(e.target.value)} style={{...input, colorScheme:"dark"}} />
                        </div>
                        <div>
                          <label style={lbl}>End Date</label>
                          <input id="field-44" name="field-44" type="date" value={eEndDate} onChange={e=>setEEndDate(e.target.value)} style={{...input, colorScheme:"dark"}} />
                        </div>
                        {eStartDate && eEndDate && (
                          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", paddingTop:"0.3rem" }}>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)" }}>Duration:</span>
                            <span style={{ color:"#D4AF37", fontFamily:"'Cinzel',serif", fontSize:"0.7rem" }}>
                              {Math.max(0, Math.ceil((new Date(eEndDate).getTime() - new Date(eStartDate).getTime()) / 86400000))} days
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:"0.8rem" }}>
                        <button onClick={()=>saveDetails(p.id)} disabled={eSaving} style={{ padding:"0.55rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", background:"rgba(212,175,55,0.15)", border:"1px solid rgba(212,175,55,0.4)", color:"#fff0a0", cursor:"pointer" }}>
                          {eSaving ? "Saving…" : "Save"}
                        </button>
                        <button onClick={()=>setEditing(null)} style={{ padding:"0.55rem 1rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", background:"none", border:"1px solid rgba(245,237,216,0.15)", color:"rgba(245,237,216,0.4)", cursor:"pointer" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ borderTop:"1px solid rgba(212,175,55,0.08)", paddingTop:"1rem", display:"flex", gap:"0.7rem", flexWrap:"wrap" }}>
                      <button onClick={()=>openEdit(p)} style={{ padding:"0.45rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.14em", textTransform:"uppercase", background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.25)", color:"#D4AF37", cursor:"pointer" }}>
                        ✎ Edit Details
                      </button>
                      {isActive && (<>
                        <button onClick={()=>action(p.id,"complete","Pledge Complete")} style={{ padding:"0.45rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.14em", textTransform:"uppercase", background:"rgba(53,223,36,0.08)", border:"1px solid rgba(53,223,36,0.3)", color:"#35df24", cursor:"pointer" }}>
                          ✓ Pledge Complete
                        </button>
                        <button onClick={()=>action(p.id,"not_successful","Not Successful")} style={{ padding:"0.45rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.14em", textTransform:"uppercase", background:"rgba(255,107,170,0.06)", border:"1px solid rgba(255,107,170,0.25)", color:"#ff6baa", cursor:"pointer" }}>
                          ⏳ Not Successful
                        </button>
                        <button onClick={()=>action(p.id,"rejected","Pledging Rejected")} style={{ padding:"0.45rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.14em", textTransform:"uppercase", background:"rgba(123,3,35,0.1)", border:"1px solid rgba(123,3,35,0.35)", color:"rgba(245,237,216,0.4)", cursor:"pointer" }}>
                          ✕ Rejected
                        </button>
                      </>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
