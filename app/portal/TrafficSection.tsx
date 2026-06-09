"use client";
import { useState, useEffect, useCallback } from "react";

type Stats = {
  total_views:   number;
  today:         number;
  this_week:     number;
  this_month:    number;
  top_pages:     { path: string; views: number }[];
  daily:         { date: string; views: number }[];
  top_referrers: { referrer: string; views: number }[];
};

export default function TrafficSection() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/traffic");
    const d = await r.json();
    setStats(d);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const card: React.CSSProperties = { background: "#120709", border: "1px solid rgba(212,175,55,0.1)", padding: "1.2rem 1.4rem" };
  const lbl: React.CSSProperties = { fontFamily: "'Cinzel',serif", fontSize: "0.44rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(212,175,55,0.5)" };

  const maxDaily = stats ? Math.max(...stats.daily.map(d => d.views), 1) : 1;
  const maxPage  = stats ? Math.max(...stats.top_pages.map(p => p.views), 1) : 1;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.6rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "1.5rem", color: "#F5EDD8" }}>Traffic</div>
          <div style={{ fontStyle: "italic", fontSize: "0.88rem", color: "rgba(245,237,216,0.4)" }}>Public website visitor analytics</div>
        </div>
        <button onClick={load} style={{ padding: "0.5rem 1rem", fontFamily: "'Cinzel',serif", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", cursor: "pointer" }}>↺ Refresh</button>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "rgba(245,237,216,0.3)", fontStyle: "italic" }}>Loading traffic data…</div>
      ) : !stats ? (
        <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "rgba(245,237,216,0.3)", fontStyle: "italic" }}>No data yet — data will appear as visitors come to the site.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

          {/* ── Stats row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {[
              { label: "All Time",   value: stats.total_views },
              { label: "Today",      value: stats.today },
              { label: "This Week",  value: stats.this_week },
              { label: "This Month", value: stats.this_month },
            ].map(s => (
              <div key={s.label} style={{ ...card, textAlign: "center" }}>
                <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "2rem", color: "#D4AF37", lineHeight: 1.1 }}>{s.value.toLocaleString()}</div>
                <div style={{ ...lbl, marginTop: "0.5rem" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Daily chart (last 14 days) ── */}
          {stats.daily.length > 0 && (
            <div style={{ ...card }}>
              <div style={{ ...lbl, marginBottom: "1.2rem" }}>Daily Views — Last 14 Days</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0.4rem", height: 120 }}>
                {[...stats.daily].reverse().map(d => (
                  <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: "0.6rem", color: "rgba(212,175,55,0.6)", fontFamily: "'Cinzel',serif" }}>{d.views || ""}</div>
                    <div style={{ width: "100%", background: "rgba(212,175,55,0.25)", borderTop: "2px solid rgba(212,175,55,0.6)", height: `${Math.max(4, (d.views / maxDaily) * 90)}px`, transition: "height 0.3s" }} />
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.36rem", color: "rgba(245,237,216,0.25)", letterSpacing: "0.05em", textAlign: "center" }}>
                      {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

            {/* ── Top pages ── */}
            <div style={{ ...card }}>
              <div style={{ ...lbl, marginBottom: "1rem" }}>Top Pages</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {stats.top_pages.length === 0 ? (
                  <p style={{ fontStyle: "italic", color: "rgba(245,237,216,0.25)", fontSize: "0.85rem" }}>No data yet</p>
                ) : stats.top_pages.map(p => (
                  <div key={p.path}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.82rem", color: "rgba(245,237,216,0.6)" }}>{p.path || "/"}</span>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.46rem", color: "#D4AF37" }}>{p.views}</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(245,237,216,0.06)", borderRadius: 2 }}>
                      <div style={{ height: "100%", background: "rgba(212,175,55,0.4)", width: `${(p.views / maxPage) * 100}%`, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Top referrers ── */}
            <div style={{ ...card }}>
              <div style={{ ...lbl, marginBottom: "1rem" }}>Where Visitors Come From</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                {stats.top_referrers.length === 0 ? (
                  <p style={{ fontStyle: "italic", color: "rgba(245,237,216,0.25)", fontSize: "0.85rem" }}>No referrer data yet</p>
                ) : stats.top_referrers.map(r => (
                  <div key={r.referrer} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.82rem", color: "rgba(245,237,216,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{r.referrer}</span>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.46rem", color: "#D4AF37", flexShrink: 0 }}>{r.views} visits</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: "0.7rem 1rem", background: "rgba(123,3,35,0.08)", border: "1px solid rgba(123,3,35,0.15)" }}>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(245,237,216,0.25)", fontStyle: "italic" }}>
              📊 Tracking public pages only — portal, login and API routes are excluded
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
