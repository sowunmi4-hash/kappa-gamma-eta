"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Section = {
  section_id: string; title: string; icon: string;
  description: string; sort_order: number;
  is_read: boolean; read_at: string | null;
};

export default function GuidePage() {
  const router = useRouter();
  const [sections,   setSections]   = useState<Section[]>([]);
  const [complete,   setComplete]   = useState(false);
  const [active,     setActive]     = useState(0);
  const [marking,    setMarking]    = useState(false);
  const [finishing,  setFinishing]  = useState(false);
  const [loaded,     setLoaded]     = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/guide").then(r => r.json()).then(d => {
      if (d.error) { router.replace("/login"); return; }
      if (d.complete) { router.replace("/portal"); return; }
      setSections(d.progress || []);
      setLoaded(true);
    });
  }, [router]);

  const readCount   = sections.filter(s => s.is_read).length;
  const total       = sections.length;
  const allRead     = readCount === total && total > 0;
  const progress    = total > 0 ? Math.round((readCount / total) * 100) : 0;
  const current     = sections[active];

  const markRead = async () => {
    if (!current || current.is_read || marking) return;
    setMarking(true);
    await fetch("/api/guide", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"mark_read", section_id: current.section_id }) });
    setSections(prev => prev.map((s,i) => i===active ? {...s, is_read:true} : s));
    setMarking(false);
    // Auto advance to next unread
    const nextUnread = sections.findIndex((s,i) => i > active && !s.is_read);
    if (nextUnread !== -1) setTimeout(() => { setActive(nextUnread); contentRef.current?.scrollTo(0,0); }, 400);
  };

  const finishGuide = async () => {
    setFinishing(true);
    const r = await fetch("/api/guide", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"complete" }) });
    const d = await r.json();
    if (d.success) {
      window.location.href = "/portal";
    } else {
      setFinishing(false);
    }
  };

  if (!loaded) return (
    <main style={{ minHeight:"100vh", background:"#0e0508", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)" }}>Loading your guide…</div>
    </main>
  );

  return (
    <main style={{ minHeight:"100vh", background:"#0e0508", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", display:"flex", flexDirection:"column" }}>

      {/* Top bar */}
      <div style={{ background:"#120709", borderBottom:"1px solid rgba(212,175,55,0.15)", padding:"1rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem", flexWrap:"wrap", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.9rem", color:"#D4AF37" }}>ΚΓΗ</div>
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(245,237,216,0.6)" }}>Sister Orientation Guide</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(212,175,55,0.45)" }}>{readCount} of {total} sections read</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ flex:1, maxWidth:320 }}>
          <div style={{ height:4, background:"rgba(212,175,55,0.1)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#D4AF37,#fff8a0)", borderRadius:2, transition:"width 0.5s ease" }} />
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)", marginTop:"0.3rem", textAlign:"right" }}>{progress}% complete</div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* Sidebar — section list */}
        <aside style={{ width:260, minHeight:"calc(100vh - 64px)", background:"#120709", borderRight:"1px solid rgba(212,175,55,0.12)", overflowY:"auto", flexShrink:0 }}>
          <div style={{ padding:"1rem 0" }}>
            {sections.map((s, i) => (
              <div key={s.section_id} onClick={() => { setActive(i); contentRef.current?.scrollTo(0,0); }}
                style={{ display:"flex", alignItems:"center", gap:"0.7rem", padding:"0.7rem 1.2rem", cursor:"pointer",
                  background: active===i ? "rgba(212,175,55,0.08)" : "transparent",
                  borderLeft: active===i ? "3px solid #D4AF37" : "3px solid transparent",
                  transition:"all 0.15s",
                }}
                onMouseEnter={e=>{ if(active!==i)(e.currentTarget as HTMLDivElement).style.background="rgba(212,175,55,0.04)"; }}
                onMouseLeave={e=>{ if(active!==i)(e.currentTarget as HTMLDivElement).style.background="transparent"; }}
              >
                <span style={{ fontSize:"1rem", flexShrink:0 }}>{s.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.08em", textTransform:"uppercase",
                    color: active===i ? "#F5EDD8" : "rgba(245,237,216,0.5)",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</div>
                </div>
                {/* Read indicator */}
                <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0,
                  background: s.is_read ? "#4DB87A" : "rgba(245,237,216,0.15)",
                  boxShadow: s.is_read ? "0 0 6px rgba(77,184,122,0.5)" : "none",
                }} />
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div ref={contentRef} style={{ flex:1, overflowY:"auto", padding:"2.5rem 3rem", maxWidth:720 }}>
          {current && (
            <div style={{ animation:"fadeUp 0.4s ease both" }}>

              {/* Section header */}
              <div style={{ marginBottom:"2rem" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:"0.8rem" }}>{current.icon}</div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>Section {current.sort_order} of {total}</div>
                <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.8rem", color:"#F5EDD8", marginBottom:"0.6rem", lineHeight:1.2 }}>{current.title}</h1>
                <div style={{ height:2, background:"linear-gradient(90deg,#D4AF37,rgba(212,175,55,0))", width:120, marginBottom:"1.5rem" }} />
              </div>

              {/* Description */}
              <div style={{ background:"rgba(212,175,55,0.04)", border:"1px solid rgba(212,175,55,0.14)", padding:"1.8rem 2rem", marginBottom:"2rem", lineHeight:1.9, fontSize:"1.05rem", color:"rgba(245,237,216,0.8)" }}>
                {current.description}
              </div>

              {/* Navigation */}
              <div style={{ display:"flex", gap:"1rem", alignItems:"center", flexWrap:"wrap" }}>
                {/* Previous */}
                {active > 0 && (
                  <button onClick={()=>{ setActive(active-1); contentRef.current?.scrollTo(0,0); }} style={{ padding:"0.6rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.15em", textTransform:"uppercase", background:"transparent", border:"1px solid rgba(245,237,216,0.15)", color:"rgba(245,237,216,0.4)", cursor:"pointer" }}>
                    ← Previous
                  </button>
                )}

                {/* Mark as Read */}
                {!current.is_read ? (
                  <button onClick={markRead} disabled={marking} style={{ padding:"0.7rem 1.8rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", background:"rgba(77,184,122,0.15)", border:"1px solid rgba(77,184,122,0.45)", color:"#4DB87A", cursor:marking?"not-allowed":"pointer", opacity:marking?0.5:1, transition:"all 0.2s" }}>
                    {marking ? "Saving…" : "✓ Mark as Read"}
                  </button>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.7rem 1.2rem", background:"rgba(77,184,122,0.08)", border:"1px solid rgba(77,184,122,0.25)" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#4DB87A", boxShadow:"0 0 6px rgba(77,184,122,0.5)" }} />
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#4DB87A" }}>Read</span>
                  </div>
                )}

                {/* Next */}
                {active < total - 1 && (
                  <button onClick={()=>{ setActive(active+1); contentRef.current?.scrollTo(0,0); }} style={{ padding:"0.6rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.15em", textTransform:"uppercase", background: current.is_read?"rgba(212,175,55,0.12)":"transparent", border:"1px solid rgba(212,175,55,0.25)", color:current.is_read?"#fff0a0":"rgba(212,175,55,0.45)", cursor:"pointer" }}>
                    Next →
                  </button>
                )}
              </div>

              {/* Complete guide button — only when all read */}
              {allRead && (
                <div style={{ marginTop:"2.5rem", padding:"1.8rem 2rem", background:"rgba(212,175,55,0.06)", border:"1px solid rgba(212,175,55,0.3)", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.1rem", color:"#D4AF37", marginBottom:"0.5rem" }}>You're all caught up, Sister! ✦</div>
                  <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.5)", fontSize:"0.9rem", marginBottom:"1.2rem" }}>You've read every section of the guide. Welcome to Kappa Gamma Eta.</p>
                  <button onClick={finishGuide} disabled={finishing} style={{ padding:"0.85rem 2.5rem", fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"0.25em", textTransform:"uppercase", background:"rgba(212,175,55,0.18)", border:"1px solid rgba(212,175,55,0.5)", color:"#fff0a0", cursor:finishing?"not-allowed":"pointer", opacity:finishing?0.5:1 }}>
                    {finishing ? "Entering the Sanctuary…" : "Enter the Sanctuary →"}
                  </button>
                </div>
              )}

              {/* Section dots nav */}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:"2rem" }}>
                {sections.map((s,i) => (
                  <div key={s.section_id} onClick={()=>{ setActive(i); contentRef.current?.scrollTo(0,0); }}
                    title={s.title}
                    style={{ width:10, height:10, borderRadius:"50%", cursor:"pointer",
                      background: s.is_read ? "#4DB87A" : active===i ? "#D4AF37" : "rgba(245,237,216,0.15)",
                      transition:"all 0.2s",
                    }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </main>
  );
}
