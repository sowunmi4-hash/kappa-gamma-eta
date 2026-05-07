import Link from "next/link";

export const metadata = {
  title: "Our Story — Kappa Gamma Eta",
  description: "She is strong like whiskey, but soft like wine. The story of Kappa Gamma Eta, founded December 14, 2024.",
};

export default function OurStoryPage() {
  return (
    <main style={{
      minHeight:"100vh",
      background:"#0e0508",
      color:"#F5EDD8",
      fontFamily:"'Cormorant Garamond',serif",
      position:"relative",
      overflowX:"hidden",
    }}>

      {/* ── Top border ── */}
      <div style={{ height:3, background:"linear-gradient(90deg,transparent,#D4AF37 30%,#fff0a0 50%,#D4AF37 70%,transparent)" }} />
      <div style={{ height:12, backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='12'%3E%3Cpath d='M0 10h28v2H0zM0 0h2v12H0zM26 0h2v12h-2zM2 0h12v2H2zM12 0v6h-2V2H4V0zM12 4h12v2H12z' fill='%23D4AF37' opacity='0.3'/%3E%3C/svg%3E\"), repeat-x" }} />

      {/* ── Background Greek letters ── */}
      {["Κ","Γ","Η"].map((l,i)=>(
        <div key={l} style={{ position:"fixed", fontFamily:"'Cinzel Decorative',serif", fontSize:"22rem", fontWeight:700, color:"rgba(123,3,35,0.05)", pointerEvents:"none", zIndex:0, lineHeight:1,
          top: i===0?"5%":i===1?"40%":"70%",
          left: i===0?"2%":i===1?"55%":"15%",
          transform:"rotate(-12deg)",
        }}>{l}</div>
      ))}

      {/* ── Ambient orbs ── */}
      <div style={{ position:"fixed", width:600, height:600, borderRadius:"50%", background:"rgba(123,3,35,0.12)", filter:"blur(100px)", top:-150, left:-100, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:400, height:400, borderRadius:"50%", background:"rgba(212,175,55,0.07)", filter:"blur(80px)", bottom:-100, right:-50, pointerEvents:"none", zIndex:0 }} />

      {/* ── Nav ── */}
      <nav style={{ position:"fixed", top:12, left:0, right:0, zIndex:50, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.9rem 2.5rem", pointerEvents:"none" }}>
        <Link href="/" style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.75rem", color:"#D4AF37", textDecoration:"none", letterSpacing:"0.15em", pointerEvents:"all" }}>ΚΓΗ</Link>
        <div style={{ display:"flex", gap:"2rem", pointerEvents:"all" }}>
          {[["Home","/"],["Sisters","/sisters"],["Our Story","/our-story"],["Emblems","/emblems"],["Apply","/apply"]].map(([l,h])=>(
            <Link key={l} href={h} style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color: l==="Our Story"?"#D4AF37":"rgba(245,237,216,0.45)", textDecoration:"none" }}>{l}</Link>
          ))}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"8rem 2rem 5rem" }}>

        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"1.2rem", animation:"fadeUp 0.8s 0.2s both" }}>
          Est. December 14, 2024
        </div>

        <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(2.5rem,7vw,5.5rem)", color:"#F5EDD8", lineHeight:1.1, marginBottom:"1.5rem", animation:"fadeUp 0.8s 0.4s both" }}>
          Our Story
        </h1>

        <div style={{ height:2, width:120, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0 auto 2rem", animation:"fadeUp 0.8s 0.5s both" }} />

        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.1rem,2.5vw,1.5rem)", color:"rgba(245,237,216,0.6)", maxWidth:600, lineHeight:1.7, animation:"fadeUp 0.8s 0.6s both" }}>
          "She is strong like whiskey, but soft like wine."
        </p>

        {/* Scroll indicator */}
        <div style={{ position:"absolute", bottom:"3rem", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.4rem", animation:"fadeUp 0.8s 1.2s both" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.35)" }}>Scroll</div>
          <div style={{ width:1, height:40, background:"linear-gradient(to bottom,rgba(212,175,55,0.4),transparent)" }} />
        </div>
      </section>

      {/* ── The Beginning ── */}
      <section style={{ position:"relative", zIndex:1, maxWidth:900, margin:"0 auto", padding:"5rem 2rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2px 1fr", gap:"3rem", alignItems:"center" }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.8rem" }}>The Beginning</div>
            <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.8rem", color:"#F5EDD8", marginBottom:"1rem", lineHeight:1.2 }}>Born from<br/>Sisterhood</h2>
            <p style={{ fontSize:"1.05rem", color:"rgba(245,237,216,0.6)", lineHeight:1.9 }}>
              On December 14, 2024, two women with a shared vision came together in the world of Second Life and founded something extraordinary. Δīvus FinΣ WinΣ and Δīvus Moscato — known to their sisters as Kera and Daniyah — planted a seed that would grow into one of SL's most intimate and empowering sisterhood communities.
            </p>
          </div>
          <div style={{ width:2, height:"100%", background:"linear-gradient(to bottom,transparent,#D4AF37,transparent)", margin:"0 auto" }} />
          <div>
            <div style={{ background:"rgba(212,175,55,0.04)", border:"1px solid rgba(212,175,55,0.18)", padding:"2rem", position:"relative" }}>
              {/* Corner accents */}
              {[["top:-1px","left:-1px","border-top","border-left"],["top:-1px","right:-1px","border-top","border-right"],["bottom:-1px","left:-1px","border-bottom","border-left"],["bottom:-1px","right:-1px","border-bottom","border-right"]].map(([t,s,b1,b2],i)=>(
                <div key={i} style={{ position:"absolute", width:12, height:12,
                  top:    t.startsWith("top")   ?"-1px":"auto",
                  bottom: t.startsWith("bottom")?"-1px":"auto",
                  left:   s.startsWith("left")  ?"-1px":"auto",
                  right:  s.startsWith("right") ?"-1px":"auto",
                  borderTop:    b1==="border-top"||b2==="border-top"    ?"2px solid #D4AF37":"none",
                  borderBottom: b1==="border-bottom"||b2==="border-bottom"?"2px solid #D4AF37":"none",
                  borderLeft:   b1==="border-left"||b2==="border-left"  ?"2px solid #D4AF37":"none",
                  borderRight:  b1==="border-right"||b2==="border-right"?"2px solid #D4AF37":"none",
                }} />
              ))}
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)", marginBottom:"0.6rem" }}>Founded</div>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.4rem", color:"#D4AF37", marginBottom:"0.4rem" }}>December 14, 2024</div>
              <div style={{ height:1, background:"rgba(212,175,55,0.2)", margin:"0.8rem 0" }} />
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)", marginBottom:"0.6rem" }}>Founders</div>
              <div style={{ fontStyle:"italic", fontSize:"1rem", color:"rgba(245,237,216,0.65)", lineHeight:1.8 }}>
                Δīvus FinΣ WinΣ<br/>
                Δīvus Moscato
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Name ── */}
      <section style={{ position:"relative", zIndex:1, background:"rgba(123,3,35,0.08)", borderTop:"1px solid rgba(123,3,35,0.2)", borderBottom:"1px solid rgba(123,3,35,0.2)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.8rem" }}>The Name</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(3rem,8vw,6rem)", color:"rgba(212,175,55,0.15)", letterSpacing:"0.3em", lineHeight:1, marginBottom:"-1rem" }}>ΚΓΗ</div>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2rem", color:"#F5EDD8", marginBottom:"1.4rem" }}>Kappa Gamma Eta</h2>
          <p style={{ fontSize:"1.05rem", color:"rgba(245,237,216,0.6)", lineHeight:1.9 }}>
            Three Greek letters. One identity. Kappa Gamma Eta — ΚΓΗ — carries the weight of its name with quiet elegance. Built within Second Life, KGE isn't just a sorority. It's a sanctuary. A place where women find their voice, their community, and their confidence, all within a world where identity is crafted and sisterhood is chosen.
          </p>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section style={{ position:"relative", zIndex:1, maxWidth:1000, margin:"0 auto", padding:"5rem 2rem" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.6rem" }}>What We Stand For</div>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.8rem", color:"#F5EDD8" }}>Our Core Values</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
          {[
            { value:"Unity",       icon:"🌸", text:"We stand together. In every event, every challenge, every celebration — no sister walks alone in Kappa Gamma Eta. Our bond is our strength." },
            { value:"Respect",     icon:"✦",  text:"Every sister is seen, heard, and valued. Respect is not earned here — it is given freely, because each woman who chooses to join us deserves nothing less." },
            { value:"Empowerment", icon:"👑",  text:"KGE exists to lift women up. To give them a space where they grow, shine, and become more fully themselves — in Second Life and beyond." },
          ].map(v=>(
            <div key={v.value} style={{ background:"#120709", border:"1px solid rgba(212,175,55,0.14)", padding:"2rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent)" }} />
              <div style={{ fontSize:"2rem", marginBottom:"1rem" }}>{v.icon}</div>
              <h3 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.1rem", color:"#D4AF37", marginBottom:"1rem" }}>{v.value}</h3>
              <div style={{ height:1, background:"rgba(212,175,55,0.15)", marginBottom:"1rem" }} />
              <p style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.55)", lineHeight:1.8 }}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Motto ── */}
      <section style={{ position:"relative", zIndex:1, padding:"5rem 2rem", textAlign:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(123,3,35,0.15),transparent 50%,rgba(212,175,55,0.06))", pointerEvents:"none" }} />
        <div style={{ position:"relative", maxWidth:800, margin:"0 auto" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"1.5rem" }}>Our Motto</div>
          <blockquote style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.4rem,3.5vw,2.2rem)", color:"#F5EDD8", lineHeight:1.6, margin:"0 0 1.5rem", letterSpacing:"0.02em" }}>
            "She is strong like whiskey,<br/>but soft like wine."
          </blockquote>
          <div style={{ height:1, width:80, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0 auto 1.5rem" }} />
          <p style={{ fontSize:"1rem", color:"rgba(245,237,216,0.5)", lineHeight:1.8, maxWidth:560, margin:"0 auto" }}>
            These words define who we are. A sisterhood that holds its ground with confidence and conviction, yet meets every sister with warmth, grace, and gentleness. Fierce when she needs to be. Tender when it matters most.
          </p>
        </div>
      </section>

      {/* ── Join CTA ── */}
      <section style={{ position:"relative", zIndex:1, padding:"5rem 2rem 7rem", textAlign:"center" }}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.6rem", color:"#F5EDD8", marginBottom:"1rem" }}>Become a Sister</h2>
          <p style={{ fontSize:"1rem", color:"rgba(245,237,216,0.5)", lineHeight:1.8, marginBottom:"2rem" }}>
            Kappa Gamma Eta is more than a sorority — it's a home. If you are a woman in Second Life seeking community, purpose, and sisterhood built on real values, we'd love to meet you.
          </p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/sisters" style={{ padding:"0.85rem 2rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.22em", textTransform:"uppercase", background:"rgba(212,175,55,0.15)", border:"1px solid rgba(212,175,55,0.45)", color:"#fff0a0", textDecoration:"none" }}>
              Meet the Sisters
            </Link>

          </div>
        </div>
      </section>

      {/* ── Footer line ── */}
      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)" }} />
      <div style={{ padding:"1.5rem 2.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.5rem" }}>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.65rem", color:"rgba(212,175,55,0.4)", letterSpacing:"0.1em" }}>ΚΓΗ</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.2)" }}>Kappa Gamma Eta · Est. December 14, 2024</div>
        <div style={{ fontStyle:"italic", fontSize:"0.75rem", color:"rgba(245,237,216,0.2)" }}>She is strong like whiskey, but soft like wine.</div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </main>
  );
}
