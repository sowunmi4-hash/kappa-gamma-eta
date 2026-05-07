"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

const PILLARS = [
  {
    greek: "Κ",
    sub: "Five Sisters · One Bond",
    title: "The Sisterhood",
    desc: "Founders, President, Sisters — every woman who carries the name",
    cta: "Meet The Sisters →",
    href: "/sisters",
  },
  {
    greek: "Γ",
    sub: "Est. 12 · 14 · 24",
    title: "Our Story",
    desc: "Born of Amphictyonis — the goddess of unity, wine, and shared strength",
    cta: "Read Our Story →",
    href: "/our-story",
  },
  {
    greek: "Η",
    sub: "Unity · Respect · Empowerment",
    title: "Our Emblems",
    desc: "The Golden Chalice, Forget-Me-Not, and the Peruvian Opal — symbols of who we are",
    cta: "Explore Our Symbols →",
    href: "/emblems",
  },
];

function drawForgetMeNot(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, opacity: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = opacity;

  const petalColors = ["#7BA7D4", "#6B9FD4", "#89B8E8", "#5B8DB8", "#9EC5EA"];
  const color = petalColors[Math.floor(Math.abs(x * y) % petalColors.length)];

  // 5 petals
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.7, size * 0.38, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // centre dot — warm yellow
  ctx.fillStyle = "#FFE066";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    type Flower = { x: number; y: number; size: number; speed: number; angle: number; spin: number; opacity: number; drift: number };

    const flowers: Flower[] = [];
    for (let i = 0; i < 38; i++) {
      flowers.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height * 2 - canvas.height, // scatter above & on screen
        size:    Math.random() * 5 + 3,
        speed:   Math.random() * 0.55 + 0.25,  // downward drift
        angle:   Math.random() * Math.PI * 2,
        spin:    (Math.random() - 0.5) * 0.018,
        opacity: Math.random() * 0.35 + 0.08,
        drift:   (Math.random() - 0.5) * 0.3,  // gentle sideways sway
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flowers.forEach(f => {
        f.y     += f.speed;   // fall downward
        f.x     += f.drift;   // gentle sway
        f.angle += f.spin;

        // reset to top when fallen off bottom
        if (f.y > canvas.height + 20) {
          f.y = -20;
          f.x = Math.random() * canvas.width;
        }
        // wrap horizontally
        if (f.x < -20) f.x = canvas.width + 20;
        if (f.x > canvas.width + 20) f.x = -20;

        drawForgetMeNot(ctx, f.x, f.y, f.size, f.angle, f.opacity);
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
      <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:40 }} />

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:50,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"1.1rem 3.5rem",
        background:"linear-gradient(180deg, rgba(14,5,8,0.97) 0%, rgba(14,5,8,0) 100%)",
        backdropFilter:"blur(4px)",
        borderBottom:"1px solid rgba(212,175,55,0.12)",
      }}>
        <span className="font-cinzel-deco text-kge-gradient" style={{ fontSize:"1.2rem", letterSpacing:"0.1em" }}>ΚΓΗ</span>
        <ul style={{ display:"flex", gap:"2.2rem", listStyle:"none" }}>
          {[["Home","#"],["Our Story","/our-story"],["Sisters","/sisters"],].map(([label,href]) => (
            <li key={label}>
              <a href={href} className="font-cinzel" style={{
                fontSize:"0.68rem", letterSpacing:"0.2em", textTransform:"uppercase",
                color:"rgba(212,175,55,0.6)", textDecoration:"none", transition:"color 0.3s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ff6baa")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(212,175,55,0.6)")}
              >{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        position:"relative", overflow:"hidden", padding:"6rem 2rem 5rem",
        background:`
          radial-gradient(ellipse 65% 55% at 50% 60%, rgba(255,107,170,0.14) 0%, transparent 65%),
          radial-gradient(ellipse 35% 35% at 15% 80%, rgba(212,175,55,0.08) 0%, transparent 55%),
          radial-gradient(ellipse 35% 35% at 85% 20%, rgba(212,175,55,0.07) 0%, transparent 55%),
          var(--deep)`,
        zIndex:2,
      }}>
        {/* Gold top bar */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:"linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)", opacity:0.7 }} />
        {/* Greek key top */}
        <div style={{
          position:"absolute", top:"3px", left:0, right:0, height:"14px",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='14'%3E%3Cpath d='M0 12h28v2H0zM0 0h2v14H0zM26 0h2v14h-2zM2 0h14v2H2zM14 0v8h-2V2H4V0zM14 6h12v2H14z' fill='%23D4AF37' opacity='0.35'/%3E%3C/svg%3E")`,
          backgroundRepeat:"repeat-x",
        }} />

        {/* Left column */}
        <div style={{ position:"absolute", left:"2.5rem", top:"50%", transform:"translateY(-50%)", opacity:0.18, display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={{ width:"20px", height:"7px", background:"#D4AF37" }} />
          <div style={{ width:"12px", height:"4px", background:"#D4AF37", margin:"2px auto" }} />
          <div style={{ width:"10px", height:"110px", background:"linear-gradient(90deg, #D4AF37, #fff0a0, #D4AF37)" }} />
          <div style={{ width:"20px", height:"7px", background:"#D4AF37", marginTop:"2px" }} />
        </div>
        {/* Right column */}
        <div style={{ position:"absolute", right:"2.5rem", top:"50%", transform:"translateY(-50%)", opacity:0.18, display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={{ width:"20px", height:"7px", background:"#D4AF37" }} />
          <div style={{ width:"12px", height:"4px", background:"#D4AF37", margin:"2px auto" }} />
          <div style={{ width:"10px", height:"110px", background:"linear-gradient(90deg, #D4AF37, #fff0a0, #D4AF37)" }} />
          <div style={{ width:"20px", height:"7px", background:"#D4AF37", marginTop:"2px" }} />
        </div>

        {/* Crest — secret entrance to portal */}
        <a href="/login" className="animate-fadeIn animate-floatY" style={{
          marginBottom:"1.8rem",
          width:"160px", height:"160px", borderRadius:"50%",
          border:"1.5px solid rgba(212,175,55,0.6)",
          display:"flex", alignItems:"center", justifyContent:"center",
          position:"relative",
          boxShadow:"0 0 50px rgba(255,107,170,0.2), 0 0 100px rgba(212,175,55,0.08)",
          textDecoration:"none", cursor:"pointer",
          transition:"box-shadow 0.4s, border-color 0.4s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 70px rgba(255,107,170,0.35), 0 0 130px rgba(212,175,55,0.18)";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(212,175,55,0.9)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 50px rgba(255,107,170,0.2), 0 0 100px rgba(212,175,55,0.08)";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(212,175,55,0.6)";
        }}
        >
          <div style={{ position:"absolute", inset:"6px", borderRadius:"50%", border:"1px solid rgba(212,175,55,0.25)" }} />
          <Image src="/crest.png" alt="Kappa Gamma Eta Crest" width={130} height={130} style={{ borderRadius:"50%", objectFit:"cover" }} priority />
        </a>

        {/* Name */}
        <h1 className="font-cinzel-deco animate-fadeUp delay-1" style={{
          fontSize:"clamp(1.9rem, 4vw, 3.5rem)", letterSpacing:"0.07em",
          lineHeight:1.1, textAlign:"center", marginBottom:"0.5rem",
        }}>
          <span style={{ color:"#ff6baa" }}>K</span><span style={{ color:"var(--cream)" }}>appa </span>
          <span style={{ color:"#ff6baa" }}>G</span><span style={{ color:"var(--cream)" }}>amma </span>
          <span style={{ color:"#ff6baa" }}>E</span><span style={{ color:"var(--cream)" }}>ta</span>
        </h1>

        <div className="gold-rule-sm animate-fadeUp delay-2" style={{ marginBottom:"1rem" }} />

        <p className="font-cormorant animate-fadeUp delay-2" style={{
          fontSize:"clamp(1rem, 1.9vw, 1.35rem)", fontStyle:"italic",
          color:"rgba(255,107,170,0.85)", textAlign:"center", letterSpacing:"0.05em",
        }}>
          She is strong like whiskey, but soft like wine
        </p>

        <p className="font-cinzel animate-fadeUp delay-3" style={{
          fontSize:"0.62rem", letterSpacing:"0.32em", color:"var(--cyan-dk)",
          marginTop:"0.9rem", textTransform:"uppercase",
        }}>
          Est. 12 · 14 · 24
        </p>

        <a href="#pillars" className="animate-fadeIn delay-4" style={{
          position:"absolute", bottom:"2.2rem",
          display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", textDecoration:"none",
        }}>
          <span className="font-cinzel" style={{ fontSize:"0.52rem", letterSpacing:"0.3em", color:"rgba(212,175,55,0.4)" }}>SCROLL</span>
          <div style={{ width:"1px", height:"30px", background:"linear-gradient(to bottom, var(--wine-lt), rgba(212,175,55,0.4), transparent)" }} />
        </a>

        {/* Greek key bottom */}
        <div style={{
          position:"absolute", bottom:"3px", left:0, right:0, height:"14px",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='14'%3E%3Cpath d='M0 12h28v2H0zM0 0h2v14H0zM26 0h2v14h-2zM2 0h14v2H2zM14 0v8h-2V2H4V0zM14 6h12v2H14z' fill='%23D4AF37' opacity='0.35'/%3E%3C/svg%3E")`,
          backgroundRepeat:"repeat-x", transform:"scaleY(-1)",
        }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"3px", background:"linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)", opacity:0.7 }} />
      </section>

      {/* ── PILLARS ── */}
      <section id="pillars" style={{
        padding:"5rem 2rem 6rem", position:"relative", zIndex:2,
        background:`radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,107,170,0.05) 0%, transparent 70%), #120709`,
      }}>
        <p className="font-cinzel" style={{
          textAlign:"center", fontSize:"0.58rem", letterSpacing:"0.38em",
          color:"rgba(255,107,170,0.5)", textTransform:"uppercase", marginBottom:"2.5rem",
        }}>
          The Sisterhood · The Story · The Space
        </p>

        <div style={{
          display:"grid", gridTemplateColumns:"repeat(3,1fr)",
          border:"1px solid rgba(212,175,55,0.2)",
          maxWidth:"960px", margin:"0 auto",
        }}>
          {PILLARS.map((p, i) => (
            <a key={p.title} href={p.href} style={{
              display:"block", textDecoration:"none", padding:"2.2rem 1.5rem",
              textAlign:"center",
              background: i === 1 ? "rgba(123,3,35,0.15)" : "rgba(255,107,170,0.03)",
              borderRight: i < 2 ? "1px solid rgba(212,175,55,0.15)" : "none",
              position:"relative", transition:"background 0.3s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,107,170,0.1)")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = i === 1 ? "rgba(123,3,35,0.15)" : "rgba(255,107,170,0.03)")}
            >
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)" }} />
              <div className="font-cinzel-deco" style={{ fontSize:"1.8rem", fontWeight:700, color:"#ff6baa", textShadow:"0 0 20px rgba(255,107,170,0.35)", marginBottom:"0.5rem" }}>{p.greek}</div>
              <p className="font-cinzel" style={{ fontSize:"0.5rem", letterSpacing:"0.2em", color:"rgba(212,175,55,0.55)", textTransform:"uppercase", marginBottom:"0.45rem" }}>{p.sub}</p>
              <h3 className="font-cormorant" style={{ fontSize:"1.15rem", fontWeight:600, color:"var(--cream)", marginBottom:"0.45rem" }}>{p.title}</h3>
              <div className="gold-rule-sm" style={{ marginBottom:"0.7rem" }} />
              <p style={{ fontSize:"0.85rem", lineHeight:1.75, color:"rgba(245,237,216,0.5)", marginBottom:"1rem" }}>{p.desc}</p>
              <span className="font-cinzel" style={{ fontSize:"0.52rem", letterSpacing:"0.18em", color:"#D4AF37", textTransform:"uppercase" }}>{p.cta}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position:"relative", zIndex:2, padding:"1.8rem 3.5rem",
        borderTop:"1px solid rgba(212,175,55,0.12)", background:"#0e0508",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem",
      }}>
        <div>
          <p className="font-cinzel-deco text-kge-gradient" style={{ fontSize:"0.95rem", letterSpacing:"0.12em", marginBottom:"0.25rem" }}>ΚΓΗ</p>
          <p className="font-cormorant" style={{ fontSize:"0.8rem", fontStyle:"italic", color:"rgba(245,237,216,0.4)" }}>Kappa Gamma Eta · Est. 12.14.24</p>
        </div>
        <p className="font-cormorant" style={{ fontSize:"0.95rem", fontStyle:"italic", color:"var(--wine-lt)" }}>
          She is strong like whiskey, but soft like wine
        </p>
        <p className="font-cinzel" style={{ fontSize:"0.5rem", letterSpacing:"0.18em", color:"rgba(212,175,55,0.35)" }}>
          UNITY · RESPECT · EMPOWERMENT
        </p>
      </footer>
    </main>
  );
}
