"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProbationData = {
  on_probation: boolean;
  reason?: string;
  tda_points?: number;
  started_at?: string;
  ends_at?: string;
  duration_days?: number;
  set_by_name?: string;
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmt(d: string) {
  const dt = new Date(d);
  return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

function Countdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ days:0, hours:0, minutes:0, seconds:0, expired:false });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(t=>({...t, expired:true})); return; }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (timeLeft.expired) return (
    <div style={{ textAlign:"center", padding:"1.5rem", border:"1px solid rgba(77,184,122,0.4)", background:"rgba(77,184,122,0.08)" }}>
      <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.2rem", color:"#4DB87A", marginBottom:"0.4rem" }}>Probation Lifted</div>
      <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.5)" }}>Please refresh and log back in to access the portal.</p>
    </div>
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.4rem" }}>
      {[
        { val: timeLeft.days,    label: "Days" },
        { val: timeLeft.hours,   label: "Hours" },
        { val: timeLeft.minutes, label: "Minutes" },
        { val: timeLeft.seconds, label: "Seconds" },
      ].map(({ val, label }) => (
        <div key={label} style={{ textAlign:"center", padding:"1.2rem 0.8rem", background:"rgba(123,3,35,0.15)", border:"1px solid rgba(123,3,35,0.35)" }}>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2.2rem", color:"#ff6baa", lineHeight:1, marginBottom:"0.3rem" }}>
            {String(val).padStart(2, "0")}
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(245,237,216,0.35)" }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProbationPage() {
  const router = useRouter();
  const [data, setData]       = useState<ProbationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/probation?type=status")
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
        if (!d.on_probation) router.replace("/portal");
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <main style={{ minHeight:"100vh", background:"#0e0508", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(212,175,55,0.4)" }}>Loading…</div>
    </main>
  );

  if (!data?.on_probation) return null;

  return (
    <main style={{ minHeight:"100vh", background:"#0e0508", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", position:"relative", overflow:"hidden" }}>

      {/* Background orbs */}
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"rgba(123,3,35,0.2)", filter:"blur(80px)", top:-100, left:-100, pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"rgba(255,107,170,0.08)", filter:"blur(80px)", bottom:-50, right:-50, pointerEvents:"none" }} />

      {/* Greek letters */}
      <div style={{ position:"fixed", fontFamily:"'Cinzel Decorative',serif", fontSize:"16rem", color:"rgba(123,3,35,0.07)", pointerEvents:"none", top:"5%", left:"2%", lineHeight:1 }}>Κ</div>
      <div style={{ position:"fixed", fontFamily:"'Cinzel Decorative',serif", fontSize:"16rem", color:"rgba(123,3,35,0.07)", pointerEvents:"none", bottom:"5%", right:"2%", lineHeight:1 }}>Η</div>

      <div style={{ maxWidth:560, width:"100%", position:"relative", zIndex:5 }}>

        {/* Top bar */}
        <div style={{ height:3, background:"linear-gradient(90deg,transparent,#7b0323 40%,#7b0323 60%,transparent)", marginBottom:0 }} />

        {/* Card */}
        <div style={{ background:"rgba(14,5,8,0.95)", border:"1px solid rgba(123,3,35,0.5)", padding:"2.5rem 2.2rem", position:"relative" }}>

          {/* Corner brackets */}
          {[["top:-1px","left:-1px","border-top","border-left"],["top:-1px","right:-1px","border-top","border-right"],
            ["bottom:-1px","left:-1px","border-bottom","border-left"],["bottom:-1px","right:-1px","border-bottom","border-right"]].map(([t,s,b1,b2],i)=>(
            <div key={i} style={{ position:"absolute", width:14, height:14,
              top:    t.startsWith("top")   ? "-1px":"auto",
              bottom: t.startsWith("bottom")?"-1px":"auto",
              left:   s.startsWith("left")  ?"-1px":"auto",
              right:  s.startsWith("right") ?"-1px":"auto",
              borderTop:    b1==="border-top"||b2==="border-top"    ?"2px solid #7b0323":"none",
              borderBottom: b1==="border-bottom"||b2==="border-bottom"?"2px solid #7b0323":"none",
              borderLeft:   b1==="border-left"||b2==="border-left"  ?"2px solid #7b0323":"none",
              borderRight:  b1==="border-right"||b2==="border-right"?"2px solid #7b0323":"none",
            }} />
          ))}

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"0.6rem" }}>⚠</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(123,3,35,0.8)", marginBottom:"0.4rem" }}>Kappa Gamma Eta</div>
            <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.6rem", color:"#F5EDD8", marginBottom:"0.5rem" }}>Probation Notice</h1>
            <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(123,3,35,0.6),transparent)", marginBottom:"1rem" }} />
            <p style={{ fontStyle:"italic", fontSize:"0.95rem", color:"rgba(245,237,216,0.45)", lineHeight:1.7 }}>
              Your access to the sisterhood portal has been temporarily restricted.
            </p>
          </div>

          {/* Reason */}
          <div style={{ background:"rgba(123,3,35,0.12)", border:"1px solid rgba(123,3,35,0.3)", padding:"1rem 1.2rem", marginBottom:"1.4rem" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(123,3,35,0.8)", marginBottom:"0.4rem" }}>Reason</div>
            <p style={{ fontSize:"0.95rem", color:"rgba(245,237,216,0.7)", lineHeight:1.6 }}>{data.reason}</p>
            {data.tda_points !== undefined && data.tda_points !== null && (
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)", marginTop:"0.4rem" }}>
                TDA Points at time of probation: <span style={{ color:"#ff6baa" }}>{data.tda_points}</span> / 100 required
              </p>
            )}
          </div>

          {/* Dates */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.4rem" }}>
            <div style={{ textAlign:"center", padding:"0.8rem", background:"rgba(212,175,55,0.04)", border:"1px solid rgba(212,175,55,0.12)" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.45)", marginBottom:"0.3rem" }}>Started</div>
              <div style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.6)" }}>{data.started_at ? fmt(data.started_at) : "—"}</div>
            </div>
            <div style={{ textAlign:"center", padding:"0.8rem", background:"rgba(212,175,55,0.04)", border:"1px solid rgba(212,175,55,0.12)" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.45)", marginBottom:"0.3rem" }}>Ends</div>
              <div style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.6)" }}>{data.ends_at ? fmt(data.ends_at) : "—"}</div>
            </div>
          </div>

          {/* Countdown */}
          <div style={{ marginBottom:"1.4rem" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(245,237,216,0.3)", textAlign:"center", marginBottom:"0.8rem" }}>Time Remaining</div>
            {data.ends_at && <Countdown endsAt={data.ends_at} />}
          </div>

          {/* Info */}
          <div style={{ padding:"0.8rem 1rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(255,107,170,0.12)", marginBottom:"1.2rem" }}>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,107,170,0.5)", lineHeight:1.8 }}>
              💰 Dues can still be paid via the in-world terminal<br/>
              ✓ Portal access will automatically restore when probation ends<br/>
              📞 Contact a Founder if you have questions
            </p>
          </div>

          {data.set_by_name && (
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.2)", textAlign:"center" }}>
              Set by {data.set_by_name} · {data.duration_days} day probation
            </p>
          )}

          {/* Logout */}
          <div style={{ textAlign:"center", marginTop:"1.2rem" }}>
            <button onClick={async ()=>{ await fetch("/api/logout",{method:"POST"}); window.location.href="/login"; }}
              style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.15em", textTransform:"uppercase", background:"transparent", border:"none", color:"rgba(245,237,216,0.3)", cursor:"pointer", textDecoration:"underline" }}>
              Log out
            </button>
          </div>
        </div>

        <div style={{ height:3, background:"linear-gradient(90deg,transparent,#7b0323 40%,#7b0323 60%,transparent)" }} />
      </div>
    </main>
  );
}
