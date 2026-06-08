"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

type Post = {
  id: string;
  frat_name: string;
  member_name: string;
  image_url: string;
  caption: string;
  created_at: string;
};

type Tab = "repday" | "campaign";

function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function CollabWallPage() {
  const [tab,      setTab]      = useState<Tab>("repday");
  const [posts,    setPosts]    = useState<Post[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [lightbox, setLightbox] = useState<Post | null>(null);

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    const r = await fetch(`/api/collab?type=${t}`);
    const d = await r.json();
    setPosts(d.posts || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(tab); }, [load, tab]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#080306", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>

      {/* ── Nav bar ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,3,6,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(123,3,35,0.3)", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1rem", color: "#D4AF37", textDecoration: "none", letterSpacing: "0.05em" }}>ΚΓΗ</a>
        <div style={{ display: "flex", gap: "2rem" }}>
          {[["Home", "/"], ["Collab Wall", "/collab"], ["Apply", "/apply"]].map(([label, href]) => (
            <a key={label} href={href} style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: href === "/collab" ? "#D4AF37" : "rgba(245,237,216,0.5)", textDecoration: "none" }}>{label}</a>
          ))}
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ paddingTop: 64, textAlign: "center", padding: "120px 2rem 60px", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(123,3,35,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(212,175,55,0.5)", marginBottom: "1rem" }}>Kappa Gamma Eta</div>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#F5EDD8", margin: "0 0 1rem", lineHeight: 1.15, fontWeight: 400 }}>
          The Collab Wall
        </h1>
        <p style={{ fontStyle: "italic", fontSize: "1.1rem", color: "rgba(245,237,216,0.4)", maxWidth: 520, margin: "0 auto", lineHeight: 1.8 }}>
          Moments of sisterhood, solidarity, and community — captured and shared with the world.
        </p>

        {/* Decorative line */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", maxWidth: 300, margin: "2rem auto 0" }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3))" }} />
          <span style={{ color: "rgba(212,175,55,0.4)", fontSize: "0.7rem" }}>✦</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(212,175,55,0.3), transparent)" }} />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0", marginBottom: "3rem", padding: "0 2rem" }}>
        {([["repday", "🌸 Rep Day", "Joint photos with our collab partners"], ["campaign", "💜 Campaign Support", "Sisters showing up for the community"]] as [Tab, string, string][]).map(([id, label, sub]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "1rem 2.5rem",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.52rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            background: tab === id ? "rgba(123,3,35,0.2)" : "transparent",
            border: `1px solid ${tab === id ? "rgba(123,3,35,0.6)" : "rgba(245,237,216,0.08)"}`,
            borderBottom: tab === id ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(245,237,216,0.08)",
            color: tab === id ? "#D4AF37" : "rgba(245,237,216,0.35)",
            cursor: "pointer",
            transition: "all 0.25s",
            textAlign: "center" as const,
          }}>
            <div>{label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.75rem", fontWeight: 400, color: tab === id ? "rgba(245,237,216,0.5)" : "rgba(245,237,216,0.2)", letterSpacing: "0.02em", textTransform: "none", marginTop: "0.25rem" }}>{sub}</div>
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 6rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "6rem", color: "rgba(245,237,216,0.25)", fontStyle: "italic", fontSize: "1.1rem" }}>
            Loading…
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1.5rem", opacity: 0.3 }}>🌸</div>
            <p style={{ fontStyle: "italic", color: "rgba(245,237,216,0.3)", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              No {tab === "repday" ? "Rep Day" : "Campaign Support"} posts yet.
            </p>
            <p style={{ fontSize: "0.9rem", color: "rgba(245,237,216,0.18)" }}>
              {tab === "repday" ? "Sisters — post your Rep Day collab photos through the portal and they'll appear here." : "Sisters — share your campaign support photos through the portal."}
            </p>
          </div>
        ) : (
          <div style={{ columns: "3 320px", columnGap: "1.5rem" }}>
            {posts.map(p => (
              <div key={p.id} onClick={() => setLightbox(p)} style={{ breakInside: "avoid", marginBottom: "1.5rem", cursor: "pointer", position: "relative", overflow: "hidden", background: "#120709", border: "1px solid rgba(123,3,35,0.2)" }}>
                {/* Hover overlay */}
                <div className="collab-overlay" style={{ position: "absolute", inset: 0, background: "rgba(8,3,6,0.55)", opacity: 0, transition: "opacity 0.25s", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.4)", padding: "0.4rem 1rem" }}>View</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url} alt={p.caption || "Collab photo"} style={{ width: "100%", display: "block", objectFit: "cover" }}
                  onMouseEnter={e => { const el = (e.currentTarget.parentElement?.querySelector(".collab-overlay") as HTMLElement); if (el) el.style.opacity = "1"; }}
                  onMouseLeave={e => { const el = (e.currentTarget.parentElement?.querySelector(".collab-overlay") as HTMLElement); if (el) el.style.opacity = "0"; }}
                />
                <div style={{ padding: "0.9rem 1rem" }}>
                  {p.caption && <p style={{ margin: "0 0 0.4rem", fontSize: "0.95rem", color: "rgba(245,237,216,0.7)", fontStyle: "italic", lineHeight: 1.5 }}>{p.caption}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.3rem" }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#ff9ec8" }}>{p.frat_name}</span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.4rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(245,237,216,0.2)" }}>{fmtDate(p.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── About KGΗ banner ── */}
      <div style={{ background: "rgba(123,3,35,0.12)", borderTop: "1px solid rgba(123,3,35,0.25)", borderBottom: "1px solid rgba(123,3,35,0.25)", padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(212,175,55,0.4)", marginBottom: "1rem" }}>About the Sisterhood</div>
        <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.3rem, 3vw, 2rem)", color: "#F5EDD8", margin: "0 0 1rem", fontWeight: 400 }}>Kappa Gamma Eta</h2>
        <p style={{ fontStyle: "italic", fontSize: "1rem", color: "rgba(245,237,216,0.4)", maxWidth: 560, margin: "0 auto 2rem", lineHeight: 1.9 }}>
          A Second Life sorority built on sisterhood, excellence, and community. We show up for our sisters and for the world around us.
        </p>
        <a href="/apply" style={{ display: "inline-block", fontFamily: "'Cinzel', serif", fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "0.8rem 2.5rem", background: "rgba(123,3,35,0.3)", border: "1px solid rgba(123,3,35,0.6)", color: "#F5EDD8", textDecoration: "none", transition: "all 0.2s" }}>
          Apply to Join →
        </a>
      </div>

      {/* ── Footer ── */}
      <footer style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid rgba(245,237,216,0.04)" }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(245,237,216,0.15)", margin: 0 }}>
          © Kappa Gamma Eta · Second Life Sorority · {new Date().getFullYear()}
        </p>
      </footer>

      {/* ── Lightbox ── */}
      {lightbox && typeof document !== "undefined" && createPortal(
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(8,3,6,0.96)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: "2rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.image_url} alt={lightbox.caption || "Collab photo"} onClick={e => e.stopPropagation()} style={{ maxWidth: "88vw", maxHeight: "78vh", objectFit: "contain", display: "block", boxShadow: "0 0 80px rgba(123,3,35,0.4)" }} />
          <div style={{ marginTop: "1.5rem", textAlign: "center" }} onClick={e => e.stopPropagation()}>
            {lightbox.caption && <p style={{ fontStyle: "italic", fontSize: "1rem", color: "rgba(245,237,216,0.6)", marginBottom: "0.5rem" }}>{lightbox.caption}</p>}
            <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", alignItems: "center" }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.46rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#ff9ec8" }}>{lightbox.frat_name}</span>
              <span style={{ color: "rgba(245,237,216,0.15)" }}>·</span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(245,237,216,0.25)" }}>{fmtDate(lightbox.created_at)}</span>
            </div>
          </div>
          <button onClick={() => setLightbox(null)} style={{ position: "fixed", top: "1.5rem", right: "1.5rem", background: "rgba(245,237,216,0.06)", border: "1px solid rgba(245,237,216,0.12)", color: "rgba(245,237,216,0.5)", fontFamily: "'Cinzel', serif", fontSize: "0.48rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.5rem 1rem", cursor: "pointer" }}>
            ✕ Close
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
