"use client";
import { useState, useEffect, useCallback } from "react";

type Entry = {
  id: string;
  commit_message: string;
  branch: string;
  deployed_at: string;
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = Math.floor(diff / 86400);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ActivitySection() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/changelog");
    const d = await r.json();
    setEntries(d.entries || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const lbl: React.CSSProperties = {
    fontFamily: "'Cinzel',serif",
    fontSize: "0.46rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(212,175,55,0.5)",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.6rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "1.5rem", color: "#F5EDD8" }}>What&apos;s New</div>
          <div style={{ fontStyle: "italic", fontSize: "0.88rem", color: "rgba(245,237,216,0.4)" }}>
            Updates to the portal — automatically posted when changes are deployed
          </div>
        </div>
        <button onClick={load} style={{ padding: "0.5rem 1rem", fontFamily: "'Cinzel',serif", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", cursor: "pointer" }}>
          ↺ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "rgba(245,237,216,0.3)", fontStyle: "italic" }}>
          Loading updates…
        </div>
      ) : entries.length === 0 ? (
        <div style={{ background: "#120709", border: "1px solid rgba(212,175,55,0.1)", padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>✨</div>
          <p style={{ color: "rgba(245,237,216,0.35)", fontStyle: "italic" }}>No updates yet.</p>
          <p style={{ color: "rgba(245,237,216,0.2)", fontSize: "0.85rem" }}>Updates will appear here after the next site deployment.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0", borderLeft: "1px solid rgba(212,175,55,0.12)", marginLeft: "0.6rem" }}>
          {entries.map((entry, i) => (
            <div key={entry.id} style={{ position: "relative", paddingLeft: "1.8rem", paddingBottom: "1.2rem" }}>
              {/* Timeline dot */}
              <div style={{
                position: "absolute", left: -7, top: 6,
                width: 13, height: 13, borderRadius: "50%",
                background: "#0e050a",
                border: `2px solid ${i === 0 ? "#D4AF37" : "rgba(212,175,55,0.3)"}`,
              }} />

              <div style={{
                background: "#120709",
                border: "1px solid rgba(212,175,55,0.1)",
                borderLeft: `2px solid ${i === 0 ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.15)"}`,
                padding: "0.9rem 1.1rem",
                position: "relative",
                overflow: "hidden",
              }}>
                {i === 0 && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, rgba(212,175,55,0.4), transparent)" }} />
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    {i === 0 && (
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.42rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#D4AF37", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", padding: "0.1rem 0.5rem", marginBottom: "0.5rem", display: "inline-block" }}>
                        Latest
                      </span>
                    )}
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: "#F5EDD8", marginTop: i === 0 ? "0.3rem" : 0, lineHeight: 1.5 }}>
                      {entry.commit_message}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ ...lbl }}>{timeAgo(entry.deployed_at)}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(245,237,216,0.2)", marginTop: 2 }}>{fmtDate(entry.deployed_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1.5rem", padding: "0.8rem 1rem", background: "rgba(123,3,35,0.08)", border: "1px solid rgba(123,3,35,0.15)" }}>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(245,237,216,0.3)", fontStyle: "italic" }}>
          ✨ This page updates automatically whenever improvements are made to the portal
        </p>
      </div>
    </div>
  );
}
