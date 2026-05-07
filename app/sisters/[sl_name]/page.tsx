import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ROLE_COLOUR: Record<string,string> = {
  Founder:"#D4AF37", President:"#ff6baa", Admin:"#7BA7D4", Member:"rgba(245,237,216,0.45)"
};

export default async function SisterPublicProfile({ params }: { params: Promise<{ sl_name: string }> }) {
  const { sl_name } = await params;
  const { data } = await sb.rpc("get_public_sister_profile", { p_sl_name: sl_name });
  if (!data || !data.member) notFound();

  const { member, profile, title, tier } = data as {
    member: { id:string; sl_name:string; display_name:string; frat_name:string; role:string };
    profile: { bio:string; favourite_quote:string; hobbies:string; portrait_url:string; social_links:Record<string,string> } | null;
    title: string | null;
    tier: { name:string } | null;
  };

  const socials = profile?.social_links || {};

  return (
    <main style={{ minHeight:"100vh", background:"#0e0508", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif" }}>
      {/* Greek key top */}
      <div style={{ height:"3px", background:"linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)", opacity:0.7 }} />
      <div style={{ height:"14px", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='14'%3E%3Cpath d='M0 12h28v2H0zM0 0h2v14H0zM26 0h2v14h-2zM2 0h14v2H2zM14 0v8h-2V2H4V0zM14 6h12v2H14z' fill='%23D4AF37' opacity='0.32'/%3E%3C/svg%3E")`, backgroundRepeat:"repeat-x" }} />

      {/* Nav */}
      <nav style={{ padding:"1rem 3rem", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(212,175,55,0.12)" }}>
        <Link href="/" style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1rem", color:"#D4AF37", textDecoration:"none", letterSpacing:"0.1em" }}>ΚΓΗ</Link>
        <Link href="/" style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", textDecoration:"none" }}>← Back to Site</Link>
      </nav>

      <div style={{ maxWidth:700, margin:"0 auto", padding:"4rem 2rem" }}>

        {/* Banner */}
        <div style={{ height:120, background:"linear-gradient(135deg, rgba(123,3,35,0.35), rgba(212,175,55,0.1))", border:"1px solid rgba(212,175,55,0.2)", borderBottom:"none", position:"relative", marginBottom:0 }}>
          {/* KGE watermark */}
          <div style={{ position:"absolute", right:24, top:"50%", transform:"translateY(-50%)", fontFamily:"'Cinzel Decorative',serif", fontSize:"4rem", color:"rgba(212,175,55,0.06)", lineHeight:1 }}>ΚΓΗ</div>
          {/* Avatar */}
          <div style={{ position:"absolute", bottom:-40, left:32, width:80, height:80, borderRadius:"50%", border:"2px solid #0e0508", background:"radial-gradient(circle, rgba(255,107,170,0.2), rgba(10,3,6,0.9))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>🌸</div>
        </div>

        {/* Card */}
        <div style={{ background:"rgba(20,8,12,0.95)", border:"1px solid rgba(212,175,55,0.18)", padding:"3.5rem 2rem 2rem", position:"relative" }}>
          {[["tl","tl"],["tr","tr"],["bl","bl"],["br","br"]].map(([pos]) => (
            <div key={pos} style={{ position:"absolute", width:13, height:13,
              top: pos.startsWith("t")?-1:"auto", bottom: pos.startsWith("b")?-1:"auto",
              left: pos.endsWith("l")?-1:"auto", right: pos.endsWith("r")?-1:"auto",
              borderTop: pos.startsWith("t")?"2px solid #D4AF37":"none",
              borderBottom: pos.startsWith("b")?"2px solid #D4AF37":"none",
              borderLeft: pos.endsWith("l")?"2px solid #D4AF37":"none",
              borderRight: pos.endsWith("r")?"2px solid #D4AF37":"none",
            }} />
          ))}

          {/* Name & role */}
          <div style={{ marginBottom:"1.4rem" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.5rem", color:"#ff9ec8", marginBottom:"0.3rem" }}>{member.frat_name}</div>
            <div style={{ fontSize:"0.95rem", color:"rgba(245,237,216,0.55)", marginBottom:"0.5rem" }}>{member.display_name}</div>
            <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", padding:"0.2rem 0.6rem", border:`1px solid ${ROLE_COLOUR[member.role]}40`, background:`${ROLE_COLOUR[member.role]}15`, color:ROLE_COLOUR[member.role] }}>{member.role}</span>
              {title && <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", padding:"0.2rem 0.6rem", border:"1px solid rgba(212,175,55,0.3)", background:"rgba(212,175,55,0.08)", color:"#D4AF37" }}>👑 {title}</span>}
              {tier && <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", padding:"0.2rem 0.6rem", border:"1px solid rgba(255,107,170,0.25)", background:"rgba(255,107,170,0.06)", color:"#ff9ec8" }}>🏆 {tier.name}</span>}
            </div>
          </div>

          <div style={{ height:1, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", opacity:0.3, marginBottom:"1.4rem" }} />

          {/* Bio */}
          {profile?.bio && (
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>About</div>
              <p style={{ fontSize:"0.95rem", lineHeight:1.8, color:"rgba(245,237,216,0.65)" }}>{profile.bio}</p>
            </div>
          )}

          {/* Quote */}
          {profile?.favourite_quote && (
            <div style={{ margin:"1.2rem 0", padding:"1rem 1.4rem", borderLeft:"2px solid rgba(123,3,35,0.6)", background:"rgba(123,3,35,0.08)" }}>
              <p style={{ fontStyle:"italic", fontSize:"1rem", color:"rgba(245,237,216,0.6)", lineHeight:1.7 }}>"{profile.favourite_quote}"</p>
            </div>
          )}

          {/* Hobbies */}
          {profile?.hobbies && (
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>Interests</div>
              <p style={{ fontSize:"0.92rem", color:"rgba(245,237,216,0.55)" }}>{profile.hobbies}</p>
            </div>
          )}

          {/* Social links */}
          {Object.keys(socials).some(k=>socials[k]) && (
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.8rem" }}>Connect</div>
              <div style={{ display:"flex", gap:"0.8rem", flexWrap:"wrap" }}>
                {socials.instagram && <a href={`https://instagram.com/${socials.instagram}`} target="_blank" rel="noopener noreferrer" style={{ padding:"0.4rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", border:"1px solid rgba(255,107,170,0.3)", color:"#ff9ec8", textDecoration:"none", background:"rgba(255,107,170,0.06)" }}>Instagram</a>}
                {socials.twitter && <a href={`https://twitter.com/${socials.twitter}`} target="_blank" rel="noopener noreferrer" style={{ padding:"0.4rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", border:"1px solid rgba(117,255,255,0.3)", color:"var(--cyan)", textDecoration:"none", background:"rgba(117,255,255,0.06)" }}>Twitter / X</a>}
                {socials.discord && <span style={{ padding:"0.4rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", border:"1px solid rgba(114,137,218,0.3)", color:"#7289DA", background:"rgba(114,137,218,0.06)" }}>{socials.discord}</span>}
                {socials.sl_profile && <a href={socials.sl_profile} target="_blank" rel="noopener noreferrer" style={{ padding:"0.4rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", border:"1px solid rgba(212,175,55,0.3)", color:"#D4AF37", textDecoration:"none", background:"rgba(212,175,55,0.06)" }}>SL Profile</a>}
              </div>
            </div>
          )}

          <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.2),transparent)", margin:"1.4rem 0" }} />
          <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(245,237,216,0.2)", textAlign:"center" }}>Member of Kappa Gamma Eta · ΚΓΗ · Est. 12.14.24</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ height:"3px", background:"linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)", opacity:0.7 }} />
    </main>
  );
}
