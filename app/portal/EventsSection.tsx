"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

const sb = getSupabaseClient();

type Member = { id:string; display_name:string; frat_name:string; role:string };
type Event  = { id:string; title:string; event_date:string; event_time:string; event_end_time:string; location:string; dress_code:string; description:string; status:string; sl_url:string; sl_region:string; event_duration_minutes:number; flyer_url:string; rsvpd:boolean; created_by_name:string };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtTime = (t:string) => { if(!t) return ""; const [h,m]=t.split(":"); const hr=parseInt(h); return `${hr>12?hr-12:hr||12}:${m} ${hr>=12?"PM":"AM"}`; };
const isOfficer = (role:string) => ["Admin","Founder","President"].includes(role);

const inputStyle: React.CSSProperties = {
  width:"100%", padding:"0.65rem 0.9rem",
  background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.2)",
  color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif",
  fontSize:"0.95rem", outline:"none", borderRadius:"1px",
};
const labelStyle: React.CSSProperties = {
  display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem",
  letterSpacing:"0.2em", textTransform:"uppercase",
  color:"rgba(212,175,55,0.6)", marginBottom:"0.4rem",
};

export default function EventsSection({ member }: { member: Member }) {
  const [events,    setEvents]    = useState<Event[]>([]);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState("");

  const [title,     setTitle]     = useState("");
  const [date,      setDate]      = useState("");
  const [time,      setTime]      = useState("");
  const [location,  setLocation]  = useState("");
  const [endTime,   setEndTime]   = useState("");
  const [slUrl,     setSlUrl]     = useState("");
  const [slRegion,  setSlRegion]  = useState("");
  const [duration,  setDuration]  = useState("60");
  const [dresscode, setDresscode] = useState("");
  const [desc,      setDesc]      = useState("");

  // Flyer state
  const [flyerFile,    setFlyerFile]    = useState<File|null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string|null>(null);
  const [uploading,    setUploading]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/events");
    setEvents(await r.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleFlyerPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFlyerFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFlyerPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setTitle(""); setDate(""); setTime(""); setLocation("");
    setSlUrl(""); setSlRegion(""); setDuration("60"); setEndTime(""); setDresscode(""); setDesc("");
    setFlyerFile(null); setFlyerPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRsvp = async (eventId:string, rsvpd:boolean) => {
    await fetch("/api/rsvp", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ event_id:eventId, action: rsvpd?"remove":"add" }) });
    setEvents(prev => prev.map(e => e.id===eventId ? {...e, rsvpd:!rsvpd} : e));
  };

  const handleDelete = async (eventId:string) => {
    if (!confirm("Delete this event?")) return;
    await fetch("/api/events", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"delete", event_id:eventId }) });
    load();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title||!date) { setMsg("Title and date are required."); return; }
    setSaving(true); setUploading(!!flyerFile); setMsg("");

    let flyerUrl = "";

    // Upload flyer if provided
    if (flyerFile) {
      const ext = flyerFile.name.split(".").pop();
      const path = `event-flyers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await sb.storage.from("flyers").upload(path, flyerFile, { upsert: true });
      if (upErr) {
        setMsg("Flyer upload failed: " + upErr.message);
        setSaving(false); setUploading(false); return;
      }
      const { data: urlData } = sb.storage.from("flyers").getPublicUrl(path);
      flyerUrl = urlData.publicUrl;
    }

    setUploading(false);

    const r = await fetch("/api/events", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"create", title, event_date:date, event_time:time||null,
        event_end_time:endTime||null,
        location, sl_url:slUrl, sl_region:slRegion||null, event_duration_minutes:parseInt(duration)||60,
        dress_code:dresscode, description:desc, flyer_url:flyerUrl }) });
    const d = await r.json();
    if (d.success) {
      setMsg("✓ Event created!");
      resetForm(); setShowForm(false); load();
    } else { setMsg(d.error||"Something went wrong."); }
    setSaving(false);
  };

  const card: React.CSSProperties = { background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"1.4rem 1.6rem" };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"1.6rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--cyan)", marginBottom:"0.35rem" }}>Kappa Gamma Eta</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Events</div>
        </div>
        {isOfficer(member.role) && (
          <button onClick={()=>{ setShowForm(!showForm); setMsg(""); }} style={{
            padding:"0.55rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem",
            letterSpacing:"0.18em", textTransform:"uppercase",
            background: showForm?"rgba(212,175,55,0.1)":"rgba(255,107,170,0.15)",
            border: showForm?"1px solid rgba(212,175,55,0.35)":"1px solid rgba(255,107,170,0.4)",
            color: showForm?"#fff0a0":"#ff9ec8", cursor:"pointer", transition:"all 0.2s",
          }}>
            {showForm ? "✕ Cancel" : "+ Create Event"}
          </button>
        )}
      </div>

      <div style={{ height:1, background:"linear-gradient(90deg,transparent,#D4AF37,transparent)", marginBottom:"1.6rem", opacity:0.3 }} />

      {/* Create event form */}
      {showForm && isOfficer(member.role) && (
        <form onSubmit={handleCreate} style={{ ...card, marginBottom:"1.6rem", border:"1px solid rgba(255,107,170,0.2)", background:"rgba(255,107,170,0.04)" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#ff9ec8", marginBottom:"1.2rem" }}>New Event</div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={labelStyle}>Event Title *</label>
              <input id="field-45" name="field-45" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Sisterhood Mixer — May 2026" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Date *</label>
              <input id="field-46" name="field-46" type="date" value={date} onChange={e=>setDate(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.8rem" }}>
                <div>
                  <label style={labelStyle}>Start Time (SLT)</label>
                  <input id="field-47" name="field-47" type="time" value={time} onChange={e=>setTime(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>End Time (SLT)</label>
                  <input id="field-end-time" name="field-end-time" type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Location (SL)</label>
              <input id="field-48" name="field-48" value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Sandy Bay Club" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Dress Code</label>
              <input id="field-49" name="field-49" value={dresscode} onChange={e=>setDresscode(e.target.value)} placeholder="e.g. Elegant Casual" style={inputStyle} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={labelStyle}>SL Teleport URL</label>
              <input id="field-50" name="field-50" value={slUrl} onChange={e=>setSlUrl(e.target.value)} placeholder="secondlife://..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>SL Region Name <span style={{color:"rgba(53,223,36,0.7)",fontSize:"0.42rem"}}>(for paddle attendance tracking)</span></label>
              <input id="field-51" name="field-51" value={slRegion} onChange={e=>setSlRegion(e.target.value)} placeholder="e.g. Sushene 1" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Event Duration (minutes)</label>
              <input id="field-52" name="field-52" type="number" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="60" style={inputStyle} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={labelStyle}>Description</label>
              <textarea id="field-53" name="field-53" value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="Tell sisters about this event…" style={{ ...inputStyle, resize:"vertical" }} />
            </div>

            {/* Flyer upload */}
            <div style={{ gridColumn:"1/-1" }}>
              <label style={labelStyle}>Event Flyer (optional)</label>
              <div
                onClick={()=>fileRef.current?.click()}
                style={{
                  border:"2px dashed rgba(212,175,55,0.2)", padding:"1.4rem",
                  textAlign:"center", cursor:"pointer", transition:"all 0.2s",
                  background: flyerPreview?"transparent":"rgba(212,175,55,0.02)",
                  position:"relative", overflow:"hidden",
                }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(212,175,55,0.45)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(212,175,55,0.2)"}
              >
                {flyerPreview ? (
                  <div style={{ position:"relative", display:"inline-block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flyerPreview} alt="Flyer preview" style={{ maxHeight:200, maxWidth:"100%", objectFit:"contain", display:"block" }} />
                    <button
                      type="button"
                      onClick={e=>{ e.stopPropagation(); setFlyerFile(null); setFlyerPreview(null); if(fileRef.current) fileRef.current.value=""; }}
                      style={{ position:"absolute", top:-8, right:-8, width:22, height:22, borderRadius:"50%", background:"rgba(192,57,43,0.8)", border:"none", color:"#fff", fontSize:"0.7rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                    >✕</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize:"2rem", marginBottom:"0.5rem", opacity:0.5 }}>🖼</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)" }}>Click to upload flyer</div>
                    <div style={{ fontStyle:"italic", fontSize:"0.8rem", color:"rgba(245,237,216,0.3)", marginTop:"0.3rem" }}>JPG, PNG or WebP — max 5MB</div>
                  </div>
                )}
              </div>
              <input id="field-54" name="field-54" ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFlyerPick} style={{ display:"none" }} />
            </div>
          </div>

          {msg && <p style={{ fontSize:"0.85rem", color:msg.startsWith("✓")?"#4DB87A":"#ff6baa", fontStyle:"italic", marginBottom:"0.8rem" }}>{msg}</p>}

          <button type="submit" disabled={saving} style={{
            padding:"0.65rem 2rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem",
            letterSpacing:"0.2em", textTransform:"uppercase",
            background:"rgba(255,107,170,0.15)", border:"1px solid rgba(255,107,170,0.4)",
            color:"#ff9ec8", cursor: saving?"not-allowed":"pointer", opacity:saving?0.5:1,
          }}>
            {uploading ? "Uploading flyer…" : saving ? "Creating…" : "Create Event →"}
          </button>
        </form>
      )}

      {/* Events list */}
      {events.length ? (
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {events.map(e=>(
            <div key={e.id} style={{ ...card, padding:0, overflow:"hidden", display:"flex" }}>

              {/* ── LEFT: Info ── */}
              <div style={{ flex:1, padding:"1.2rem 1.4rem", display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
                <div>
                  {/* Date + Title row */}
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"0.9rem", marginBottom:"0.7rem" }}>
                    <div style={{ flexShrink:0, textAlign:"center", border:"1px solid rgba(212,175,55,0.25)", padding:"0.4rem 0.5rem", background:"rgba(212,175,55,0.04)", minWidth:44 }}>
                      <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.3rem", color:"#D4AF37", lineHeight:1 }}>
                        {new Date(e.event_date+"T12:00:00").getDate()}
                      </div>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.4rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)" }}>
                        {MONTHS[new Date(e.event_date+"T12:00:00").getMonth()]}
                      </div>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#F5EDD8", marginBottom:"0.35rem" }}>{e.title}</div>
                      {e.status && e.status !== "upcoming" && (
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0.15rem 0.5rem", border:"1px solid rgba(212,175,55,0.25)", color:"rgba(212,175,55,0.6)" }}>{e.status}</span>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.3rem", marginBottom:"0.8rem" }}>
                    {e.event_time && <span style={{ fontSize:"0.8rem", color:"rgba(245,237,216,0.5)" }}>🕐 {fmtTime(e.event_time)}{e.event_end_time ? ` – ${fmtTime(e.event_end_time)}` : ""} SLT</span>}
                    {e.location   && <span style={{ fontSize:"0.8rem", color:"rgba(245,237,216,0.45)" }}>📍 {e.location}</span>}
                    {e.dress_code && <span style={{ fontSize:"0.8rem", color:"rgba(245,237,216,0.45)" }}>👗 {e.dress_code}</span>}
                  </div>

                  {e.description && <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.35)", lineHeight:1.7, marginBottom:"0.6rem" }}>{e.description}</div>}
                </div>

                {/* Buttons + created by */}
                <div>
                  <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap", alignItems:"center", marginBottom:"0.5rem" }}>
                    <button onClick={()=>handleRsvp(e.id, e.rsvpd)} style={{
                      padding:"0.38rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem",
                      letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer",
                      border: e.rsvpd?"1px solid rgba(117,255,255,0.35)":"1px solid rgba(255,107,170,0.35)",
                      background: e.rsvpd?"rgba(117,255,255,0.08)":"rgba(255,107,170,0.1)",
                      color: e.rsvpd?"#75ffff":"#ff9ec8",
                    }}>
                      {e.rsvpd ? "✓ RSVP'd" : "RSVP →"}
                    </button>
                    {e.sl_url && (
                      <a href={e.sl_url} target="_blank" rel="noopener noreferrer" style={{
                        padding:"0.38rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem",
                        letterSpacing:"0.14em", textTransform:"uppercase",
                        border:"1px solid rgba(212,175,55,0.25)", color:"rgba(212,175,55,0.65)",
                        textDecoration:"none", background:"transparent",
                      }}>
                        Teleport →
                      </a>
                    )}
                    {isOfficer(member.role) && (
                      <button onClick={()=>handleDelete(e.id)} style={{
                        padding:"0.38rem 0.8rem", fontFamily:"'Cinzel',serif", fontSize:"0.46rem",
                        letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer",
                        border:"1px solid rgba(192,57,43,0.3)", background:"rgba(192,57,43,0.08)",
                        color:"rgba(192,57,43,0.65)", marginLeft:"auto",
                      }}>
                        Delete
                      </button>
                    )}
                  </div>
                  {e.created_by_name && (
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.18)" }}>
                      Created by {e.created_by_name}
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT: Flyer thumbnail ── */}
              {e.flyer_url ? (
                <div style={{ width:160, flexShrink:0, borderLeft:"1px solid rgba(212,175,55,0.1)", position:"relative", overflow:"hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.flyer_url} alt={e.title} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block", minHeight:180 }} />
                </div>
              ) : (
                <div style={{ width:80, flexShrink:0, borderLeft:"1px solid rgba(212,175,55,0.08)", background:"rgba(212,175,55,0.02)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:"1.8rem", opacity:0.15 }}>📅</span>
                </div>
              )}

            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...card, textAlign:"center", padding:"3rem" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>📅</div>
          <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.35)", marginBottom:"0.8rem" }}>No upcoming events at this time.</p>
          {isOfficer(member.role) && (
            <button onClick={()=>setShowForm(true)} style={{
              padding:"0.55rem 1.4rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem",
              letterSpacing:"0.18em", textTransform:"uppercase",
              background:"rgba(255,107,170,0.15)", border:"1px solid rgba(255,107,170,0.4)",
              color:"#ff9ec8", cursor:"pointer",
            }}>+ Create the first event</button>
          )}
        </div>
      )}
    </div>
  );
}
