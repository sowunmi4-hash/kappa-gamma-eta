"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, opacity: number) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = opacity;
  const colors = ["#7BA7D4","#6B9FD4","#89B8E8","#5B8DB8"];
  ctx.fillStyle = colors[Math.floor(Math.abs(x * y) % colors.length)];
  for (let i = 0; i < 5; i++) {
    ctx.save(); ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath(); ctx.ellipse(0, -size * 0.7, size * 0.38, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
  }
  ctx.fillStyle = "#FFE066";
  ctx.beginPath(); ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

type Stage = "login" | "set_password" | "success";

export default function LoginPage() {
  const router = useRouter();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const chaliceRef  = useRef<HTMLDivElement>(null);
  const streamRef   = useRef<HTMLDivElement>(null);
  const fillRef     = useRef<HTMLDivElement>(null);
  const crestOuter  = useRef<HTMLDivElement>(null);

  const [stage, setStage]           = useState<Stage>("login");
  const [slName, setSlName]         = useState("");
  const [password, setPassword]     = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [remember, setRemember]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [memberName, setMemberName] = useState("");

  // ── Canvas flowers ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    type F = { x:number;y:number;size:number;speed:number;angle:number;spin:number;opacity:number;drift:number };
    const flowers: F[] = [];
    for (let i = 0; i < 30; i++) flowers.push({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height*2-canvas.height,
      size:Math.random()*4+2, speed:Math.random()*0.5+0.2,
      angle:Math.random()*Math.PI*2, spin:(Math.random()-0.5)*0.018,
      opacity:Math.random()*0.3+0.07, drift:(Math.random()-0.5)*0.3,
    });
    let raf: number;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      flowers.forEach(f => {
        f.y+=f.speed; f.x+=f.drift; f.angle+=f.spin;
        if (f.y>canvas.height+20){f.y=-20;f.x=Math.random()*canvas.width;}
        if (f.x<-20) f.x=canvas.width+20;
        if (f.x>canvas.width+20) f.x=-20;
        drawFlower(ctx,f.x,f.y,f.size,f.angle,f.opacity);
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);

  // ── Pour animation ──
  const pour = async (success: boolean) => {
    const chalice = chaliceRef.current;
    const stream  = streamRef.current;
    const fill    = fillRef.current;
    const outer   = crestOuter.current;
    if (!chalice || !stream || !fill || !outer) return;

    // Tilt chalice
    chalice.style.transition = "transform 0.5s ease";
    chalice.style.transform  = "rotate(-20deg) translateX(-14px)";

    // Show stream
    stream.style.transition = "none";
    stream.style.height  = "0px";
    stream.style.opacity = "0";
    await delay(200);
    stream.style.transition = "height 0.4s ease, opacity 0.3s ease";
    stream.style.height  = "36px";
    stream.style.opacity = "0.9";

    await delay(350);

    // Fill circle
    fill.style.transition = "height 1.8s cubic-bezier(0.4,0,0.2,1)";
    fill.style.height     = success ? "105%" : "40%";

    await delay(1900);

    // Resolve
    chalice.style.transform = "rotate(0deg) translateX(0px)";
    stream.style.opacity = "0";
    stream.style.height  = "0px";

    if (success) {
      outer.style.borderColor = "rgba(180,50,80,0.85)";
      outer.style.boxShadow   = "0 0 50px rgba(123,3,35,0.55), 0 0 100px rgba(212,175,55,0.2)";
    } else {
      outer.style.borderColor = "rgba(212,175,55,0.2)";
      await delay(800);
      // drain
      fill.style.transition = "height 1s cubic-bezier(0.6,0,1,0.4)";
      fill.style.height     = "0%";
      await delay(1100);
      outer.style.borderColor = "rgba(212,175,55,0.6)";
      outer.style.boxShadow   = "0 0 50px rgba(255,107,170,0.2), 0 0 100px rgba(212,175,55,0.08)";
    }
  };

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const disableInputs = (v: boolean) => setLoading(v);

  // ── Login submit ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    disableInputs(true);

    try {
      const res  = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sl_name: slName.trim().toLowerCase(), password, remember }),
      });
      const data = await res.json();

      if (data.needs_new_password) {
        await pour(false);
        setError("");
        setStage("set_password");
        disableInputs(false);
        return;
      }

      const ok = res.ok && data.success;
      await pour(ok);

      if (ok) {
        setMemberName(data.frat_name || data.display_name);
        setStage("success");
        await delay(2500);
        router.push(data.role === "Pledge" ? "/pledge" : "/portal");
      } else {
        setError(data.error || "Incorrect credentials — the chalice remains empty.");
        disableInputs(false);
      }
    } catch {
      await pour(false);
      setError("Connection error. Please try again.");
      disableInputs(false);
    }
  };

  // ── Set password submit ──
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPw) { setError("Passwords do not match."); return; }
    setError(""); disableInputs(true);

    try {
      const res  = await fetch("/api/login", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ sl_name: slName.trim().toLowerCase(), password, remember, new_password: newPassword }),
      });
      const data = await res.json();
      const ok   = res.ok && data.success;
      await pour(ok);

      if (ok) {
        setMemberName(data.frat_name || data.display_name);
        setStage("success");
        await delay(2500);
        router.push(data.role === "Pledge" ? "/pledge" : "/portal");
      } else {
        setError(data.error || "Something went wrong.");
        disableInputs(false);
      }
    } catch {
      await pour(false);
      setError("Connection error. Please try again.");
      disableInputs(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"0.72rem 0.95rem",
    background:"rgba(255,107,170,0.05)",
    border:"1px solid rgba(212,175,55,0.22)",
    color:"var(--cream)", fontFamily:"'EB Garamond',serif",
    fontSize:"1rem", outline:"none", borderRadius:"1px",
    transition:"border-color 0.3s",
    opacity: loading ? 0.4 : 1,
  };

  return (
    <main style={{ minHeight:"100vh", background:`radial-gradient(ellipse 65% 55% at 50% 45%, rgba(212,175,55,0.09) 0%, transparent 65%), var(--deep)`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>

      <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:40 }} />

      {/* Greek key top */}
      <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, pointerEvents:"none" }}>
        <div style={{ height:"3px", background:"linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)", opacity:0.7 }} />
        <div style={{ height:"14px", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='14'%3E%3Cpath d='M0 12h28v2H0zM0 0h2v14H0zM26 0h2v14h-2zM2 0h14v2H2zM14 0v8h-2V2H4V0zM14 6h12v2H14z' fill='%23D4AF37' opacity='0.32'/%3E%3C/svg%3E")`, backgroundRepeat:"repeat-x" }} />
      </div>

      {/* Greek letter watermarks */}
      {["Κ","Γ","Η"].map((g,i) => (
        <div key={g} className="font-cinzel-deco" style={{ position:"fixed", fontSize:"18rem", fontWeight:700, color:"rgba(123,3,35,0.08)", pointerEvents:"none", zIndex:1, userSelect:"none", top:i===0?"5%":i===1?"35%":"65%", left:i===0?"5%":i===1?"60%":"15%", transform:"rotate(-15deg)" }}>{g}</div>
      ))}

      {/* Back to home */}
      <a href="/" className="font-cinzel" style={{ position:"fixed", top:"1.3rem", left:"2rem", zIndex:50, fontSize:"0.6rem", letterSpacing:"0.2em", color:"rgba(212,175,55,0.45)", textDecoration:"none", textTransform:"uppercase", transition:"color 0.3s" }}
        onMouseEnter={e=>(e.currentTarget.style.color="var(--cyan)")}
        onMouseLeave={e=>(e.currentTarget.style.color="rgba(212,175,55,0.45)")}
      >← Home</a>

      {/* ── PAGE CONTENT ── */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"5rem 1.5rem 3rem", position:"relative", zIndex:5, width:"100%" }}>

        {/* ── CHALICE ── */}
        <div ref={chaliceRef} style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"-4px", zIndex:3, transformOrigin:"bottom center" }}>
          <svg width="86" height="104" viewBox="0 0 86 104" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="chaliceGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#9A7B1A"/>
                <stop offset="35%"  stopColor="#fff0a0"/>
                <stop offset="55%"  stopColor="#D4AF37"/>
                <stop offset="100%" stopColor="#9A7B1A"/>
              </linearGradient>
            </defs>
            {/* glow base */}
            <ellipse cx="43" cy="58" rx="32" ry="6" fill="rgba(212,175,55,0.07)"/>
            {/* bowl */}
            <path d="M9 13 Q5 54 43 70 Q81 54 77 13 Z" fill="rgba(212,175,55,0.1)" stroke="url(#chaliceGold)" strokeWidth="1.8"/>
            {/* inner shine */}
            <path d="M17 22 Q14 46 30 58" stroke="rgba(255,240,160,0.28)" strokeWidth="1.5" strokeLinecap="round"/>
            {/* wine inside */}
            <clipPath id="bowlClip"><path d="M9 13 Q5 54 43 70 Q81 54 77 13 Z"/></clipPath>
            <rect x="0" y="40" width="86" height="40" fill="rgba(140,26,46,0.5)" clipPath="url(#bowlClip)"/>
            {/* rim */}
            <path d="M9 13 Q43 22 77 13" stroke="url(#chaliceGold)" strokeWidth="2.2" fill="none"/>
            {/* stem */}
            <rect x="38.5" y="70" width="7" height="22" fill="url(#chaliceGold)" rx="1"/>
            {/* base */}
            <ellipse cx="43" cy="95" rx="21" ry="5.5" fill="url(#chaliceGold)"/>
            <ellipse cx="43" cy="93" rx="17" ry="3.5" fill="rgba(255,240,160,0.3)"/>
          </svg>

          {/* Wine stream */}
          <div ref={streamRef} style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", width:"4px", height:"0px", opacity:0, background:"linear-gradient(to bottom, #C0395A, #8B1A2E)", borderRadius:"2px", transformOrigin:"top center" }} />
        </div>

        {/* ── GATE CARD ── */}
        <div style={{ position:"relative", width:"100%", maxWidth:"420px", background:"rgba(10,3,6,0.93)", border:"1px solid rgba(212,175,55,0.3)", padding:"2.4rem 2.2rem 2rem" }}>
          {/* corner notches */}
          {(["tl","tr","bl","br"] as const).map(pos => (
            <div key={pos} style={{ position:"absolute", width:13, height:13, top:pos.startsWith("t")?-1:"auto", bottom:pos.startsWith("b")?-1:"auto", left:pos.endsWith("l")?-1:"auto", right:pos.endsWith("r")?-1:"auto", borderTop:pos.startsWith("t")?"2px solid #D4AF37":"none", borderBottom:pos.startsWith("b")?"2px solid #D4AF37":"none", borderLeft:pos.endsWith("l")?"2px solid #D4AF37":"none", borderRight:pos.endsWith("r")?"2px solid #D4AF37":"none" }} />
          ))}
          <div style={{ position:"absolute", inset:8, border:"1px solid rgba(212,175,55,0.1)", pointerEvents:"none" }} />

          {/* ── CREST CIRCLE with wine fill ── */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"1.4rem" }}>
            <div ref={crestOuter} style={{ position:"relative", width:"108px", height:"108px", borderRadius:"50%", border:"1.5px solid rgba(212,175,55,0.6)", overflow:"hidden", background:"rgba(14,5,8,0.9)", flexShrink:0, transition:"border-color 0.5s, box-shadow 0.5s", boxShadow:"0 0 50px rgba(255,107,170,0.2), 0 0 100px rgba(212,175,55,0.08)" }}>
              {/* inner ring */}
              <div style={{ position:"absolute", inset:6, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.2)", zIndex:3, pointerEvents:"none" }} />
              {/* wine fill */}
              <div ref={fillRef} style={{ position:"absolute", bottom:0, left:0, right:0, height:"0%", zIndex:1, background:"linear-gradient(to top, #7b0323 0%, #b01840 100%)", borderRadius:"0 0 50% 50% / 0 0 8px 8px" }}>
                {/* wave */}
                <div style={{ position:"absolute", top:"-6px", left:"-20px", right:"-20px", height:"14px", background:"#b01840", borderRadius:"40%", opacity:0.7, animation:"wave 1.8s ease-in-out infinite" }} />
              </div>
              {/* crest image on top */}
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:4 }}>
                <Image src="/crest.png" alt="KGE" width={94} height={94} style={{ borderRadius:"50%", objectFit:"cover", opacity:0.92 }} />
              </div>
            </div>

            <div style={{ height:"1rem" }} />
            <p className="font-cinzel" style={{ fontSize:"0.54rem", letterSpacing:"0.28em", color:"rgba(255,107,170,0.6)", textTransform:"uppercase", marginBottom:"0.35rem" }}>Sisterhood Access</p>
            <h1 className="font-cinzel-deco" style={{ fontSize:"1.3rem", color:"var(--cream)", marginBottom:"0.15rem" }}>Enter the Sanctuary</h1>
            <p className="font-cormorant" style={{ fontSize:"0.82rem", fontStyle:"italic", color:"rgba(245,237,216,0.4)" }}>She is strong like whiskey, but soft like wine</p>
          </div>

          <div style={{ height:"1px", background:"linear-gradient(90deg, transparent, #D4AF37, transparent)", marginBottom:"1.2rem" }} />

          {/* ── STAGE: LOGIN ── */}
          {stage === "login" && (
            <form onSubmit={handleLogin}>
              <p style={{ fontSize:"0.88rem", fontStyle:"italic", color:"rgba(245,237,216,0.45)", textAlign:"center", lineHeight:1.7, marginBottom:"1.3rem" }}>
                Enter your SL username and password.<br/>
                First time? Use the one-time password from your sisters.
              </p>

              <div style={{ marginBottom:"1rem" }}>
                <label className="font-cinzel" style={{ display:"block", fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.65)", marginBottom:"0.45rem" }}>SL Username</label>
                <input type="text" placeholder="e.g. lkarats" value={slName} onChange={e=>setSlName(e.target.value)} disabled={loading} style={inputStyle}
                  onFocus={e=>(e.target.style.borderColor="rgba(255,107,170,0.55)")}
                  onBlur={e=>(e.target.style.borderColor="rgba(212,175,55,0.22)")} required />
              </div>

              <div style={{ marginBottom:"1.1rem" }}>
                <label className="font-cinzel" style={{ display:"block", fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.65)", marginBottom:"0.45rem" }}>Password</label>
                <input type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} disabled={loading} style={inputStyle}
                  onFocus={e=>(e.target.style.borderColor="rgba(255,107,170,0.55)")}
                  onBlur={e=>(e.target.style.borderColor="rgba(212,175,55,0.22)")} required />
              </div>

              <div onClick={()=>!loading&&setRemember(!remember)} style={{ display:"flex", alignItems:"center", gap:"0.6rem", cursor:"pointer", marginBottom:"1.3rem" }}>
                <div style={{ width:15, height:15, border:"1px solid rgba(212,175,55,0.4)", background:remember?"rgba(255,107,170,0.25)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {remember && <span style={{ color:"#ff6baa", fontSize:"10px" }}>✓</span>}
                </div>
                <span style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.45)" }}>Remember me for 30 days</span>
              </div>

              {error && <p style={{ color:"rgba(255,107,170,0.8)", fontSize:"0.85rem", textAlign:"center", fontStyle:"italic", marginBottom:"0.9rem" }}>{error}</p>}

              <button type="submit" disabled={loading} style={{ width:"100%", padding:"0.85rem", fontFamily:"'Cinzel',serif", fontSize:"0.68rem", letterSpacing:"0.22em", textTransform:"uppercase", background:loading?"rgba(123,3,35,0.12)":"rgba(255,107,170,0.15)", border:"1px solid rgba(255,107,170,0.4)", color:"var(--pink-lt)", cursor:loading?"not-allowed":"pointer", transition:"background 0.3s" }}>
                {loading ? "Pouring…" : "Enter the Sanctuary →"}
              </button>
            </form>
          )}

          {/* ── STAGE: SET PASSWORD ── */}
          {stage === "set_password" && (
            <form onSubmit={handleSetPassword}>
              <p style={{ fontSize:"0.88rem", fontStyle:"italic", color:"rgba(245,237,216,0.45)", textAlign:"center", lineHeight:1.7, marginBottom:"1.3rem" }}>
                Welcome, sister. Set your personal password to protect your account.
              </p>

              <div style={{ marginBottom:"1rem" }}>
                <label className="font-cinzel" style={{ display:"block", fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.65)", marginBottom:"0.45rem" }}>New Password</label>
                <input type="password" placeholder="At least 6 characters" value={newPassword} onChange={e=>setNewPassword(e.target.value)} disabled={loading} style={inputStyle}
                  onFocus={e=>(e.target.style.borderColor="rgba(255,107,170,0.55)")}
                  onBlur={e=>(e.target.style.borderColor="rgba(212,175,55,0.22)")} required />
              </div>
              <div style={{ marginBottom:"1.3rem" }}>
                <label className="font-cinzel" style={{ display:"block", fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.65)", marginBottom:"0.45rem" }}>Confirm Password</label>
                <input type="password" placeholder="Repeat your password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} disabled={loading} style={inputStyle}
                  onFocus={e=>(e.target.style.borderColor="rgba(255,107,170,0.55)")}
                  onBlur={e=>(e.target.style.borderColor="rgba(212,175,55,0.22)")} required />
              </div>

              {error && <p style={{ color:"rgba(255,107,170,0.8)", fontSize:"0.85rem", textAlign:"center", fontStyle:"italic", marginBottom:"0.9rem" }}>{error}</p>}

              <button type="submit" disabled={loading} style={{ width:"100%", padding:"0.85rem", fontFamily:"'Cinzel',serif", fontSize:"0.68rem", letterSpacing:"0.22em", textTransform:"uppercase", background:"rgba(255,107,170,0.15)", border:"1px solid rgba(255,107,170,0.4)", color:"var(--pink-lt)", cursor:loading?"not-allowed":"pointer" }}>
                {loading ? "Pouring…" : "Set Password & Enter →"}
              </button>
            </form>
          )}

          {/* ── STAGE: SUCCESS ── */}
          {stage === "success" && (
            <div style={{ textAlign:"center", padding:"0.5rem 0" }}>
              <p className="font-cormorant" style={{ fontSize:"1.25rem", fontStyle:"italic", color:"var(--pink-lt)", marginBottom:"0.5rem" }}>
                Welcome, {memberName}
              </p>
              <p className="font-cinzel" style={{ fontSize:"0.58rem", letterSpacing:"0.22em", color:"rgba(212,175,55,0.6)", textTransform:"uppercase" }}>
                Entering the sanctuary…
              </p>
              <div style={{ height:1, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", margin:"1rem auto", maxWidth:80 }} />
            </div>
          )}

          <p className="font-cinzel" style={{ textAlign:"center", fontSize:"0.5rem", letterSpacing:"0.15em", color:"rgba(245,237,216,0.18)", marginTop:"1.1rem", textTransform:"uppercase" }}>
            Access granted only to verified sisters of ΚΓΗ
          </p>
        </div>
      </div>

      {/* wave animation */}
      <style>{`@keyframes wave { 0%,100%{ transform:translateX(0) rotate(0deg); } 50%{ transform:translateX(8px) rotate(2deg); } }`}</style>
    </main>
  );
}
