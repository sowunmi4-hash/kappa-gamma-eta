"use client";
import Link from "next/link";

type Sister = { id:string; sl_name:string; display_name:string; frat_name:string; role:string };

const ROLE_COLOUR: Record<string,string> = {
  Founder:"#D4AF37", President:"#ff6baa", Admin:"#7BA7D4", Member:"rgba(245,237,216,0.55)"
};

export default function SisterCard({ s }: { s: Sister }) {
  return (
    <Link href={`/sisters/${s.sl_name}`} style={{ textDecoration:"none" }}>
      <div
        style={{ background:"rgba(22,10,14,0.9)", border:"1px solid rgba(212,175,55,0.18)", padding:"2rem 1.4rem", textAlign:"center", cursor:"pointer", position:"relative", overflow:"hidden", transition:"all 0.3s" }}
        onMouseEnter={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.borderColor="rgba(255,107,170,0.4)"; el.style.transform="translateY(-4px)"; el.style.boxShadow="0 12px 40px rgba(255,107,170,0.1)"; }}
        onMouseLeave={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.borderColor="rgba(212,175,55,0.18)"; el.style.transform="translateY(0)"; el.style.boxShadow="none"; }}>

        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }} />

        <div style={{ width:76, height:76, borderRadius:"50%", border:`1.5px solid ${ROLE_COLOUR[s.role]}50`, margin:"0 auto 1rem", display:"flex", alignItems:"center", justifyContent:"center", background:`radial-gradient(circle, ${ROLE_COLOUR[s.role]}15, rgba(10,3,6,0.9))`, fontSize:"1.6rem", position:"relative" }}>
          🌸
          {s.role==="Founder" && <span style={{ position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)", fontSize:"0.85rem" }}>👑</span>}
        </div>

        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1rem", color:"#ff9ec8", marginBottom:"0.35rem", lineHeight:1.3 }}>{s.frat_name}</div>
        <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.5)", marginBottom:"0.6rem", lineHeight:1.3 }}>{s.display_name}</div>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", padding:"0.2rem 0.6rem", border:`1px solid ${ROLE_COLOUR[s.role]}40`, background:`${ROLE_COLOUR[s.role]}12`, color:ROLE_COLOUR[s.role] }}>{s.role}</span>
        <div style={{ marginTop:"1rem", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.35)" }}>View Profile →</div>
      </div>
    </Link>
  );
}
