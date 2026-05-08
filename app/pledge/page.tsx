"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type PledgeData = {
  id: string; sl_name: string; display_name: string;
  pledge_name: string | null; pledge_start: string | null;
  pledge_duration_days: number; pledge_status: string; role: string;
};

function pad(n: number) { return n.toString().padStart(2, "0"); }

function Countdown({ start, days }: { start: string; days: number }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const end = new Date(new Date(start).getTime() + days * 86400000);
      const diff = end.getTime() - Date.now();
      if (diff <= 0) { setRemaining("Process period has ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [start, days]);

  return <span>{remaining}</span>;
}

export default function PledgePage() {
  const router = useRouter();
  const [data, setData] = useState<PledgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pledge-status")
      .then(r => r.json())
      .then(d => {
        if (d.error) { router.push("/login"); return; }
        // If pledge is complete (now Sister), redirect to portal
        if (d.role === "Sister") { router.push("/portal"); return; }
        setData(d);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0306", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Cinzel',serif", color: "rgba(212,175,55,0.5)", letterSpacing: "0.2em" }}>Loading…</div>
    </div>
  );

  if (!data) return null;

  // Rejected — locked out
  if (data.pledge_status === "rejected") return (
    <div style={{ minHeight: "100vh", background: "#0a0306", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: 500, width: "100%", background: "#120709", border: "1px solid rgba(123,3,35,0.4)", padding: "3rem 2.5rem", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "1.4rem", color: "#D4AF37", marginBottom: "0.5rem" }}>Κ Γ Η</div>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent)", margin: "1rem 0 2rem" }} />
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🕊️</div>
        <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "1rem", color: "#F5EDD8", marginBottom: "1.2rem" }}>Your Pledging Journey</p>
        <p style={{ lineHeight: 1.9, color: "rgba(245,237,216,0.6)", marginBottom: "1.5rem" }}>
          After careful reflection, the Founders of Kappa Gamma Eta have made a decision regarding your pledging process.
          Your pledging process was <strong style={{ color: "#ff6baa" }}>unsuccessful</strong>.
        </p>
        <p style={{ lineHeight: 1.9, color: "rgba(245,237,216,0.45)", fontSize: "0.9rem" }}>
          We wish you all the best on your journey. This portal is no longer accessible.
        </p>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)", margin: "2rem 0 1.5rem" }} />
        <p style={{ fontStyle: "italic", color: "rgba(245,237,216,0.3)", fontSize: "0.85rem" }}>— The Founders of Kappa Gamma Eta</p>
      </div>
    </div>
  );

  // Active or Not Successful (still pledging)
  const hasPledgeName = data.pledge_name && data.pledge_name.trim() !== "";
  const hasTimer = data.pledge_start && data.pledge_duration_days;
  const isNotSuccessful = data.pledge_status === "not_successful";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0306", color: "#F5EDD8", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        @keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes floatIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "1.2rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "1.1rem", color: "#D4AF37", letterSpacing: "0.08em" }}>Κ Γ Η</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.48rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(212,175,55,0.45)" }}>Pledge Portal</div>
        <button onClick={() => { document.cookie = "kge_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"; router.push("/login"); }}
          style={{ fontFamily: "'Cinzel',serif", fontSize: "0.46rem", letterSpacing: "0.15em", background: "none", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(245,237,216,0.4)", padding: "0.3rem 0.7rem", cursor: "pointer" }}>
          Sign Out
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "4rem 2rem", animation: "floatIn 0.6s ease" }}>

        {/* Welcome */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(212,175,55,0.5)", marginBottom: "0.6rem" }}>Welcome, Pledge</div>
          <h1 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#F5EDD8", margin: "0 0 0.5rem", lineHeight: 1.2 }}>
            {hasPledgeName ? data.pledge_name : data.display_name}
          </h1>
          <div style={{ height: 1, width: 80, background: "linear-gradient(90deg,transparent,#D4AF37,transparent)", margin: "1rem auto" }} />
          <p style={{ fontStyle: "italic", color: "rgba(245,237,216,0.5)", fontSize: "1rem" }}>
            "She is strong like whiskey, but soft like wine."
          </p>
        </div>

        {/* Status banner */}
        {isNotSuccessful && (
          <div style={{ background: "rgba(255,107,170,0.06)", border: "1px solid rgba(255,107,170,0.25)", padding: "1rem 1.4rem", marginBottom: "2rem", textAlign: "center" }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#ff6baa", margin: 0 }}>
              ⏳ Your pledging process is still in progress — keep going, Sister.
            </p>
          </div>
        )}

        {/* Timer card */}
        {hasTimer ? (
          <div style={{ background: "#120709", border: "1px solid rgba(212,175,55,0.18)", padding: "2rem", marginBottom: "1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent)" }} />
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.5rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(212,175,55,0.55)", marginBottom: "1rem" }}>Pledging Period Ends In</div>
            <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "clamp(1.4rem,4vw,2rem)", color: "#D4AF37", letterSpacing: "0.08em", animation: "shimmer 2s ease-in-out infinite" }}>
              <Countdown start={data.pledge_start!} days={data.pledge_duration_days} />
            </div>
            <div style={{ marginTop: "0.8rem", fontFamily: "'Cinzel',serif", fontSize: "0.44rem", letterSpacing: "0.15em", color: "rgba(245,237,216,0.3)", textTransform: "uppercase" }}>
              {data.pledge_duration_days} day process · Started {new Date(data.pledge_start!).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        ) : (
          <div style={{ background: "#120709", border: "1px solid rgba(212,175,55,0.1)", padding: "2rem", marginBottom: "1.5rem", textAlign: "center" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.5rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(212,175,55,0.3)", marginBottom: "0.5rem" }}>Pledging Period</div>
            <div style={{ color: "rgba(245,237,216,0.3)", fontStyle: "italic" }}>Your Founders will set your pledging timeline shortly.</div>
          </div>
        )}

        {/* Status card */}
        <div style={{ background: "#120709", border: "1px solid rgba(212,175,55,0.14)", padding: "2rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)" }} />
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.5rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(212,175,55,0.55)", marginBottom: "1.2rem" }}>Your Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: isNotSuccessful ? "#ff6baa" : "#35df24", display: "inline-block", boxShadow: `0 0 8px ${isNotSuccessful ? "#ff6baa" : "#35df24"}`, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: isNotSuccessful ? "#ff6baa" : "#35df24" }}>
              {isNotSuccessful ? "Process Continuing" : "Pledging In Progress"}
            </span>
          </div>
          {hasPledgeName && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(212,175,55,0.08)" }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.46rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(212,175,55,0.4)" }}>Pledge Name — </span>
              <span style={{ color: "#ff6baa", fontFamily: "'Cinzel Decorative',serif", fontSize: "0.9rem" }}>{data.pledge_name}</span>
            </div>
          )}
        </div>

        {/* Welcome message */}
        <div style={{ background: "rgba(123,3,35,0.08)", border: "1px solid rgba(123,3,35,0.2)", padding: "2rem 2rem", marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.5rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(212,175,55,0.55)", marginBottom: "1.2rem" }}>A Message From Your Founders</div>
          <p style={{ lineHeight: 2, color: "rgba(245,237,216,0.7)", marginBottom: "1rem" }}>
            Welcome to the beginning of something beautiful. The pledging process is a sacred journey — one that will shape you, challenge you, and ultimately reveal the sister we already know you can be.
          </p>
          <p style={{ lineHeight: 2, color: "rgba(245,237,216,0.7)", marginBottom: "0" }}>
            Be present. Be intentional. Be the woman you are called to be. Your Founders are watching with pride.
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "1rem", color: "rgba(212,175,55,0.3)", letterSpacing: "0.15em" }}>Κ Γ Η</div>
        </div>
      </div>
    </div>
  );
}
