import Link from "next/link";

export const metadata = {
  title: "Our Story — Kappa Gamma Eta",
  description: "She is strong like whiskey, but soft like wine. The story of Kappa Gamma Eta, founded December 14, 2024.",
};

export default function OurStoryPage() {
  return (
    <main style={{ minHeight:"100vh", background:"#0e0508", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", position:"relative", overflowX:"hidden" }}>

      <div style={{ height:3, background:"linear-gradient(90deg,transparent,#D4AF37 30%,#fff0a0 50%,#D4AF37 70%,transparent)" }} />
      <div style={{ height:12, backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='12'%3E%3Cpath d='M0 10h28v2H0zM0 0h2v12H0zM26 0h2v12h-2zM2 0h12v2H2zM12 0v6h-2V2H4V0zM12 4h12v2H12z' fill='%23D4AF37' opacity='0.3'/%3E%3C/svg%3E\"), repeat-x" }} />

      {["Κ","Γ","Η"].map((l,i)=>(
        <div key={l} style={{ position:"fixed", fontFamily:"'Cinzel Decorative',serif", fontSize:"22rem", fontWeight:700, color:"rgba(123,3,35,0.05)", pointerEvents:"none", zIndex:0, lineHeight:1, top:i===0?"5%":i===1?"40%":"70%", left:i===0?"2%":i===1?"55%":"15%", transform:"rotate(-12deg)" }}>{l}</div>
      ))}
      <div style={{ position:"fixed", width:600, height:600, borderRadius:"50%", background:"rgba(123,3,35,0.12)", filter:"blur(100px)", top:-150, left:-100, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:400, height:400, borderRadius:"50%", background:"rgba(212,175,55,0.07)", filter:"blur(80px)", bottom:-100, right:-50, pointerEvents:"none", zIndex:0 }} />

      <nav style={{ position:"fixed", top:12, left:0, right:0, zIndex:50, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.9rem 2.5rem" }}>
        <Link href="/" style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.75rem", color:"#D4AF37", textDecoration:"none", letterSpacing:"0.15em" }}>ΚΓΗ</Link>
        <div style={{ display:"flex", gap:"2rem" }}>
          {[["Home","/"],["Sisters","/sisters"],["Our Story","/our-story"],["Emblems","/emblems"],["Apply","/apply"],["Check Status","/apply/status"]].map(([l,h])=>(
            <Link key={l} href={h} style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:l==="Our Story"?"#D4AF37":"rgba(245,237,216,0.4)", textDecoration:"none" }}>{l}</Link>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"8rem 2rem 5rem" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"1.2rem" }}>Est. December 14, 2024</div>
        <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(2.5rem,7vw,5.5rem)", color:"#F5EDD8", lineHeight:1.1, marginBottom:"1.5rem" }}>Our Story</h1>
        <div style={{ height:2, width:120, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0 auto 2rem" }} />
        <p style={{ fontStyle:"italic", fontSize:"clamp(1.1rem,2.5vw,1.5rem)", color:"rgba(245,237,216,0.6)", maxWidth:600, lineHeight:1.7 }}>
          "She is strong like whiskey, but soft like wine."
        </p>
        <div style={{ position:"absolute", bottom:"3rem", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.4rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.35)" }}>Scroll</div>
          <div style={{ width:1, height:40, background:"linear-gradient(to bottom,rgba(212,175,55,0.4),transparent)" }} />
        </div>
      </section>

      {/* The Beginning */}
      <section style={{ position:"relative", zIndex:1, maxWidth:820, margin:"0 auto", padding:"5rem 2rem" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.6rem", textAlign:"center" }}>The Beginning</div>
        <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.8rem", color:"#F5EDD8", marginBottom:"1.5rem", textAlign:"center" }}>Born from a Shared Vision</h2>
        <div style={{ height:1, width:60, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0 auto 2rem" }} />
        <p style={{ fontSize:"1.08rem", color:"rgba(245,237,216,0.7)", lineHeight:2, marginBottom:"1.4rem" }}>
          Kappa Gamma Eta, founded on December 14, 2024, was envisioned as a sisterhood that would transcend the ordinary, drawing on the strength and grace of women from all walks of life. The founding members of KGE were a group of passionate, diverse women who sought to create an empowering space where intellect, compassion, and deep bonds of sisterhood would flourish.
        </p>
        <p style={{ fontSize:"1.08rem", color:"rgba(245,237,216,0.7)", lineHeight:2 }}>
          The founding members of Kappa Gamma Eta all recognised a shared need for a space where women could not only excel in their creativity but also be encouraged to grow as leaders, thinkers, and advocates for change. Having experienced the highs and lows of other sorority life, they saw the opportunity to build a sisterhood that would offer support, celebration, strength, and a safe space where one could be their true self.
        </p>
      </section>

      {/* The Inspiration */}
      <section style={{ position:"relative", zIndex:1, background:"rgba(123,3,35,0.08)", borderTop:"1px solid rgba(123,3,35,0.2)", borderBottom:"1px solid rgba(123,3,35,0.2)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:820, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1px 1fr", gap:"3rem", alignItems:"center" }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.6rem" }}>The Muse</div>
              <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.6rem", color:"#F5EDD8", marginBottom:"1.2rem", lineHeight:1.3 }}>Goddess<br/>Amphictyonis</h2>
              <p style={{ fontSize:"1rem", color:"rgba(245,237,216,0.6)", lineHeight:1.9 }}>
                The founders were inspired by Goddess Amphictyonis — the ancient Greek goddess of Wine, mutual respect, unity, and harmony among people. A protector of alliances, she encouraged individuals and groups to come together in the spirit of cooperation, friendship, and shared strength.
              </p>
            </div>
            <div style={{ width:2, background:"linear-gradient(to bottom,transparent,#D4AF37,transparent)", height:"100%", margin:"0 auto" }} />
            <div>
              <p style={{ fontSize:"1rem", color:"rgba(245,237,216,0.6)", lineHeight:1.9 }}>
                Her influence resonates in the core values of Kappa Gamma Eta — Unity, Respect, and Empowerment — values that bind each member in their personal journeys and collective experiences. The sorority's unique symbolism is rooted in both ancient mythology and modern-day ideals, creating a connection between the past and the future for every member.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Symbols */}
      <section style={{ position:"relative", zIndex:1, maxWidth:820, margin:"0 auto", padding:"5rem 2rem" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.5rem" }}>Symbolism</div>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.8rem", color:"#F5EDD8" }}>What We Carry</h2>
          <div style={{ height:1, width:60, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0.8rem auto 0" }} />
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
          {[
            { icon:"🏺", title:"The Golden Chalice", subtitle:"Central Emblem", text:"The Golden Chalice overflowing with wine became the central emblem of Kappa Gamma Eta. This chalice symbolises the richness of the bonds shared between sisters — nourishing and celebratory, full of joy and support. Wine represents the sweet rewards of friendship that grow deeper over time, a reflection of the way sisterhood strengthens with each passing day. It also speaks to the importance of balance, moderation, and nurturing in the lives of all members." },
            { icon:"🌸", title:"The Forget-Me-Not", subtitle:"Official Flower", text:"The Forget-Me-Not flower was chosen as the sorority's official flower — a symbol of remembrance, loyalty, and enduring affection. Forget-Me-Nots represent the unbreakable ties of Kappa Gamma Eta's members, reminding them to always honour the friendships that shape their lives and carry their influence forward into the world." },
            { icon:"💎", title:"Peruvian Opal Pink", subtitle:"Official Gemstone", text:"The Peruvian Opal Pink was chosen for its ethereal beauty and transformative energy. Said to embody calm, creativity, and emotional healing, it encourages those who wear it to tap into their intuition and embrace their unique inner strength. This gemstone is symbolic of the growth that each member undergoes during her time in Kappa Gamma Eta, as she becomes a more confident, compassionate, and empowered woman." },
          ].map(s=>(
            <div key={s.title} style={{ display:"grid", gridTemplateColumns:"80px 1fr", gap:"1.5rem", background:"#120709", border:"1px solid rgba(212,175,55,0.14)", padding:"1.8rem 2rem", alignItems:"start" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"2.2rem", marginBottom:"0.4rem" }}>{s.icon}</div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)", lineHeight:1.4 }}>{s.subtitle}</div>
              </div>
              <div>
                <h3 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1rem", color:"#D4AF37", marginBottom:"0.7rem" }}>{s.title}</h3>
                <p style={{ fontSize:"0.95rem", color:"rgba(245,237,216,0.6)", lineHeight:1.9 }}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section style={{ position:"relative", zIndex:1, background:"rgba(123,3,35,0.06)", borderTop:"1px solid rgba(123,3,35,0.15)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"3rem" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.5rem" }}>What We Stand For</div>
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
                <h3 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.05rem", color:"#D4AF37", marginBottom:"0.8rem" }}>{v.value}</h3>
                <div style={{ height:1, background:"rgba(212,175,55,0.12)", marginBottom:"0.8rem" }} />
                <p style={{ fontSize:"0.88rem", color:"rgba(245,237,216,0.55)", lineHeight:1.8 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Motto */}
      <section style={{ position:"relative", zIndex:1, padding:"5rem 2rem", textAlign:"center" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(123,3,35,0.15),transparent 50%,rgba(212,175,55,0.06))", pointerEvents:"none" }} />
        <div style={{ position:"relative", maxWidth:700, margin:"0 auto" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"1.5rem" }}>Our Motto</div>
          <blockquote style={{ fontStyle:"italic", fontSize:"clamp(1.4rem,3.5vw,2.2rem)", color:"#F5EDD8", lineHeight:1.6, margin:"0 0 1.5rem", letterSpacing:"0.02em" }}>
            "She is strong like whiskey,<br/>but soft like wine."
          </blockquote>
          <div style={{ height:1, width:80, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0 auto 1.5rem" }} />
          <p style={{ fontSize:"1rem", color:"rgba(245,237,216,0.5)", lineHeight:1.8, maxWidth:560, margin:"0 auto" }}>
            A sisterhood that holds its ground with confidence and conviction, yet meets every sister with warmth, grace, and gentleness. Fierce when she needs to be. Tender when it matters most.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position:"relative", zIndex:1, padding:"3rem 2rem 7rem", textAlign:"center" }}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.6rem", color:"#F5EDD8", marginBottom:"1rem" }}>Become a Sister</h2>
          <p style={{ fontSize:"1rem", color:"rgba(245,237,216,0.5)", lineHeight:1.8, marginBottom:"2rem" }}>
            Kappa Gamma Eta is more than a sorority — it's a home. If you are a woman in Second Life seeking community, purpose, and sisterhood built on real values, we'd love to meet you.
          </p>
          <Link href="/sisters" style={{ padding:"0.85rem 2rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.22em", textTransform:"uppercase", background:"rgba(212,175,55,0.15)", border:"1px solid rgba(212,175,55,0.45)", color:"#fff0a0", textDecoration:"none" }}>
            Meet the Sisters
          </Link>
        </div>
      </section>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)" }} />
      <div style={{ padding:"1.5rem 2.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.5rem" }}>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.65rem", color:"rgba(212,175,55,0.4)" }}>ΚΓΗ</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.2)" }}>Kappa Gamma Eta · Est. December 14, 2024</div>
        <div style={{ fontStyle:"italic", fontSize:"0.75rem", color:"rgba(245,237,216,0.2)" }}>She is strong like whiskey, but soft like wine.</div>
      </div>
    </main>
  );
}
