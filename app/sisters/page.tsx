import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import SisterCard from "./SisterCard";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Sister = { id:string; sl_name:string; display_name:string; frat_name:string; role:string };

export default async function SistersPage() {
  const { data: sisters } = await sb.rpc("get_all_sisters");
  const list: Sister[] = sisters || [];

  return (
    <main style={{ minHeight:"100vh", background:"#0e0508", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif" }}>
      <div style={{ height:"3px", background:"linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)", opacity:0.7 }} />
      <div style={{ height:"14px", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='14'%3E%3Cpath d='M0 12h28v2H0zM0 0h2v14H0zM26 0h2v14h-2zM2 0h14v2H2zM14 0v8h-2V2H4V0zM14 6h12v2H14z' fill='%23D4AF37' opacity='0.32'/%3E%3C/svg%3E")`, backgroundRepeat:"repeat-x" }} />

      {/* Nav */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.1rem 3.5rem", background:"linear-gradient(180deg, rgba(14,5,8,0.97) 0%, rgba(14,5,8,0) 100%)", backdropFilter:"blur(4px)", borderBottom:"1px solid rgba(212,175,55,0.12)" }}>
        <Link href="/" style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.2rem", letterSpacing:"0.1em", color:"#D4AF37", textDecoration:"none" }}>ΚΓΗ</Link>
        <ul style={{ display:"flex", gap:"2.2rem", listStyle:"none" }}>
          {[["Home","/"],["Our Story","/our-story"],["Sisters","/sisters"]].map(([label,href])=>(
            <li key={label}>
              <Link href={href} style={{ fontFamily:"'Cinzel',serif", fontSize:"0.68rem", letterSpacing:"0.2em", textTransform:"uppercase", color: href==="/sisters"?"#ff6baa":"rgba(212,175,55,0.6)", textDecoration:"none" }}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop:"9rem", paddingBottom:"3rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,107,170,0.1) 0%, transparent 65%)", pointerEvents:"none" }} />
        <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.38em", textTransform:"uppercase", color:"rgba(255,107,170,0.6)", marginBottom:"0.8rem" }}>Kappa Gamma Eta</p>
        <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(2rem, 4vw, 3.2rem)", letterSpacing:"0.07em", color:"#F5EDD8", marginBottom:"0.6rem" }}>The Sisterhood</h1>
        <div style={{ width:80, height:1, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"0.8rem auto 1rem" }} />
        <p style={{ fontStyle:"italic", fontSize:"1.05rem", color:"rgba(245,237,216,0.5)", maxWidth:500, margin:"0 auto" }}>Every woman who carries the name — united under one chalice.</p>
      </section>

      {/* Sisters grid */}
      <section style={{ maxWidth:960, margin:"0 auto", padding:"2rem 2rem 6rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.4rem" }}>
          {list.map(s => <SisterCard key={s.id} s={s} />)}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:"1px solid rgba(212,175,55,0.12)", background:"#0e0508", padding:"1.8rem 3.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
        <p style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.95rem", letterSpacing:"0.12em", color:"#D4AF37" }}>ΚΓΗ</p>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"0.95rem", color:"#b01840" }}>She is strong like whiskey, but soft like wine</p>
        <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.18em", color:"rgba(212,175,55,0.35)" }}>UNITY · RESPECT · EMPOWERMENT</p>
      </footer>
      <div style={{ height:"3px", background:"linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)", opacity:0.7 }} />
    </main>
  );
}
