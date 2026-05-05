"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function drawForgetMeNot(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, opacity: number) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = opacity;
  const colors = ["#7BA7D4","#6B9FD4","#89B8E8","#5B8DB8"];
  ctx.fillStyle = colors[Math.floor(Math.abs(x*y) % colors.length)];
  for (let i = 0; i < 5; i++) {
    ctx.save(); ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath(); ctx.ellipse(0, -size*0.7, size*0.38, size*0.55, 0, 0, Math.PI*2);
    ctx.fill(); ctx.restore();
  }
  ctx.fillStyle = "#FFE066";
  ctx.beginPath(); ctx.arc(0, 0, size*0.28, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

type Stage = "login" | "set_password" | "success";

export default function LoginPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage]         = useState<Stage>("login");
  const [slName, setSlName]       = useState("");
  const [password, setPassword]   = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [memberName, setMemberName] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    type F = { x:number;y:number;size:number;speed:number;angle:number;spin:number;opacity:number;drift:number };
    const flowers: F[] = [];
    for (let i = 0; i < 28; i++) flowers.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height*2-canvas.height, size:Math.random()*4+2, speed:Math.random()*0.5+0.2, angle:Math.random()*Math.PI*2, spin:(Math.random()-0.5)*0.018, opacity:Math.random()*0.3+0.07, drift:(Math.random()-0.5)*0.3 });
    let raf: number;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      flowers.forEach(f => {
        f.y+=f.speed; f.x+=f.drift; f.angle+=f.spin;
        if (f.y > canvas.height+20) { f.y=-20; f.x=Math.random()*canvas.width; }
        if (f.x<-20) f.x=canvas.width+20; if(f.x>canvas.width+20) f.x=-20;
        drawForgetMeNot(ctx,f.x,f.y,f.size,f.angle,f.opacity);
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sl_name: slName.trim().toLowerCase(), password, remember }),
      });
      const data = await res.json();
      if (data.needs_new_password) { setStage("set_password"); setLoading(false); return; }
      if (!res.ok) { setError(data.error || "Login failed."); setLoading(false); return; }
      setMemberName(data.frat_name || data.display_name);
      setStage("success");
      setTimeout(() => router.push("/portal"), 2000);
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPw) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sl_name: slName.trim().toLowerCase(), password, remember, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to set password."); setLoading(false); return; }
      setMemberName(data.frat_name || data.display_name);
      setStage("success");
      setTimeout(() => router.push("/portal"), 2000);
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"0.75rem 1rem",
    background:"rgba(255,107,170,0.06)",
    border:"1px solid rgba(212,175,55,0.25)",
    borderRadius:"2px", color:"var(--cream)",
    fontFamily:"'EB Garamond', serif", fontSize:"1rem",
    outline:"none", transition:"border-color 0.3s",
  };

  return (
    <main style={{ minHeight:"100vh", background:"var(--deep)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:40 }} />

      {/* watermarks */}
      {["Κ","Γ","Η"].map((g,i) => (
        <div key={g} className="font-cinzel-deco" style={{
          position:"fixed", fontSize:"18rem", fontWeight:700,
          color:"rgba(255,107,170,0.035)", pointerEvents:"none", zIndex:0, userSelect:"none",
          top: i===0?"5%": i===1?"35%":"65%",
          left: i===0?"5%": i===1?"60%":"15%",
          transform:"rotate(-15deg)",
        }}>{g}</div>
      ))}

      {/* Gold top bar */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:"3px", background:"linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)", opacity:0.7, zIndex:10 }} />
      <div style={{
        position:"fixed", top:"3px", left:0, right:0, height:"14px", zIndex:10,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='14'%3E%3Cpath d='M0 12h28v2H0zM0 0h2v14H0zM26 0h2v14h-2zM2 0h14v2H2zM14 0v8h-2V2H4V0zM14 6h12v2H14z' fill='%23D4AF37' opacity='0.3'/%3E%3C/svg%3E")`,
        backgroundRepeat:"repeat-x",
      }} />

      {/* Back to home */}
      <a href="/" className="font-cinzel" style={{
        position:"fixed", top:"1.2rem", left:"2rem", zIndex:50,
        fontSize:"0.6rem", letterSpacing:"0.2em", color:"rgba(212,175,55,0.5)",
        textDecoration:"none", textTransform:"uppercase", transition:"color 0.3s",
      }}
      onMouseEnter={e=>(e.currentTarget.style.color="#ff6baa")}
      onMouseLeave={e=>(e.currentTarget.style.color="rgba(212,175,55,0.5)")}
      >← Home</a>

      {/* Gate card */}
      <div style={{
        position:"relative", zIndex:5,
        width:"100%", maxWidth:"440px",
        margin:"4rem 1.5rem",
        border:"1px solid rgba(212,175,55,0.35)",
        background:"rgba(14,5,8,0.92)",
        padding:"3rem 2.5rem",
      }}>
        {/* Corner notches */}
        {["tl","tr","bl","br"].map(pos => (
          <div key={pos} style={{
            position:"absolute",
            top: pos.startsWith("t") ? -1 : "auto",
            bottom: pos.startsWith("b") ? -1 : "auto",
            left: pos.endsWith("l") ? -1 : "auto",
            right: pos.endsWith("r") ? -1 : "auto",
            width:14, height:14,
            borderTop: pos.startsWith("t") ? "2px solid #D4AF37" : "none",
            borderBottom: pos.startsWith("b") ? "2px solid #D4AF37" : "none",
            borderLeft: pos.endsWith("l") ? "2px solid #D4AF37" : "none",
            borderRight: pos.endsWith("r") ? "2px solid #D4AF37" : "none",
          }} />
        ))}

        {/* Inner border */}
        <div style={{ position:"absolute", inset:"8px", border:"1px solid rgba(212,175,55,0.12)", pointerEvents:"none" }} />

        {/* Crest */}
        <div style={{ textAlign:"center", marginBottom:"1.6rem" }}>
          <div style={{
            width:90, height:90, borderRadius:"50%",
            border:"1px solid rgba(212,175,55,0.5)",
            margin:"0 auto 1rem",
            display:"flex", alignItems:"center", justifyContent:"center",
            position:"relative",
            boxShadow:"0 0 30px rgba(255,107,170,0.15)",
          }}>
            <div style={{ position:"absolute", inset:4, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.2)" }} />
            <Image src="/crest.png" alt="KGE" width={74} height={74} style={{ borderRadius:"50%", objectFit:"cover" }} />
          </div>
          <p className="font-cinzel" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"rgba(255,107,170,0.6)", textTransform:"uppercase", marginBottom:"0.4rem" }}>Sisterhood Access</p>
          <h1 className="font-cinzel-deco" style={{ fontSize:"1.4rem", color:"var(--cream)", marginBottom:"0.3rem" }}>Enter the Sanctuary</h1>
          <div style={{ width:60, height:1, background:"linear-gradient(90deg, transparent, #D4AF37, transparent)", margin:"0.6rem auto" }} />
        </div>

        {/* ── STAGE: LOGIN ── */}
        {stage === "login" && (
          <form onSubmit={handleLogin}>
            <p style={{ fontSize:"0.88rem", color:"rgba(245,237,216,0.5)", textAlign:"center", lineHeight:1.7, marginBottom:"1.6rem", fontFamily:"'Cormorant Garamond', serif", fontStyle:"italic" }}>
              Enter your SL username and password.<br/>
              First time? Use the one-time password given to you by your sisters.
            </p>

            <div style={{ marginBottom:"1.1rem" }}>
              <label className="font-cinzel" style={{ display:"block", fontSize:"0.56rem", letterSpacing:"0.2em", color:"rgba(212,175,55,0.7)", textTransform:"uppercase", marginBottom:"0.5rem" }}>SL Username</label>
              <input type="text" placeholder="e.g. lkarats" value={slName} onChange={e=>setSlName(e.target.value)}
                style={inputStyle}
                onFocus={e=>(e.target.style.borderColor="rgba(255,107,170,0.6)")}
                onBlur={e=>(e.target.style.borderColor="rgba(212,175,55,0.25)")}
                required />
            </div>

            <div style={{ marginBottom:"1.4rem" }}>
              <label className="font-cinzel" style={{ display:"block", fontSize:"0.56rem", letterSpacing:"0.2em", color:"rgba(212,175,55,0.7)", textTransform:"uppercase", marginBottom:"0.5rem" }}>Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)}
                style={inputStyle}
                onFocus={e=>(e.target.style.borderColor="rgba(255,107,170,0.6)")}
                onBlur={e=>(e.target.style.borderColor="rgba(212,175,55,0.25)")}
                required />
            </div>

            <label style={{ display:"flex", alignItems:"center", gap:"0.6rem", cursor:"pointer", marginBottom:"1.6rem" }}>
              <div onClick={()=>setRemember(!remember)} style={{
                width:16, height:16, border:"1px solid rgba(212,175,55,0.4)",
                background: remember ? "rgba(255,107,170,0.3)" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0, cursor:"pointer",
              }}>
                {remember && <span style={{ color:"#ff6baa", fontSize:"10px" }}>✓</span>}
              </div>
              <span style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.5)", fontFamily:"'Cormorant Garamond', serif" }}>Remember me for 30 days</span>
            </label>

            {error && <p style={{ color:"#ff6baa", fontSize:"0.82rem", marginBottom:"1rem", textAlign:"center", fontFamily:"'Cormorant Garamond', serif" }}>{error}</p>}

            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"0.85rem",
              background: loading ? "rgba(255,107,170,0.1)" : "rgba(255,107,170,0.15)",
              border:"1px solid rgba(255,107,170,0.4)",
              color:"#ff9ec8", cursor: loading ? "not-allowed" : "pointer",
              fontFamily:"'Cinzel', serif", fontSize:"0.7rem", letterSpacing:"0.25em",
              textTransform:"uppercase", transition:"all 0.3s",
            }}
            onMouseEnter={e=>{ if(!loading)(e.currentTarget.style.background="rgba(255,107,170,0.25)"); }}
            onMouseLeave={e=>{ e.currentTarget.style.background=loading?"rgba(255,107,170,0.1)":"rgba(255,107,170,0.15)"; }}
            >
              {loading ? "Entering..." : "Enter the Sanctuary →"}
            </button>

            <p className="font-cinzel" style={{ textAlign:"center", fontSize:"0.5rem", letterSpacing:"0.15em", color:"rgba(245,237,216,0.2)", marginTop:"1.4rem", textTransform:"uppercase" }}>
              Access is granted only to verified sisters of ΚΓΗ
            </p>
          </form>
        )}

        {/* ── STAGE: SET PASSWORD ── */}
        {stage === "set_password" && (
          <form onSubmit={handleSetPassword}>
            <p style={{ fontSize:"0.88rem", color:"rgba(245,237,216,0.5)", textAlign:"center", lineHeight:1.7, marginBottom:"1.6rem", fontFamily:"'Cormorant Garamond', serif", fontStyle:"italic" }}>
              Welcome, sister. Please set your personal password to protect your account.
            </p>

            <div style={{ marginBottom:"1.1rem" }}>
              <label className="font-cinzel" style={{ display:"block", fontSize:"0.56rem", letterSpacing:"0.2em", color:"rgba(212,175,55,0.7)", textTransform:"uppercase", marginBottom:"0.5rem" }}>New Password</label>
              <input type="password" placeholder="At least 6 characters" value={newPassword} onChange={e=>setNewPassword(e.target.value)}
                style={inputStyle}
                onFocus={e=>(e.target.style.borderColor="rgba(255,107,170,0.6)")}
                onBlur={e=>(e.target.style.borderColor="rgba(212,175,55,0.25)")}
                required />
            </div>

            <div style={{ marginBottom:"1.6rem" }}>
              <label className="font-cinzel" style={{ display:"block", fontSize:"0.56rem", letterSpacing:"0.2em", color:"rgba(212,175,55,0.7)", textTransform:"uppercase", marginBottom:"0.5rem" }}>Confirm Password</label>
              <input type="password" placeholder="Repeat your password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)}
                style={inputStyle}
                onFocus={e=>(e.target.style.borderColor="rgba(255,107,170,0.6)")}
                onBlur={e=>(e.target.style.borderColor="rgba(212,175,55,0.25)")}
                required />
            </div>

            {error && <p style={{ color:"#ff6baa", fontSize:"0.82rem", marginBottom:"1rem", textAlign:"center", fontFamily:"'Cormorant Garamond', serif" }}>{error}</p>}

            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"0.85rem",
              background:"rgba(255,107,170,0.15)", border:"1px solid rgba(255,107,170,0.4)",
              color:"#ff9ec8", cursor: loading ? "not-allowed" : "pointer",
              fontFamily:"'Cinzel', serif", fontSize:"0.7rem", letterSpacing:"0.25em", textTransform:"uppercase",
            }}>
              {loading ? "Setting password..." : "Set Password & Enter →"}
            </button>
          </form>
        )}

        {/* ── STAGE: SUCCESS ── */}
        {stage === "success" && (
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <div style={{ fontSize:"2rem", marginBottom:"1rem" }}>💙</div>
            <p className="font-cormorant" style={{ fontSize:"1.2rem", fontStyle:"italic", color:"#ff9ec8", marginBottom:"0.5rem" }}>
              Welcome, {memberName}
            </p>
            <p className="font-cinzel" style={{ fontSize:"0.58rem", letterSpacing:"0.2em", color:"rgba(212,175,55,0.6)", textTransform:"uppercase" }}>
              Entering the sanctuary...
            </p>
            <div style={{ width:60, height:1, background:"linear-gradient(90deg, transparent, #D4AF37, transparent)", margin:"1rem auto 0" }} />
          </div>
        )}
      </div>

      {/* Gold bottom bar */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, height:"3px", background:"linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)", opacity:0.7, zIndex:10 }} />
    </main>
  );
}
