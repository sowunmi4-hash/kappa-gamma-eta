"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

const MEMBERS = [
  { frat: "Δīvus Moscato",        display: "ᴅᴀɴɪʏᴀʜ ᴇꜱᴄᴏʙᴀʀ ʏᴀᴢɪᴍᴏᴛᴏ亗", role: "Founder",   color: "#D4AF37" },
  { frat: "Δīvus FinΣ WinΣ",      display: "ღкєяα ᴘʀᴇsᴛɪɢᴇღ",           role: "Founder",   color: "#D4AF37" },
  { frat: "Δīvus Rosé",           display: "ღℳiуσгi Cɣphɛrღ",            role: "President", color: "#D4427A" },
  { frat: "Δīvus Rhône",          display: "ღ J'Nya Sotomi ღ",            role: "Member",    color: "#1AC8D4" },
  { frat: "Δīvus Citrus Sancerre",display: "Adrianna Karminee Soprano",   role: "Member",    color: "#2E8B57" },
];

const VALUES = [
  { icon: "⚜", label: "Unity",        desc: "Bound together by sisterhood, we stand as one — celebrating our differences while honouring the strength found in togetherness." },
  { icon: "🕊", label: "Respect",      desc: "We honour each sister's voice, journey, and truth. Mutual respect is the foundation upon which Kappa Gamma Eta was built." },
  { icon: "🔥", label: "Empowerment", desc: "We lift each other higher. Every sister is encouraged to grow as a leader, thinker, and advocate for change in the world." },
];

const SYMBOLS = [
  { icon: "🏺", name: "The Golden Chalice", desc: "Overflowing with wine, the chalice symbolises the richness of sisterly bonds — nourishing, celebratory, full of joy and support." },
  { icon: "💙", name: "Forget-Me-Not",       desc: "Our sacred flower represents remembrance, loyalty, and enduring affection — the unbreakable ties that bind our sisters forever." },
  { icon: "💎", name: "Peruvian Opal Pink",  desc: "Chosen for its ethereal beauty, this gemstone embodies calm, creativity, and emotional healing — the transformation every sister undergoes." },
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

    for (let i = 0; i < 35; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height + canvas.height,
        size: Math.random() * 5 + 3,
        speed: Math.random() * 0.6 + 0.3,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04,
        opacity: Math.random() * 0.4 + 0.1,
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

      {/* ── CANVAS PETALS ── */}
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
          {["Home", "Our Story", "Sisters", "Portal"].map((link) => (
            <li key={link}>
              <a href={`#${link.toLowerCase().replace(" ", "-")}`} className="font-cinzel" style={{
                fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--muted)", textDecoration: "none", transition: "color 0.3s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-lt)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
              >{link}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section id="home" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", padding: "6rem 2rem 4rem",
        background: `
          radial-gradient(ellipse 60% 50% at 50% 60%, rgba(212,175,55,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 20% 80%, rgba(212,66,122,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 80% 20%, rgba(26,200,212,0.05) 0%, transparent 60%),
          var(--black)`,
        zIndex: 2,
      }}>
        {/* Crest */}
        <div className="animate-fadeIn animate-floatY" style={{ marginBottom: "2rem" }}>
          <Image
            src="/crest.png"
            alt="Kappa Gamma Eta Crest"
            width={340} height={340}
            style={{ filter: "drop-shadow(0 0 48px rgba(212,175,55,0.3)) drop-shadow(0 0 100px rgba(212,175,55,0.12))" }}
            priority
          />
        </div>

        {/* Name */}
        <h1 className="font-cinzel-deco animate-fadeUp delay-1" style={{
          fontSize: "clamp(2.2rem, 5vw, 4.2rem)", letterSpacing: "0.1em",
          lineHeight: 1.1, textAlign: "center", marginBottom: "0.6rem",
        }}>
          <span style={{ color: "var(--pink)" }}>K</span>
          <span style={{ color: "var(--cream)" }}>appa </span>
          <span style={{ color: "var(--green)" }}>G</span>
          <span style={{ color: "var(--cream)" }}>amma </span>
          <span style={{ color: "var(--crimson)" }}>E</span>
          <span style={{ color: "var(--cream)" }}>ta</span>
        </h1>

        <div className="gold-rule-sm animate-fadeUp delay-2" style={{ marginBottom: "1.2rem" }} />

        {/* Motto */}
        <p className="font-cormorant animate-fadeUp delay-2" style={{
          fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)", fontStyle: "italic",
          color: "var(--muted)", textAlign: "center", letterSpacing: "0.06em",
          maxWidth: "520px",
        }}>
          &ldquo;She is strong like whiskey, but soft like wine&rdquo;
        </p>

        {/* Est. */}
        <p className="font-cinzel animate-fadeUp delay-3" style={{
          fontSize: "0.72rem", letterSpacing: "0.3em", color: "var(--gold-dk)",
          marginTop: "1.2rem", textTransform: "uppercase",
        }}>
          Est. 12 · 14 · 24
        </p>

        {/* Scroll cue */}
        <div className="animate-fadeIn delay-4" style={{ position: "absolute", bottom: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <span className="font-cinzel" style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "var(--gold-dk)" }}>SCROLL</span>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, var(--gold-dk), transparent)" }} />
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section id="our-story" style={{
        padding: "8rem 2rem", maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 2,
      }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p className="font-cinzel" style={{ fontSize: "0.68rem", letterSpacing: "0.35em", color: "var(--teal)", marginBottom: "1rem", textTransform: "uppercase" }}>Our Story</p>
          <h2 className="font-cormorant" style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", fontWeight: 300, color: "var(--cream)", lineHeight: 1.2 }}>
            Born of Sisterhood,<br /><em style={{ color: "var(--gold)" }}>Rooted in Grace</em>
          </h2>
          <div className="gold-rule-sm" style={{ marginTop: "1.5rem" }} />
        </div>

        <div className="gold-rule" style={{ marginBottom: "3rem", opacity: 0.2 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
          <div>
            <p style={{ fontSize: "1.15rem", lineHeight: 1.85, color: "var(--muted)", marginBottom: "1.5rem" }}>
              Kappa Gamma Eta was founded on <span style={{ color: "var(--gold)" }}>December 14, 2024</span>, envisioned as a sisterhood that would transcend the ordinary — drawing on the strength and grace of women from all walks of life.
            </p>
            <p style={{ fontSize: "1.15rem", lineHeight: 1.85, color: "var(--muted)" }}>
              The founding members recognised a shared need for a space where women could excel in their creativity, be encouraged to grow as leaders, thinkers, and advocates — a safe space where one could be their true self.
            </p>
          </div>
          <div>
            <p style={{ fontSize: "1.15rem", lineHeight: 1.85, color: "var(--muted)", marginBottom: "1.5rem" }}>
              KGE draws inspiration from <span style={{ color: "var(--teal)" }}>Goddess Amphictyonis</span> — the ancient Greek goddess of wine, mutual respect, unity, and harmony among people. Her influence resonates in every value we hold.
            </p>
            <div style={{
              border: "1px solid rgba(212,175,55,0.2)", padding: "1.4rem 1.6rem",
              background: "rgba(212,175,55,0.04)", borderRadius: "2px",
            }}>
              <p className="font-cormorant" style={{ fontSize: "1.2rem", fontStyle: "italic", color: "var(--gold-lt)", lineHeight: 1.7 }}>
                &ldquo;She is an alliance-keeper, encouraging individuals to come together in the spirit of cooperation, friendship, and shared strength.&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="gold-rule" style={{ marginTop: "3rem", opacity: 0.2 }} />
      </section>

      {/* ── CORE VALUES ── */}
      <section style={{
        padding: "6rem 2rem", position: "relative", zIndex: 2,
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,175,55,0.04) 0%, transparent 70%)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p className="font-cinzel" style={{ fontSize: "0.68rem", letterSpacing: "0.35em", color: "var(--pink)", marginBottom: "1rem", textTransform: "uppercase" }}>What We Stand For</p>
          <h2 className="font-cormorant" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 300, color: "var(--cream)" }}>
            Our <em style={{ color: "var(--pink-lt)" }}>Core Values</em>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
          {VALUES.map((v) => (
            <div key={v.label} style={{
              border: "1px solid rgba(212,175,55,0.15)", padding: "2.5rem 2rem",
              textAlign: "center", background: "rgba(14,11,16,0.6)",
              transition: "border-color 0.3s, transform 0.3s",
              cursor: "default",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(212,175,55,0.45)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(212,175,55,0.15)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: "2.2rem", marginBottom: "1.2rem" }}>{v.icon}</div>
              <h3 className="font-cinzel" style={{ fontSize: "0.9rem", letterSpacing: "0.2em", color: "var(--gold)", marginBottom: "1rem", textTransform: "uppercase" }}>{v.label}</h3>
              <div className="gold-rule-sm" style={{ marginBottom: "1.2rem" }} />
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--muted)" }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SACRED SYMBOLS ── */}
      <section style={{ padding: "6rem 2rem", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p className="font-cinzel" style={{ fontSize: "0.68rem", letterSpacing: "0.35em", color: "var(--teal)", marginBottom: "1rem", textTransform: "uppercase" }}>Symbolism</p>
          <h2 className="font-cormorant" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 300, color: "var(--cream)" }}>
            Sacred <em style={{ color: "var(--teal-lt)" }}>Emblems</em>
          </h2>
        </div>

        <div style={{ display: "flex", gap: "0", maxWidth: "1000px", margin: "0 auto", border: "1px solid rgba(212,175,55,0.15)" }}>
          {SYMBOLS.map((s, i) => (
            <div key={s.name} style={{
              flex: 1, padding: "3rem 2rem", textAlign: "center",
              borderRight: i < SYMBOLS.length - 1 ? "1px solid rgba(212,175,55,0.15)" : "none",
              background: "rgba(14,11,16,0.5)",
              transition: "background 0.3s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = "rgba(212,175,55,0.05)")}
            onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "rgba(14,11,16,0.5)")}
            >
              <div style={{ fontSize: "2.8rem", marginBottom: "1.4rem" }}>{s.icon}</div>
              <h3 className="font-cormorant" style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--gold-lt)", marginBottom: "1rem" }}>{s.name}</h3>
              <div className="gold-rule-sm" style={{ marginBottom: "1.2rem" }} />
              <p style={{ fontSize: "0.98rem", lineHeight: 1.85, color: "var(--muted)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SISTERS ── */}
      <section id="sisters" style={{
        padding: "6rem 2rem 8rem", position: "relative", zIndex: 2,
        background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,66,122,0.04) 0%, transparent 70%)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p className="font-cinzel" style={{ fontSize: "0.68rem", letterSpacing: "0.35em", color: "var(--pink)", marginBottom: "1rem", textTransform: "uppercase" }}>The Sisterhood</p>
          <h2 className="font-cormorant" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 300, color: "var(--cream)" }}>
            Our <em style={{ color: "var(--pink-lt)" }}>Sisters</em>
          </h2>
          <div className="gold-rule-sm" style={{ marginTop: "1.5rem" }} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center", maxWidth: "1100px", margin: "0 auto" }}>
          {MEMBERS.map((m) => (
            <div key={m.frat} style={{
              width: "200px", padding: "2rem 1.5rem", textAlign: "center",
              border: `1px solid ${m.color}30`,
              background: "rgba(14,11,16,0.7)",
              transition: "transform 0.3s, border-color 0.3s, box-shadow 0.3s",
              cursor: "default",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "translateY(-6px)";
              el.style.borderColor = m.color + "70";
              el.style.boxShadow = `0 8px 32px ${m.color}20`;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "translateY(0)";
              el.style.borderColor = m.color + "30";
              el.style.boxShadow = "none";
            }}
            >
              {/* Avatar placeholder */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 1.2rem",
                background: `radial-gradient(circle, ${m.color}30, ${m.color}10)`,
                border: `1px solid ${m.color}50`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem",
              }}>🌸</div>

              <p className="font-cormorant" style={{ fontSize: "1rem", fontStyle: "italic", color: m.color, marginBottom: "0.5rem", lineHeight: 1.3 }}>{m.frat}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--cream)", marginBottom: "0.5rem", lineHeight: 1.4 }}>{m.display}</p>
              <span className="font-cinzel" style={{
                fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase",
                color: m.role === "Founder" ? "var(--gold)" : m.role === "President" ? "var(--pink)" : "var(--muted)",
              }}>{m.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: "relative", zIndex: 2, padding: "3rem 4rem",
        borderTop: "1px solid rgba(212,175,55,0.12)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <p className="font-cinzel-deco text-kge-gradient" style={{ fontSize: "1.1rem", letterSpacing: "0.12em", marginBottom: "0.4rem" }}>ΚΓΗ</p>
          <p className="font-cormorant" style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--muted)" }}>
            Kappa Gamma Eta · Est. 12.14.24
          </p>
        </div>
        <p className="font-cormorant" style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--gold-dk)", textAlign: "center" }}>
          &ldquo;She is strong like whiskey, but soft like wine&rdquo;
        </p>
        <p className="font-cinzel" style={{ fontSize: "0.62rem", letterSpacing: "0.18em", color: "var(--muted)", textAlign: "right" }}>
          UNITY · RESPECT · EMPOWERMENT
        </p>
      </footer>

    </main>
  );
}
