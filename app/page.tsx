"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

const PILLARS = [
  {
    symbol: "💙",
    greek: "Κ",
    title: "The Sisterhood",
    sub: "Five Sisters · One Bond",
    desc: "Founders, President, Sisters — every woman who carries the name",
    link: "/sisters",
    cta: "Meet The Sisters →",
    color: "#D4427A",
  },
  {
    symbol: "🏺",
    greek: "Γ",
    title: "Our Story",
    sub: "Est. 12 · 14 · 24",
    desc: "Born of Amphictyonis — the goddess of unity, wine, and shared strength",
    link: "/about",
    cta: "Read Our Story →",
    color: "#D4AF37",
  },
  {
    symbol: "💎",
    greek: "Η",
    title: "The Portal",
    sub: "Members Only",
    desc: "The private space for sisters of Kappa Gamma Eta",
    link: "/login",
    cta: "Enter Portal →",
    color: "#1AC8D4",
  },
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const petals: { x: number; y: number; size: number; speed: number; angle: number; spin: number; opacity: number; color: string }[] = [];
    const colors = ["#7BA7D4", "#D4427A", "#D4AF37", "#1AC8D4"];

    for (let i = 0; i < 28; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height + canvas.height,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 0.5 + 0.2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.3 + 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach((p) => {
        p.y -= p.speed;
        p.angle += p.spin;
        if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <main style={{ background: "var(--black)", minHeight: "100vh" }}>

      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }} />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.2rem 4rem",
        background: "linear-gradient(180deg, rgba(7,6,8,0.96) 0%, rgba(7,6,8,0) 100%)",
        backdropFilter: "blur(4px)",
      }}>
        <span className="font-cinzel-deco text-kge-gradient" style={{ fontSize: "1.25rem", letterSpacing: "0.1em" }}>ΚΓΗ</span>
        <ul style={{ display: "flex", gap: "2.5rem", listStyle: "none" }}>
          {[["Home", "#"], ["Our Story", "/about"], ["Sisters", "/sisters"], ["Portal", "/login"]].map(([label, href]) => (
            <li key={label}>
              <a href={href} className="font-cinzel" style={{
                fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--muted)", textDecoration: "none", transition: "color 0.3s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-lt)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
              >{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        padding: "6rem 2rem 4rem",
        background: `
          radial-gradient(ellipse 55% 45% at 50% 55%, rgba(212,175,55,0.07) 0%, transparent 65%),
          radial-gradient(ellipse 35% 35% at 20% 75%, rgba(212,66,122,0.05) 0%, transparent 60%),
          radial-gradient(ellipse 35% 35% at 80% 25%, rgba(26,200,212,0.04) 0%, transparent 60%),
          var(--black)`,
        zIndex: 2,
      }}>
        {/* Crest */}
        <div className="animate-fadeIn animate-floatY" style={{ marginBottom: "2.2rem" }}>
          <Image
            src="/crest.png"
            alt="Kappa Gamma Eta Crest"
            width={300} height={300}
            style={{ filter: "drop-shadow(0 0 50px rgba(212,175,55,0.28)) drop-shadow(0 0 120px rgba(212,175,55,0.1))" }}
            priority
          />
        </div>

        {/* Name */}
        <h1 className="font-cinzel-deco animate-fadeUp delay-1" style={{
          fontSize: "clamp(2rem, 4.5vw, 3.8rem)", letterSpacing: "0.08em",
          lineHeight: 1.1, textAlign: "center", marginBottom: "0.5rem",
        }}>
          <span style={{ color: "var(--pink)" }}>K</span>
          <span style={{ color: "var(--cream)" }}>appa </span>
          <span style={{ color: "var(--green)" }}>G</span>
          <span style={{ color: "var(--cream)" }}>amma </span>
          <span style={{ color: "var(--crimson)" }}>E</span>
          <span style={{ color: "var(--cream)" }}>ta</span>
        </h1>

        <div className="gold-rule-sm animate-fadeUp delay-2" style={{ marginBottom: "1.1rem" }} />

        {/* Motto */}
        <p className="font-cormorant animate-fadeUp delay-2" style={{
          fontSize: "clamp(1rem, 2vw, 1.45rem)", fontStyle: "italic",
          color: "var(--muted)", textAlign: "center", letterSpacing: "0.06em",
        }}>
          She is strong like whiskey, but soft like wine
        </p>

        {/* Est */}
        <p className="font-cinzel animate-fadeUp delay-3" style={{
          fontSize: "0.68rem", letterSpacing: "0.32em", color: "var(--gold-dk)",
          marginTop: "1rem", textTransform: "uppercase",
        }}>
          Est. 12 · 14 · 24
        </p>

        {/* Scroll cue */}
        <a href="#pillars" className="animate-fadeIn delay-4" style={{
          position: "absolute", bottom: "2.5rem",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
          textDecoration: "none",
        }}>
          <span className="font-cinzel" style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--gold-dk)" }}>SCROLL</span>
          <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, var(--gold-dk), transparent)" }} />
        </a>
      </section>

      {/* ── THREE PILLARS ── */}
      <section id="pillars" style={{
        padding: "7rem 2rem 8rem", position: "relative", zIndex: 2,
      }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p className="font-cinzel" style={{ fontSize: "0.65rem", letterSpacing: "0.38em", color: "var(--teal)", textTransform: "uppercase" }}>
            The Sisterhood, the Story, the Space
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0", maxWidth: "960px", margin: "0 auto",
          border: "1px solid rgba(212,175,55,0.12)",
        }}>
          {PILLARS.map((p, i) => (
            <a key={p.title} href={p.link} style={{
              display: "block", textDecoration: "none",
              padding: "3.2rem 2.2rem",
              borderRight: i < PILLARS.length - 1 ? "1px solid rgba(212,175,55,0.12)" : "none",
              background: "rgba(14,11,16,0.5)",
              transition: "background 0.35s, transform 0.35s",
              textAlign: "center",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(212,175,55,0.04)`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(14,11,16,0.5)"; }}
            >
              <div style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "2.4rem", fontWeight: 700, marginBottom: "1.2rem",
                color: p.color,
              }}>{p.greek}</div>

              <p className="font-cinzel" style={{
                fontSize: "0.62rem", letterSpacing: "0.28em", color: p.color,
                textTransform: "uppercase", marginBottom: "0.7rem",
              }}>{p.sub}</p>

              <h3 className="font-cormorant" style={{
                fontSize: "1.4rem", fontWeight: 600, color: "var(--cream)",
                marginBottom: "0.8rem",
              }}>{p.title}</h3>

              <div className="gold-rule-sm" style={{ marginBottom: "1rem" }} />

              <p style={{
                fontSize: "0.95rem", lineHeight: 1.8, color: "var(--muted)",
                marginBottom: "1.6rem",
              }}>{p.desc}</p>

              <span className="font-cinzel" style={{
                fontSize: "0.62rem", letterSpacing: "0.18em",
                color: p.color, textTransform: "uppercase",
              }}>{p.cta}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: "relative", zIndex: 2,
        padding: "2.5rem 4rem",
        borderTop: "1px solid rgba(212,175,55,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <p className="font-cinzel-deco text-kge-gradient" style={{ fontSize: "1rem", letterSpacing: "0.12em", marginBottom: "0.3rem" }}>ΚΓΗ</p>
          <p className="font-cormorant" style={{ fontSize: "0.85rem", fontStyle: "italic", color: "var(--muted)" }}>
            Kappa Gamma Eta · Est. 12.14.24
          </p>
        </div>
        <p className="font-cormorant" style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--gold-dk)" }}>
          She is strong like whiskey, but soft like wine
        </p>
        <p className="font-cinzel" style={{ fontSize: "0.58rem", letterSpacing: "0.18em", color: "var(--muted)" }}>
          UNITY · RESPECT · EMPOWERMENT
        </p>
      </footer>

    </main>
  );
}
