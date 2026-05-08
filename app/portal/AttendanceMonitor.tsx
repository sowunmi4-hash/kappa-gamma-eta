"use client";
import { useState, useEffect, useCallback } from "react";

type Session = {
  id: string; sister: string; sl_name: string;
  event_title: string; event_date: string;
  total_seconds: number; last_ping: string;
  base_complete: boolean; bonus_hours: number; updated_at: string;
};

function fmtTime(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2,"0")}m ${s.toString().padStart(2,"0")}s`;
  return `${m}m ${s.toString().padStart(2,"0")}s`;
}

function timeSince(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
}

function isOnline(lastPing: string) {
  return (Date.now() - new Date(lastPing).getTime()) < 600000; // < 10 min
}

export default function AttendanceMonitor() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tick, setTick]         = useState(0);

  const load = useCallback(async () => {
    const r = await fetch("/api/events/attendance/sessions");
    const d = await r.json();
    setSessions(d.sessions || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Refresh data every 30s and tick every second for live display
  useEffect(() => {
    const dataTimer  = setInterval(load, 30000);
    const tickTimer  = setInterval(() => setTick(t => t + 1), 1000);
    return () => { clearInterval(dataTimer); clearInterval(tickTimer); };
  }, [load]);

  const lbl: React.CSSProperties = { fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"1.6rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#D4AF37", marginBottom:"0.35rem" }}>Admin Only</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Attendance Monitor</div>
          <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)" }}>Live paddle tracker sessions — refreshes every 30s</div>
        </div>
        <button onClick={load} style={{ padding:"0.5rem 1rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", background:"rgba(212,175,55,0.1)", border:"1px solid rgba(212,175,55,0.3)", color:"#D4AF37", cursor:"pointer" }}>
          ↺ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding:"3rem", textAlign:"center", color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>Loading sessions…</div>
      ) : sessions.length === 0 ? (
        <div style={{ background:"#120709", border:"1px solid rgba(212,175,55,0.1)", padding:"3rem", textAlign:"center" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>📡</div>
          <p style={{ color:"rgba(245,237,216,0.35)", fontStyle:"italic" }}>No attendance sessions yet.</p>
          <p style={{ color:"rgba(245,237,216,0.2)", fontSize:"0.85rem" }}>Sessions appear when a sister wears the paddle during an active event.</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {sessions.map(s => {
            const online   = isOnline(s.last_ping);
            const progress = Math.min(100, (s.total_seconds / 3600) * 100);
            const nextBonus= s.base_complete
              ? Math.max(0, 3600 - (s.total_seconds % 3600))
              : Math.max(0, 3600 - s.total_seconds);

            return (
              <div key={s.id} style={{ background:"#120709", border:`1px solid ${online ? "rgba(53,223,36,0.2)" : "rgba(212,175,55,0.1)"}`, overflow:"hidden", position:"relative" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${online ? "#35df24" : "rgba(212,175,55,0.3)"}, transparent)` }} />
                <div style={{ padding:"1.2rem 1.5rem" }}>
                  {/* Header */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"0.8rem", marginBottom:"1rem" }}>
                    <div>
                      <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.95rem", color:"#F5EDD8", marginBottom:"0.2rem" }}>{s.sister}</div>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(245,237,216,0.35)" }}>@{s.sl_name}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background: online ? "#35df24" : "rgba(245,237,216,0.2)", display:"inline-block", boxShadow: online ? "0 0 8px #35df24" : "none", flexShrink:0 }} />
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", color: online ? "#35df24" : "rgba(245,237,216,0.3)" }}>
                        {online ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  {/* Event */}
                  <div style={{ background:"rgba(212,175,55,0.05)", border:"1px solid rgba(212,175,55,0.1)", padding:"0.6rem 0.9rem", marginBottom:"1rem" }}>
                    <span style={lbl}>Event — </span>
                    <span style={{ color:"#D4AF37", fontSize:"0.9rem" }}>{s.event_title}</span>
                    <span style={{ color:"rgba(245,237,216,0.3)", fontSize:"0.8rem", marginLeft:"0.5rem" }}>({new Date(s.event_date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})})</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom:"1rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.4rem" }}>
                      <span style={lbl}>Time Accumulated</span>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color: s.base_complete ? "#35df24" : "#D4AF37" }}>
                        {fmtTime(s.total_seconds)}
                      </span>
                    </div>
                    <div style={{ height:6, background:"rgba(245,237,216,0.06)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${progress}%`, background: s.base_complete ? "#35df24" : "linear-gradient(90deg,#D4AF37,#ff6baa)", borderRadius:3, transition:"width 0.5s ease" }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:"0.3rem" }}>
                      <span style={{ fontSize:"0.75rem", color:"rgba(245,237,216,0.25)" }}>0m</span>
                      <span style={{ fontSize:"0.75rem", color: s.base_complete ? "rgba(53,223,36,0.5)" : "rgba(245,237,216,0.25)" }}>
                        {s.base_complete ? "✓ 1hr complete" : "60m goal"}
                      </span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
                    <div>
                      <div style={lbl}>Last Ping</div>
                      <div style={{ color: online ? "#35df24" : "rgba(245,237,216,0.4)", fontSize:"0.85rem", fontFamily:"'Cinzel',serif" }}>
                        {timeSince(s.last_ping)}
                      </div>
                    </div>
                    <div>
                      <div style={lbl}>Status</div>
                      <div style={{ fontSize:"0.85rem", color: s.base_complete ? "#35df24" : "#D4AF37" }}>
                        {s.base_complete ? `✓ Done${s.bonus_hours > 0 ? ` +${s.bonus_hours} bonus` : ""}` : "Tracking…"}
                      </div>
                    </div>
                    <div>
                      <div style={lbl}>{s.base_complete ? "Next Bonus In" : "1hr Goal In"}</div>
                      <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.6)", fontFamily:"'Cinzel',serif" }}>
                        {fmtTime(nextBonus)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop:"1.5rem", padding:"0.8rem 1rem", background:"rgba(123,3,35,0.08)", border:"1px solid rgba(123,3,35,0.15)" }}>
        <p style={{ margin:0, fontSize:"0.8rem", color:"rgba(245,237,216,0.3)", fontStyle:"italic" }}>
          🟢 Online = paddle pinged within last 10 min &nbsp;·&nbsp; Data auto-refreshes every 30s &nbsp;·&nbsp; Sessions appear only during active event time windows
        </p>
      </div>
    </div>
  );
}
