"use client";
import { useState, useEffect, useCallback } from "react";

type Member = { id:string; display_name:string; frat_name:string; role:string };
type Post   = { id:string; title:string; content:string; posted_by_name:string; pinned:boolean; created_at:string };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (d:string) => { const dt=new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };
const isOfficer = (role:string) => ["Admin","Founder","President"].includes(role);

const card:  React.CSSProperties = { background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"1.5rem 1.6rem", marginBottom:"1rem" };
const input: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", outline:"none" };
const label: React.CSSProperties = { display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.6)", marginBottom:"0.4rem" };

export default function ChaliceSection({ member }: { member: Member }) {
  const [posts,     setPosts]     = useState<Post[]>([]);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState("");
  const [title,     setTitle]     = useState("");
  const [content,   setContent]   = useState("");
  const [pinned,    setPinned]    = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/news");
    setPosts(await r.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title||!content) { setMsg("Title and content are required."); return; }
    setSaving(true); setMsg("");
    const r = await fetch("/api/news", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"create", title, content, pinned }) });
    const d = await r.json();
    if (d.success) {
      setMsg("✓ Post published!"); setTitle(""); setContent(""); setPinned(false); setShowForm(false); load();
    } else setMsg(d.error||"Something went wrong.");
    setSaving(false);
  };

  const handleDelete = async (id:string) => {
    if (!confirm("Delete this post?")) return;
    await fetch("/api/news", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"delete", id }) });
    load();
  };

  const handlePin = async (id:string, currentPinned:boolean) => {
    await fetch("/api/news", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"toggle_pin", id, pinned: !currentPinned }) });
    load();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"1.6rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--wine-lt)", marginBottom:"0.35rem" }}>Internal</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>The Chalice</div>
          <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)" }}>Sisterhood announcements & news</div>
        </div>
        {isOfficer(member.role) && (
          <button onClick={()=>{ setShowForm(!showForm); setMsg(""); }} style={{
            padding:"0.55rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem",
            letterSpacing:"0.18em", textTransform:"uppercase",
            background: showForm?"rgba(123,3,35,0.15)":"rgba(255,107,170,0.15)",
            border: showForm?"1px solid rgba(123,3,35,0.4)":"1px solid rgba(255,107,170,0.4)",
            color: showForm?"var(--wine-lt)":"#ff9ec8", cursor:"pointer", transition:"all 0.2s",
          }}>
            {showForm ? "✕ Cancel" : "🏺 New Post"}
          </button>
        )}
      </div>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(123,3,35,0.6),transparent)", marginBottom:"1.6rem", opacity:0.6 }} />

      {/* Create post form */}
      {showForm && isOfficer(member.role) && (
        <form onSubmit={handleCreate} style={{ ...card, border:"1px solid rgba(123,3,35,0.35)", background:"rgba(123,3,35,0.08)", marginBottom:"1.6rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--wine-lt)", marginBottom:"1.2rem" }}>New Announcement</div>

          <div style={{ marginBottom:"1rem" }}>
            <label style={label}>Title *</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Sisterhood Mixer — This Saturday!" style={input} required />
          </div>

          <div style={{ marginBottom:"1rem" }}>
            <label style={label}>Message *</label>
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={5} placeholder="Write your announcement here…" style={{ ...input, resize:"vertical" }} required />
          </div>

          <div onClick={()=>setPinned(!pinned)} style={{ display:"flex", alignItems:"center", gap:"0.6rem", cursor:"pointer", marginBottom:"1.2rem" }}>
            <div style={{ width:15, height:15, border:"1px solid rgba(212,175,55,0.4)", background:pinned?"rgba(123,3,35,0.4)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {pinned && <span style={{ color:"var(--wine-lt)", fontSize:"10px" }}>✓</span>}
            </div>
            <span style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.5)" }}>📌 Pin this post to the top</span>
          </div>

          {msg && <p style={{ fontSize:"0.85rem", color:msg.startsWith("✓")?"#4DB87A":"#ff6baa", fontStyle:"italic", marginBottom:"0.8rem" }}>{msg}</p>}

          <button type="submit" disabled={saving} style={{
            padding:"0.65rem 2rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem",
            letterSpacing:"0.2em", textTransform:"uppercase",
            background:"rgba(123,3,35,0.2)", border:"1px solid rgba(123,3,35,0.5)",
            color:"var(--wine-lt)", cursor:saving?"not-allowed":"pointer", opacity:saving?0.5:1,
          }}>
            {saving ? "Publishing…" : "Publish Post →"}
          </button>
        </form>
      )}

      {/* Posts */}
      {posts.length ? posts.map(p => (
        <div key={p.id} className="anim-card" style={card}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.8rem", flexWrap:"wrap", gap:"0.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.3)", background:"rgba(255,107,170,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem" }}>🌸</div>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--wine-lt)" }}>{p.posted_by_name}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.7rem" }}>
              {p.pinned && <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--wine-lt)", border:"1px solid rgba(123,3,35,0.4)", padding:"0.18rem 0.5rem", background:"rgba(123,3,35,0.12)" }}>📌 Pinned</span>}
              <span style={{ fontStyle:"italic", fontSize:"0.78rem", color:"rgba(245,237,216,0.25)" }}>{fmt(p.created_at)}</span>
              {isOfficer(member.role) && (
                <div style={{ display:"flex", gap:"0.4rem" }}>
                  <button onClick={()=>handlePin(p.id, p.pinned)} title={p.pinned?"Unpin":"Pin"} style={{ padding:"0.2rem 0.5rem", fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", border:"1px solid rgba(212,175,55,0.2)", background:"transparent", color:"rgba(212,175,55,0.5)" }}>
                    {p.pinned?"Unpin":"Pin"}
                  </button>
                  <button onClick={()=>handleDelete(p.id)} style={{ padding:"0.2rem 0.5rem", fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", border:"1px solid rgba(192,57,43,0.3)", background:"transparent", color:"rgba(192,57,43,0.6)" }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.68rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5EDD8", marginBottom:"0.5rem" }}>{p.title}</div>
          <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(123,3,35,0.4),transparent)", margin:"0.6rem 0" }} />
          <div style={{ fontSize:"0.95rem", lineHeight:1.8, color:"rgba(245,237,216,0.55)", whiteSpace:"pre-wrap" }}>{p.content}</div>
        </div>
      )) : (
        <div style={{ ...card, textAlign:"center", padding:"3rem" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>🏺</div>
          <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.35)", marginBottom:"0.8rem" }}>The chalice is empty for now.</p>
          {isOfficer(member.role) && (
            <button onClick={()=>setShowForm(true)} style={{ padding:"0.55rem 1.4rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.18em", textTransform:"uppercase", background:"rgba(123,3,35,0.15)", border:"1px solid rgba(123,3,35,0.4)", color:"var(--wine-lt)", cursor:"pointer" }}>
              🏺 Write the first post
            </button>
          )}
        </div>
      )}
    </div>
  );
}
