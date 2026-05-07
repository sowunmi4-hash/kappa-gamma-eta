import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Emblems — Kappa Gamma Eta",
  description: "The official emblems, colours, and symbols of Kappa Gamma Eta — ΚΓΗ.",
};

const COLOURS = [
  { name:"Pink",  hex:"#ff6baa", role:"Passion & Strength",     rgb:"255, 107, 170" },
  { name:"Gold",  hex:"#D4AF37", role:"Honour & Excellence",    rgb:"212, 175, 55"  },
  { name:"Wine",  hex:"#7b0323", role:"Courage & Devotion",     rgb:"123, 3, 35"    },
  { name:"Cream", hex:"#F5EDD8", role:"Grace & Refinement",     rgb:"245, 237, 216" },
];

export default function EmblemsPage() {
  return (
    <main style={{
      minHeight:"100vh", background:"#0e0508",
      color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif",
      position:"relative", overflowX:"hidden",
    }}>

      {/* Top border */}
      <div style={{ height:3, background:"linear-gradient(90deg,transparent,#D4AF37 30%,#fff0a0 50%,#D4AF37 70%,transparent)" }} />
      <div style={{ height:12, backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='12'%3E%3Cpath d='M0 10h28v2H0zM0 0h2v12H0zM26 0h2v12h-2zM2 0h12v2H2zM12 0v6h-2V2H4V0zM12 4h12v2H12z' fill='%23D4AF37' opacity='0.3'/%3E%3C/svg%3E\"), repeat-x" }} />

      {/* Background letters */}
      {["Κ","Γ","Η"].map((l,i)=>(
        <div key={l} style={{ position:"fixed", fontFamily:"'Cinzel Decorative',serif", fontSize:"22rem", fontWeight:700, color:"rgba(123,3,35,0.05)", pointerEvents:"none", zIndex:0, lineHeight:1, top:i===0?"5%":i===1?"38%":"68%", left:i===0?"2%":i===1?"55%":"10%", transform:"rotate(-10deg)" }}>{l}</div>
      ))}

      {/* Ambient orbs */}
      <div style={{ position:"fixed", width:600, height:600, borderRadius:"50%", background:"rgba(123,3,35,0.1)", filter:"blur(100px)", top:-200, left:-100, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:400, height:400, borderRadius:"50%", background:"rgba(212,175,55,0.06)", filter:"blur(80px)", bottom:-100, right:-50, pointerEvents:"none", zIndex:0 }} />

      {/* Nav */}
      <nav style={{ position:"fixed", top:12, left:0, right:0, zIndex:50, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.9rem 2.5rem" }}>
        <Link href="/" style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.75rem", color:"#D4AF37", textDecoration:"none", letterSpacing:"0.15em" }}>ΚΓΗ</Link>
        <div style={{ display:"flex", gap:"2rem" }}>
          {[["Home","/"],["Our Story","/our-story"],["Sisters","/sisters"],["Emblems","/emblems"]].map(([l,h])=>(
            <Link key={l} href={h} style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:l==="Emblems"?"#D4AF37":"rgba(245,237,216,0.4)", textDecoration:"none" }}>{l}</Link>
          ))}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position:"relative", zIndex:1, minHeight:"70vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"8rem 2rem 4rem" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"1rem" }}>Kappa Gamma Eta</div>
        <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(2.5rem,7vw,5rem)", color:"#F5EDD8", lineHeight:1.1, marginBottom:"1.2rem" }}>Emblems &amp; Identity</h1>
        <div style={{ height:2, width:100, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0 auto 1.5rem" }} />
        <p style={{ fontStyle:"italic", fontSize:"1.1rem", color:"rgba(245,237,216,0.5)", maxWidth:500 }}>The symbols, colours, and letters that define who we are.</p>
      </section>

      {/* ── The Crest ── */}
      <section style={{ position:"relative", zIndex:1, padding:"4rem 2rem", maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.5rem" }}>I</div>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2rem", color:"#F5EDD8" }}>The Crest</h2>
          <div style={{ height:1, width:60, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0.8rem auto 0" }} />
        </div>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
          {/* Crest frame */}
          <div style={{ position:"relative", padding:"2.5rem", background:"radial-gradient(ellipse at center, rgba(212,175,55,0.06), rgba(14,5,8,0.9))", border:"1px solid rgba(212,175,55,0.22)", marginBottom:"2rem" }}>
            {/* Corner brackets */}
            {[["top:-1px","left:-1px","border-top","border-left"],["top:-1px","right:-1px","border-top","border-right"],["bottom:-1px","left:-1px","border-bottom","border-left"],["bottom:-1px","right:-1px","border-bottom","border-right"]].map(([t,s,b1,b2],i)=>(
              <div key={i} style={{ position:"absolute", width:16, height:16,
                top:    t.startsWith("top")   ?"-1px":"auto", bottom: t.startsWith("bottom")?"-1px":"auto",
                left:   s.startsWith("left")  ?"-1px":"auto", right:  s.startsWith("right") ?"-1px":"auto",
                borderTop:    b1==="border-top"||b2==="border-top"    ?"2px solid #D4AF37":"none",
                borderBottom: b1==="border-bottom"||b2==="border-bottom"?"2px solid #D4AF37":"none",
                borderLeft:   b1==="border-left"||b2==="border-left"  ?"2px solid #D4AF37":"none",
                borderRight:  b1==="border-right"||b2==="border-right"?"2px solid #D4AF37":"none",
              }} />
            ))}

            {/* Glow ring */}
            <div style={{ position:"relative", width:220, height:220, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.35)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 60px rgba(212,175,55,0.08), inset 0 0 40px rgba(123,3,35,0.15)" }}>
              <div style={{ position:"absolute", inset:8, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.15)" }} />
              <Image src="/crest.png" alt="KGE Crest" width={180} height={180} style={{ borderRadius:"50%", objectFit:"cover" }} />
            </div>
          </div>

          <div style={{ textAlign:"center", maxWidth:480 }}>
            <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.1rem", color:"#D4AF37", marginBottom:"0.6rem", letterSpacing:"0.1em" }}>Kappa Gamma Eta</div>
            <p style={{ fontStyle:"italic", fontSize:"0.95rem", color:"rgba(245,237,216,0.5)", lineHeight:1.8 }}>
              The official crest of Kappa Gamma Eta — worn with pride by every sister as a mark of belonging, honour, and sisterhood.
            </p>
          </div>
        </div>
      </section>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.2),transparent)", margin:"2rem 0" }} />

      {/* ── The Letters ── */}
      <section style={{ position:"relative", zIndex:1, padding:"4rem 2rem", maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.5rem" }}>II</div>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2rem", color:"#F5EDD8" }}>The Greek Letters</h2>
          <div style={{ height:1, width:60, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0.8rem auto 0" }} />
        </div>

        {/* Large ΚΓΗ display */}
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(4rem,14vw,9rem)", letterSpacing:"0.3em", lineHeight:1, background:"linear-gradient(135deg,#9A7B1A 0%,#D4AF37 30%,#fff8a0 50%,#D4AF37 70%,#9A7B1A 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:"0.5rem" }}>
            ΚΓΗ
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)" }}>Kappa · Gamma · Eta</div>
        </div>

        {/* Three letter cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
          {[
            { letter:"Κ", name:"Kappa",  meaning:"The beginning. The foundation upon which every great sisterhood is built. Kappa represents the courage to start something that matters." },
            { letter:"Γ", name:"Gamma",  meaning:"The bridge. The connection between sisters, between values, between who we are and who we aspire to be. Gamma is the bond." },
            { letter:"Η", name:"Eta",    meaning:"The completion. The promise fulfilled. Eta represents the whole woman — refined, empowered, and firmly rooted in her sisterhood." },
          ].map(l=>(
            <div key={l.letter} style={{ background:"#120709", border:"1px solid rgba(212,175,55,0.14)", padding:"2rem 1.5rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.35),transparent)" }} />
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"3.5rem", color:"rgba(212,175,55,0.18)", lineHeight:1, marginBottom:"0.3rem" }}>{l.letter}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#D4AF37", marginBottom:"0.8rem" }}>{l.name}</div>
              <div style={{ height:1, background:"rgba(212,175,55,0.12)", marginBottom:"0.8rem" }} />
              <p style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.5)", lineHeight:1.8 }}>{l.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.2),transparent)", margin:"2rem 0" }} />

      {/* ── Official Colours ── */}
      <section style={{ position:"relative", zIndex:1, padding:"4rem 2rem", maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.5rem" }}>III</div>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2rem", color:"#F5EDD8" }}>The Official Colours</h2>
          <div style={{ height:1, width:60, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0.8rem auto 0" }} />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"1.5rem" }}>
          {COLOURS.map(col=>(
            <div key={col.name} style={{ display:"flex", gap:"1.5rem", alignItems:"center", background:"#120709", border:"1px solid rgba(212,175,55,0.12)", padding:"1.5rem", overflow:"hidden", position:"relative" }}>
              {/* Colour swatch */}
              <div style={{ width:80, height:80, background:col.hex, flexShrink:0, boxShadow:`0 0 30px ${col.hex}33`, position:"relative" }}>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(255,255,255,0.12),transparent)" }} />
              </div>
              <div>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1rem", color:"#F5EDD8", marginBottom:"0.3rem" }}>{col.name}</div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.5rem" }}>{col.role}</div>
                <div style={{ fontFamily:"monospace", fontSize:"0.75rem", color:"rgba(245,237,216,0.3)" }}>{col.hex} &nbsp;·&nbsp; rgb({col.rgb})</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.2),transparent)", margin:"2rem 0" }} />

      {/* ── The Motto ── */}
      <section style={{ position:"relative", zIndex:1, padding:"4rem 2rem", textAlign:"center" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(123,3,35,0.1),transparent 50%,rgba(212,175,55,0.04))", pointerEvents:"none" }} />
        <div style={{ position:"relative", maxWidth:700, margin:"0 auto" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.5rem" }}>IV</div>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2rem", color:"#F5EDD8", marginBottom:"2rem" }}>The Motto</h2>
          <div style={{ background:"rgba(212,175,55,0.04)", border:"1px solid rgba(212,175,55,0.18)", padding:"3rem 2.5rem", position:"relative" }}>
            {/* Corner accents */}
            {[["top:-1px","left:-1px","border-top","border-left"],["top:-1px","right:-1px","border-top","border-right"],["bottom:-1px","left:-1px","border-bottom","border-left"],["bottom:-1px","right:-1px","border-bottom","border-right"]].map(([t,s,b1,b2],i)=>(
              <div key={i} style={{ position:"absolute", width:14, height:14,
                top:t.startsWith("top")?"-1px":"auto", bottom:t.startsWith("bottom")?"-1px":"auto",
                left:s.startsWith("left")?"-1px":"auto", right:s.startsWith("right")?"-1px":"auto",
                borderTop:b1==="border-top"||b2==="border-top"?"2px solid #D4AF37":"none",
                borderBottom:b1==="border-bottom"||b2==="border-bottom"?"2px solid #D4AF37":"none",
                borderLeft:b1==="border-left"||b2==="border-left"?"2px solid #D4AF37":"none",
                borderRight:b1==="border-right"||b2==="border-right"?"2px solid #D4AF37":"none",
              }} />
            ))}
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.3rem,3vw,1.9rem)", color:"#F5EDD8", lineHeight:1.6, marginBottom:"1.2rem" }}>
              "She is strong like whiskey,<br/>but soft like wine."
            </div>
            <div style={{ height:1, width:60, background:"rgba(212,175,55,0.25)", margin:"0 auto 1.2rem" }} />
            <p style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.45)", lineHeight:1.8 }}>
              The official motto of Kappa Gamma Eta. A woman who carries herself with quiet power — unyielding when tested, tender when loved. This is the standard every sister holds herself to.
            </p>
          </div>
        </div>
      </section>

      {/* ── Founded ── */}
      <section style={{ position:"relative", zIndex:1, padding:"4rem 2rem 6rem", textAlign:"center" }}>
        <div style={{ maxWidth:500, margin:"0 auto", background:"#120709", border:"1px solid rgba(212,175,55,0.14)", padding:"2.5rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)", marginBottom:"0.5rem" }}>Established</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.6rem", color:"#D4AF37", marginBottom:"0.5rem" }}>December 14, 2024</div>
          <div style={{ height:1, background:"rgba(212,175,55,0.12)", margin:"1rem 0" }} />
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)", marginBottom:"0.6rem" }}>Founded by</div>
          <div style={{ fontStyle:"italic", fontSize:"1rem", color:"rgba(245,237,216,0.6)", lineHeight:2 }}>
            Δīvus FinΣ WinΣ<br/>Δīvus Moscato
          </div>
          <div style={{ marginTop:"1.5rem", display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/our-story" style={{ padding:"0.6rem 1.4rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", background:"rgba(212,175,55,0.1)", border:"1px solid rgba(212,175,55,0.3)", color:"#fff0a0", textDecoration:"none" }}>Our Story</Link>
            <Link href="/sisters" style={{ padding:"0.6rem 1.4rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", background:"rgba(255,107,170,0.08)", border:"1px solid rgba(255,107,170,0.25)", color:"#ff9ec8", textDecoration:"none" }}>Meet the Sisters</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)" }} />
      <div style={{ padding:"1.5rem 2.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.5rem" }}>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.65rem", color:"rgba(212,175,55,0.4)" }}>ΚΓΗ</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.2)" }}>Kappa Gamma Eta · Est. December 14, 2024</div>
        <div style={{ fontStyle:"italic", fontSize:"0.75rem", color:"rgba(245,237,216,0.2)" }}>She is strong like whiskey, but soft like wine.</div>
      </div>
    </main>
  );
}
