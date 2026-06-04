"use client";
import { useState, useEffect, useCallback } from "react";

type Entry = {
  id: string;
  action: string;
  category: string;
  actor_name: string;
  actor_role: string;
  target_name: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

const CATEGORY_ICON: Record<string, string> = {
  Chalice: "🏺", Events: "📅", Dues: "💰", Applications: "📋",
  Roster: "👑", TDA: "⚡", Voice: "💙", Gallery: "🌸", Probation: "⚠️",
};

const CATEGORIES = ["All", "Chalice", "Events", "Dues", "Applications", "Roster", "TDA", "Voice", "Gallery", "Probation"];

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtDate(ts: string) {
  return new Date(ts).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AuditLogSection() {
  const [entries,  setEntries]  = useState<Entry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("All");

  const load = useCallback(async (cat: string) => {
    setLoading(true);
    const url = cat === "All" ? "/api/audit" : `/api/audit?category=${encodeURIComponent(cat)}`;
    const r = await fetch(url);
    const d = await r.json();
    setEntries(d.entries || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(filter); }, [load, filter]);

  const lbl: React.CSSProperties = {
    fontFamily: "'Cinzel',serif", fontSize: "0.44rem",
    letterSpacing: "0.12em", textTransform: "uppercase",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.6rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "1.5rem", color: "#F5EDD8" }}>Audit Log</div>
          <div style={{ fontStyle: "italic", fontSize: "0.88rem", color: "rgba(245,237,216,0.4)" }}>
            Full record of every action taken across the portal
          </div>
        </div>
        <button onClick={() => load(filter)} style={{ padding: "0.5rem 1rem", fontFamily: "'Cinzel',serif", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", cursor: "pointer" }}>
          ↺ Refresh
        </button>
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.6rem" }}>
        {CATEGORIES.map(c => {
          const active = filter === c;
          return (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: "0.3rem 0.9rem",
              fontFamily: "'Cinzel',serif", fontSize: "0.46rem", letterSpacing: "0.1em", textTransform: "uppercase",
              background: active ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.04)",
              border: `1px solid ${active ? "rgba(212,175,55,0.45)" : "rgba(212,175,55,0.12)"}`,
              color: active ? "#D4AF37" : "rgba(245,237,216,0.35)",
              cursor: "pointer",
            }}>
              {CATEGORY_ICON[c] || ""} {c}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "rgba(245,237,216,0.3)", fontStyle: "italic" }}>Loading audit log…</div>
      ) : entries.length === 0 ? (
        <div style={{ background: "#120709", border: "1px solid rgba(212,175,55,0.1)", padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>📋</div>
          <p style={{ color: "rgba(245,237,216,0.35)", fontStyle: "italic" }}>No entries yet.</p>
        </div>
      ) : (
        <div style={{ background: "#120709", border: "1px solid rgba(212,175,55,0.1)", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 0.8fr 0.7fr", gap: "1rem", padding: "0.7rem 1.2rem", borderBottom: "1px solid rgba(212,175,55,0.15)", background: "rgba(212,175,55,0.05)" }}>
            {["Action", "Target", "By", "Role", "When"].map(h => (
              <div key={h} style={{ ...lbl, color: "rgba(212,175,55,0.5)" }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {entries.map((e, i) => (
            <div key={e.id} style={{
              display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 0.8fr 0.7fr",
              gap: "1rem", padding: "0.75rem 1.2rem",
              borderBottom: i < entries.length - 1 ? "1px solid rgba(212,175,55,0.06)" : "none",
              background: i % 2 === 0 ? "transparent" : "rgba(212,175,55,0.02)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem" }}>{CATEGORY_ICON[e.category] || "•"}</span>
                <span style={{ fontSize: "0.82rem", color: "#F5EDD8" }}>{e.action}</span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "rgba(245,237,216,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.target_name || "—"}>
                {e.target_name || <span style={{ color: "rgba(245,237,216,0.2)" }}>—</span>}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#ff9ec8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.actor_name}</div>
              <div style={{ ...lbl, color: "rgba(212,175,55,0.45)", fontSize: "0.42rem" }}>{e.actor_role}</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...lbl, color: "rgba(245,237,216,0.25)", fontSize: "0.42rem" }}>{timeAgo(e.created_at)}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(245,237,216,0.15)", marginTop: 2 }}>{fmtDate(e.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1rem", padding: "0.7rem 1rem", background: "rgba(123,3,35,0.08)", border: "1px solid rgba(123,3,35,0.15)" }}>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(245,237,216,0.25)", fontStyle: "italic" }}>
          📋 Showing last 200 entries · Visible to Founders and Admins only
        </p>
      </div>
    </div>
  );
}
