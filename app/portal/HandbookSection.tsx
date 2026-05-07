"use client";
import { useState, useEffect } from "react";

type Section = {
  section_id: string; title: string; icon: string;
  description: string; sort_order: number;
  is_read: boolean; read_at: string | null;
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (d:string) => { const dt=new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };

export default function HandbookSection() {
  const [sections, setSections] = useState<Section[]>([]);
  const [active,   setActive]   = useState<string|null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/guide").then(r=>r.json()).then(d=>{
      setSections(d.progress||[]);
      if (d.progress?.length) setActive(d.progress[0].section_id);
      setLoading(false);
    });
  }, []);

  const current = sections.find(s=>s.section_id===active);
  const readCount = sections.filter(s=>s.is_read).length;

  if (loading) return <div style={{ textAlign:"center", padding:"3rem", fontStyle:"italic", color:"rgba(245,237,216,0.3)" }}>Loading handbook…</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:"1.6rem" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.6)", marginBottom:"0.35rem" }}>Reference</div>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>The Handbook</div>
        <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)" }}>A guide to every section of the sisterhood portal</div>
      </div>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", marginBottom:"1.4rem", opacity:0.4 }} />

      <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:"1.4rem", alignItems:"start" }}>

        {/* Section list */}
        <div style={{ background:"#120709", border:"1px solid rgba(212,175,55,0.12)", overflow:"hidden" }}>
          <div style={{ padding:"0.7rem 1rem", borderBottom:"1px solid rgba(212,175,55,0.1)", fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)" }}>
            {readCount}/{sections.length} sections read
          </div>
          {sections.map(s=>(
            <div key={s.section_id} onClick={()=>setActive(s.section_id)}
              style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.65rem 1rem", cursor:"pointer",
                background: active===s.section_id ? "rgba(212,175,55,0.08)" : "transparent",
                borderLeft: active===s.section_id ? "3px solid #D4AF37" : "3px solid transparent",
                borderBottom:"1px solid rgba(212,175,55,0.06)",
                transition:"all 0.15s",
              }}
              onMouseEnter={e=>{ if(active!==s.section_id)(e.currentTarget as HTMLDivElement).style.background="rgba(212,175,55,0.04)"; }}
              onMouseLeave={e=>{ if(active!==s.section_id)(e.currentTarget as HTMLDivElement).style.background="transparent"; }}
            >
              <span style={{ fontSize:"0.9rem", flexShrink:0 }}>{s.icon}</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.06em", textTransform:"uppercase",
                color: active===s.section_id ? "#F5EDD8" : "rgba(245,237,216,0.45)",
                flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>{s.title}</span>
              <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0,
                background: s.is_read ? "#4DB87A" : "rgba(245,237,216,0.12)",
                boxShadow: s.is_read ? "0 0 5px rgba(77,184,122,0.45)" : "none",
              }} />
            </div>
          ))}
        </div>

        {/* Content panel */}
        {current && (
          <div key={current.section_id} style={{ animation:"fadeUp 0.3s ease both" }}>
            <div style={{ background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"2rem" }}>

              {/* Section header */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"1rem", marginBottom:"1.4rem", flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:"2rem", marginBottom:"0.6rem" }}>{current.icon}</div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(212,175,55,0.45)", marginBottom:"0.3rem" }}>Section {current.sort_order}</div>
                  <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.3rem", color:"#F5EDD8", lineHeight:1.2 }}>{current.title}</h2>
                </div>
                {current.is_read && current.read_at && (
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#4DB87A", marginBottom:"0.2rem" }}>✓ Read during orientation</div>
                    <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>{fmt(current.read_at)}</div>
                  </div>
                )}
              </div>

              <div style={{ height:1, background:"linear-gradient(90deg,#D4AF37,rgba(212,175,55,0))", width:80, marginBottom:"1.4rem" }} />

              {/* Description */}
              <p style={{ lineHeight:1.9, fontSize:"1rem", color:"rgba(245,237,216,0.75)" }}>
                {current.description}
              </p>
            </div>

            {/* Prev / Next nav */}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:"0.8rem" }}>
              {current.sort_order > 1 && (
                <button onClick={()=>setActive(sections[current.sort_order-2].section_id)}
                  style={{ padding:"0.5rem 1rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", background:"transparent", border:"1px solid rgba(212,175,55,0.18)", color:"rgba(212,175,55,0.45)", cursor:"pointer" }}>
                  ← Previous
                </button>
              )}
              <div style={{ flex:1 }} />
              {current.sort_order < sections.length && (
                <button onClick={()=>setActive(sections[current.sort_order].section_id)}
                  style={{ padding:"0.5rem 1rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.25)", color:"rgba(212,175,55,0.6)", cursor:"pointer" }}>
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
