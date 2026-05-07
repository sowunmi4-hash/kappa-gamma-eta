"use client";
import { useState, useEffect } from "react";

type Overview = {
  member_id:string; display_name:string; frat_name:string; role:string;
  completed:boolean; completed_at:string|null;
  sections_read:number; total_sections:number;
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (d:string) => { const dt=new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };

export default function GuideSection() {
  const [data, setData] = useState<Overview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guide?type=overview").then(r=>r.json()).then(d=>{ setData(d||[]); setLoading(false); });
  }, []);

  const completed = data.filter(s=>s.completed).length;
  const total     = data.length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:"1.6rem" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#D4AF37", marginBottom:"0.35rem" }}>Admin</div>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Orientation Guide</div>
        <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)" }}>Track which sisters have completed the sisterhood guide</div>
      </div>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", marginBottom:"1.4rem", opacity:0.4 }} />

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.6rem" }}>
        {[
          ["Sisters Enrolled", total,                     "rgba(245,237,216,0.6)"],
          ["Guide Completed",  completed,                  "#4DB87A"],
          ["Pending",          total - completed,          "#ff6baa"],
        ].map(([l,v,c])=>(
          <div key={l as string} style={{ background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"1rem", textAlign:"center" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.3rem" }}>{l}</div>
            <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.4rem", color:c as string }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Sister rows */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"3rem", fontStyle:"italic", color:"rgba(245,237,216,0.3)" }}>Loading…</div>
      ) : data.length ? data.map(s=>(
        <div key={s.member_id} style={{ background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"1.2rem 1.6rem", marginBottom:"0.8rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.8rem" }}>
          <div>
            <div style={{ fontStyle:"italic", fontSize:"0.95rem", color:"#ff9ec8", marginBottom:"0.2rem" }}>{s.frat_name}</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>{s.role}</div>
          </div>

          {/* Progress bar */}
          <div style={{ flex:1, maxWidth:200 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem" }}>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)" }}>Progress</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.08em", color:"rgba(212,175,55,0.5)" }}>{s.sections_read}/{s.total_sections}</span>
            </div>
            <div style={{ height:4, background:"rgba(212,175,55,0.1)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:2, transition:"width 0.5s",
                width: `${s.total_sections > 0 ? Math.round((s.sections_read/s.total_sections)*100) : 0}%`,
                background: s.completed ? "linear-gradient(90deg,#4DB87A,#7DEFA0)" : "linear-gradient(90deg,#D4AF37,#fff8a0)",
              }} />
            </div>
          </div>

          {/* Status */}
          {s.completed ? (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#4DB87A", marginBottom:"0.2rem" }}>✓ Completed</div>
              {s.completed_at && <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>{fmt(s.completed_at)}</div>}
            </div>
          ) : (
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", padding:"0.25rem 0.7rem", border:"1px solid rgba(255,107,170,0.25)", background:"rgba(255,107,170,0.06)", color:"rgba(255,107,170,0.6)" }}>
              {s.sections_read === 0 ? "Not Started" : "In Progress"}
            </span>
          )}
        </div>
      )) : (
        <div style={{ background:"#221018", border:"1px solid rgba(212,175,55,0.14)", textAlign:"center", padding:"3rem" }}>
          <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.3)" }}>No sisters to display yet.</p>
        </div>
      )}
    </div>
  );
}
