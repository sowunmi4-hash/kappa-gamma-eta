"use client";
import TDASection from "./TDASection";
import EventsSection from "./EventsSection";
import ChaliceSection from "./ChaliceSection";
import GallerySection from "./GallerySection";
import DuesSection from "./DuesSection";
import ProbationSection from "./ProbationSection";
import DivineCollectionSection from "./DivinecollectionSection";
import GuideSection from "./GuideSection";
import ApplicationsSection from "./ApplicationsSection";
import HandbookSection from "./HandbookSection";
import SistersVoice from "./SistersVoice";
import PledgesSection from "./PledgesSection";
import AttendanceMonitor from "./AttendanceMonitor";
import ActivitySection from "./ActivitySection";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────
type Member  = { id:string; sl_name:string; display_name:string; frat_name:string; role:string; is_elevated:boolean };
type Profile = { bio:string; favourite_quote:string; hobbies:string; portrait_url:string; banner_url:string };
type Sister  = Member;
type Event   = { id:string; title:string; event_date:string; event_time:string; location:string; dress_code:string; description:string; status:string; rsvpd:boolean };
type Post    = { id:string; title:string; content:string; posted_by_name:string; pinned:boolean; created_at:string };
type Notif   = { id:string; title:string; message:string; is_read:boolean; created_at:string };

type Page    = "dashboard"|"sisterhood"|"events"|"chalice"|"gallery"|"notifications"|"profile"|"tda"|"voice"|"dues"|"probation"|"collection"|"guide"|"handbook"|"applications"|"pledges"|"attendance"|"activity";

const ROLE_COLOUR: Record<string,string> = {
  Founder:"#D4AF37", President:"#ff6baa", Admin:"#7BA7D4", Member:"rgba(245,237,216,0.45)"
};
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmt(d:string){ const dt=new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; }
function fmtTime(t:string){ if(!t) return ""; const [h,m]=t.split(":"); const hr=parseInt(h); return `${hr>12?hr-12:hr||12}:${m} ${hr>=12?"PM":"AM"}`; }

// ─── Shared styles ────────────────────────────────────
const S = {
  card: { background:"#221018", border:"1px solid rgba(212,175,55,0.14)", padding:"1.4rem 1.6rem" } as React.CSSProperties,
  input: { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", outline:"none" } as React.CSSProperties,
  btn: { padding:"0.65rem 1.6rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase" as const, background:"rgba(255,107,170,0.15)", border:"1px solid rgba(255,107,170,0.4)", color:"#ff9ec8", cursor:"pointer" },
  tag: (color:string) => ({ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase" as const, padding:"0.18rem 0.5rem", border:`1px solid ${color}40`, background:`${color}12`, color }),
};

export default function Portal() {
  const router = useRouter();
  const [member,  setMember]  = useState<Member|null>(null);
  const [profile, setProfile] = useState<Profile|null>(null);
  const [page,    setPage]    = useState<Page>("dashboard");
  const [sisters, setSisters] = useState<Sister[]>([]);
  const [events,  setEvents]  = useState<Event[]>([]);
  const [news,    setNews]    = useState<Post[]>([]);
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventAttendance, setEventAttendance] = useState<{weekly:number;monthly:number;yearly:number}|null>(null);

  // Profile edit state
  const [editing, setEditing]   = useState(false);
  const [pBio,    setPBio]      = useState("");
  const [pQuote,  setPQuote]    = useState("");
  const [pHobbies,setPHobbies]  = useState("");
  const [pNewPw,  setPNewPw]    = useState("");
  const [saving,  setSaving]    = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");
  const [pInstagram, setPInstagram] = useState("");
  const [pTwitter,   setPTwitter]   = useState("");
  const [pDiscord,   setPDiscord]   = useState("");
  const [pSlProfile, setPSlProfile] = useState("");
  const [copied,     setCopied]     = useState(false);

  const unread = notifs.filter(n=>!n.is_read).length;

  const load = useCallback(async () => {
    fetch("/api/tda/attendance").then(r=>r.json()).then(d=>{ if(d?.weekly!=null) setEventAttendance(d); }).catch(()=>{});
    const me = await fetch("/api/me");
    if (!me.ok) { router.push("/login"); return; }
    const { member: m, profile: p } = await me.json();
    setMember(m); setProfile(p);
    setPBio(p?.bio||""); setPQuote(p?.favourite_quote||""); setPHobbies(p?.hobbies||"");
    const sl = p?.social_links || {};
    setPInstagram(sl.instagram||""); setPTwitter(sl.twitter||"");
    setPDiscord(sl.discord||""); setPSlProfile(sl.sl_profile||"");
    const [s,e,n,notif] = await Promise.all([
      fetch("/api/sisters").then(r=>r.json()),
      fetch("/api/events").then(r=>r.json()),
      fetch("/api/news").then(r=>r.json()),
      fetch("/api/notifications").then(r=>r.json()),
    ]);
    setSisters(s); setEvents(e); setNews(n); setNotifs(notif);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleRsvp = async (eventId:string, rsvpd:boolean) => {
    await fetch("/api/rsvp", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ event_id:eventId, action: rsvpd?"remove":"add" }) });
    setEvents(prev => prev.map(e => e.id===eventId ? {...e, rsvpd:!rsvpd} : e));
  };

  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg("");
    const res = await fetch("/api/profile", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ bio:pBio, favourite_quote:pQuote, hobbies:pHobbies, new_password:pNewPw||undefined, social_links:{ instagram:pInstagram, twitter:pTwitter, discord:pDiscord, sl_profile:pSlProfile } }) });
    if (res.ok) { setSaveMsg("Saved!"); setEditing(false); setPNewPw(""); await load(); }
    else setSaveMsg("Something went wrong.");
    setSaving(false);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method:"POST" });
    router.push("/");
  };

  const markRead = async (id:string) => {
    await fetch("/api/notifications", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    setNotifs(prev => prev.map(n => n.id===id ? {...n, is_read:true} : n));
  };

  const deleteSister = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the sisterhood? This cannot be undone.`)) return;
    const r = await fetch("/api/members", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ member_id: id }) });
    const d = await r.json();
    if (d.error) { alert(d.error); return; }
    setSisters(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0306", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"0.25em", color:"rgba(212,175,55,0.5)", textTransform:"uppercase" }}>Entering the Sanctuary…</p>
    </div>
  );

  const isSafareehills = member?.sl_name === "safareehills";
  const isRestricted   = isSafareehills && !member?.is_elevated;
  const activePage     = isRestricted ? "voice" : page;



  const navItems: { id:Page; icon:string; label:string }[] = isRestricted ? [
    { id:"voice" as Page, icon:"💙", label:"Voice" },
  ] : [
    { id:"dashboard",     icon:"⚜",  label:"Dashboard" },
    { id:"sisterhood",    icon:"👑",  label:"Sisterhood" },
    { id:"events",        icon:"📅",  label:"Events" },
    { id:"chalice",       icon:"🏺",  label:"Chalice" },
    { id:"gallery",       icon:"🖼",  label:"Gallery" },
    { id:"notifications", icon:"🔔",  label:"Notifications" },
    { id:"profile",       icon:"✦",   label:"Profile" },
    { id:"tda",           icon:"⚜",   label:"TDA" },
    { id:"voice",          icon:"💙",   label:"Voice" },
    { id:"dues",           icon:"💰",   label:"Dues" },
    { id:"collection",     icon:"💎",   label:"Regalia" },
    { id:"handbook",      icon:"📖",  label:"Handbook" },
    { id:"activity",      icon:"📋",  label:"Updates" },
    ...(["Founder","Admin"].includes(member?.role||"") ? [{ id:"probation" as Page, icon:"⚠", label:"Probation" }, { id:"guide" as Page, icon:"📋", label:"Guide" }] : []),
    ...(["Founder","Admin","DOP"].includes(member?.role||"") ? [{ id:"applications" as Page, icon:"📋", label:"Applications" }, { id:"pledges" as Page, icon:"🌸", label:"Pledges" }] : []),
    ...(["Founder","Admin"].includes(member?.role||"") ? [{ id:"attendance" as Page, icon:"📡", label:"Attendance" }] : []),
  ];

  const PAGE_TITLES: Record<Page,string> = { dashboard:"Dashboard", sisterhood:"The Sisterhood", events:"Events", chalice:"The Chalice", gallery:"Gallery", notifications:"Notifications", profile:"My Profile", tda:"The Divine Accord", voice:"Sister's Voice", dues:"Dues", probation:"Probation", collection:"Regalia", guide:"Orientation Guide", handbook:"The Handbook", applications:"Applications", pledges:"Pledges", attendance:"Attendance Monitor", activity:"Updates" };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0a0306", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", position:"relative", overflow:"hidden" }}>
      <div className="ambient-orb" style={{ width:600, height:600, background:"rgba(123,3,35,0.28)", top:-200, left:-100 }} />
      <div className="ambient-orb" style={{ width:400, height:400, background:"rgba(255,107,170,0.12)", bottom:0, right:50, animationDelay:"6s" }} />

      {/* ── SIDEBAR ── */}
      <aside className="sidebar-enter" style={{ width:240, minHeight:"100vh", position:"fixed", top:0, left:0, zIndex:50, background:"#120709", borderRight:"1px solid rgba(212,175,55,0.14)", display:"flex", flexDirection:"column" }}>

        {/* Logo */}
        <div style={{ padding:"1.5rem 1.4rem 1.2rem", borderBottom:"1px solid rgba(212,175,55,0.14)", display:"flex", alignItems:"center", gap:"0.7rem" }}>
          <div style={{ width:36, height:36, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cinzel Decorative',serif", fontSize:"0.65rem", color:"#D4AF37", background:"radial-gradient(circle, rgba(255,107,170,0.15), rgba(14,5,8,0.8))", flexShrink:0 }}>ΚΓΗ</div>
          <div>
            <div className="shimmer-text" style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.72rem", letterSpacing:"0.08em", lineHeight:1.3 }}>Kappa Gamma Eta</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.2em", color:"rgba(212,175,55,0.45)", textTransform:"uppercase", marginTop:2 }}>Sister Portal</div>
          </div>
        </div>

        {/* Nav — 2-column icon grid */}
        <nav style={{ flex:1, padding:"0.7rem 0.6rem", overflowY:"auto", overflowX:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.4rem" }}>
            {navItems.map(item => {
              const isActive = page === item.id;
              const hasNotif = item.id==="notifications" && unread>0;
              const hasChalice = item.id==="chalice" && news.length>0;
              const isAdmin = ["probation","guide","applications","pledges","attendance"].includes(item.id);
              return (
                <div key={item.id} onClick={() => setPage(item.id)}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    gap:"0.4rem", padding:"0.75rem 0.3rem", cursor:"pointer", position:"relative",
                    borderRadius:4,
                    background: isActive ? "rgba(212,175,55,0.14)" : "rgba(245,237,216,0.03)",
                    border: isActive ? "1px solid rgba(212,175,55,0.35)" : "1px solid rgba(245,237,216,0.06)",
                    transition:"all 0.15s",
                  }}
                  onMouseEnter={e=>{ if(!isActive)(e.currentTarget as HTMLDivElement).style.background="rgba(255,107,170,0.07)"; }}
                  onMouseLeave={e=>{ if(!isActive)(e.currentTarget as HTMLDivElement).style.background="rgba(245,237,216,0.03)"; }}
                >
                  {isAdmin && <div style={{ position:"absolute", top:3, right:3, width:4, height:4, borderRadius:"50%", background:"rgba(212,175,55,0.5)" }} />}
                  <span style={{ fontSize:"1.3rem", lineHeight:1 }}>{item.icon}</span>
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", textAlign:"center", lineHeight:1.3,
                    color: isActive ? "#D4AF37" : "rgba(245,237,216,0.45)",
                    fontWeight: isActive ? 600 : 400,
                  }}>{item.label}</span>
                  {(hasNotif || hasChalice) && (
                    <div style={{ position:"absolute", top:3, left:3, background: hasNotif ? "#ff6baa" : "#D4AF37", color: hasNotif?"#fff":"#0a0306", fontFamily:"'Cinzel',serif", fontSize:"0.38rem", width:14, height:14, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {hasNotif ? unread : news.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding:"1rem 1.4rem", borderTop:"1px solid rgba(212,175,55,0.14)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.7rem" }}>
            <div style={{ width:30, height:30, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.35)", background:"rgba(255,107,170,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", flexShrink:0 }}>🌸</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"0.75rem", color:"#ff9ec8", lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{member?.frat_name}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.4rem", letterSpacing:"0.15em", color:"rgba(212,175,55,0.4)", textTransform:"uppercase" }}>{member?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width:"100%", padding:"0.42rem", background:"none", border:"1px solid rgba(212,175,55,0.15)", color:"rgba(245,237,216,0.3)", fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,107,170,0.3)";(e.currentTarget as HTMLButtonElement).style.color="#ff9ec8";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(212,175,55,0.15)";(e.currentTarget as HTMLButtonElement).style.color="rgba(245,237,216,0.3)";}}>
            Sign Out →
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ marginLeft:240, flex:1, minHeight:"100vh" }}>

        {/* Topbar */}
        <div style={{ position:"sticky", top:0, zIndex:40, background:"rgba(10,3,6,0.96)", borderBottom:"1px solid rgba(212,175,55,0.12)", backdropFilter:"blur(8px)", padding:"0.85rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(245,237,216,0.45)" }}>{PAGE_TITLES[page]}</span>
          <div style={{ display:"flex", alignItems:"center", gap:"1.2rem" }}>
            <span style={{ fontSize:"0.82rem", fontStyle:"italic", color:"rgba(245,237,216,0.25)" }}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span>
            <button onClick={()=>setPage("notifications")} className={`notif-bell${unread>0?" has-notif":""}`} style={{ position:"relative", background:"none", border:"none", cursor:"pointer", color:"rgba(245,237,216,0.45)", fontSize:"1rem" }}>
              🔔{unread>0&&<span className="unread-dot" style={{ position:"absolute", top:-2, right:-2, width:8, height:8, borderRadius:"50%", background:"#ff6baa", border:"1.5px solid #0a0306" }} />}
            </button>
          </div>
        </div>

        <div style={{ padding:"2rem", maxWidth:1080, margin:"0 auto" }}>
          <div key={page} className="page-enter">

          {/* ══ DASHBOARD ══ */}
          {activePage==="dashboard" && (
            <div>
              {/* Welcome */}
              <div className="welcome-enter" style={{ background:"linear-gradient(135deg, rgba(255,107,170,0.12), rgba(212,175,55,0.06))", border:"1px solid rgba(255,107,170,0.2)", padding:"1.8rem 2rem", marginBottom:"1.4rem", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", right:-10, top:"50%", transform:"translateY(-50%)", fontFamily:"'Cinzel Decorative',serif", fontSize:"5.5rem", color:"rgba(255,107,170,0.04)", lineHeight:1, pointerEvents:"none" }}>ΚΓΗ</div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.28em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>Good day, Sister</div>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.4rem", color:"#F5EDD8", marginBottom:"0.3rem" }}>Welcome back, <span style={{ color:"#ff6baa" }}>{member?.frat_name}</span></div>
                <div style={{ fontStyle:"italic", fontSize:"0.9rem", color:"rgba(245,237,216,0.45)" }}>She is strong like whiskey, but soft like wine</div>
              </div>

              {/* Stats */}
              <div className="stagger" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.4rem" }}>
                {[
                  { icon:"👑", num:sisters.length||"—", label:"Sisters" },
                  { icon:"📅", num:events.length||"—", label:"Upcoming Events" },
                  { icon:"🔔", num:unread||"—",        label:"Notifications" },
                  { icon:"🏺", num:news.length||"—",   label:"Chalice Posts" },
                ].map(s=>(
                  <div key={s.label} className="stat-card" style={{ ...S.card, display:"flex", alignItems:"center", gap:"1rem", cursor:"default" }}>
                    <span style={{ fontSize:"1.4rem" }}>{s.icon}</span>
                    <div>
                      <div className="count-up" style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#D4AF37", lineHeight:1 }}>{s.num}</div>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.4)", marginTop:2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem" }}>
                {/* Announcements */}
                <div style={S.card}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>📌 Latest from The Chalice</div>
                  {news.slice(0,3).length ? news.slice(0,3).map(n=>(
                    <div key={n.id} style={{ padding:"0.8rem 0", borderBottom:"1px solid rgba(212,175,55,0.1)", display:"flex", gap:"0.8rem" }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background: n.pinned?"#D4AF37":"#ff6baa", flexShrink:0, marginTop:6 }} />
                      <div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5EDD8", marginBottom:"0.25rem" }}>{n.title}</div>
                        <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.45)", lineHeight:1.5 }}>{n.content.slice(0,100)}{n.content.length>100?"…":""}</div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(212,175,55,0.3)", marginTop:"0.3rem" }}>by {n.posted_by_name} · {fmt(n.created_at)}</div>
                      </div>
                    </div>
                  )) : <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.3)", fontSize:"0.9rem" }}>No posts yet.</p>}
                </div>

                {/* Events */}
                <div style={S.card}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(212,175,55,0.55)", marginBottom:"1rem" }}>📅 Upcoming Events</div>
                  {events.slice(0,3).length ? events.slice(0,3).map(e=>(
                    <div key={e.id} style={{ display:"flex", gap:"0.9rem", alignItems:"center", padding:"0.7rem 0", borderBottom:"1px solid rgba(212,175,55,0.1)" }}>
                      <div style={{ textAlign:"center", minWidth:44, border:"1px solid rgba(212,175,55,0.2)", padding:"0.4rem 0.3rem", background:"rgba(212,175,55,0.04)" }}>
                        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.2rem", color:"#D4AF37", lineHeight:1 }}>{new Date(e.event_date+"T12:00:00").getDate()}</div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.4rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)" }}>{MONTHS[new Date(e.event_date+"T12:00:00").getMonth()]}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5EDD8", marginBottom:"0.2rem" }}>{e.title}</div>
                        <div style={{ fontSize:"0.8rem", color:"rgba(245,237,216,0.4)" }}>{e.event_time?fmtTime(e.event_time):""}{e.location?` · ${e.location}`:""}</div>
                      </div>
                    </div>
                  )) : <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.3)", fontSize:"0.9rem" }}>No upcoming events.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ══ SISTERHOOD ══ */}
          {activePage==="sisterhood" && (
            <div>
              <div style={{ marginBottom:"1.6rem" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#ff6baa", marginBottom:"0.35rem" }}>Kappa Gamma Eta</div>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>The Sisterhood</div>
                <div className="shimmer-line" style={{ margin:"1rem 0" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.2rem" }}>
                {sisters.map(s=>(
                  <div key={s.id} className="anim-card" style={{ ...S.card, textAlign:"center", transition:"all 0.3s", cursor:"default" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,107,170,0.35)";(e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="rgba(212,175,55,0.14)";(e.currentTarget as HTMLDivElement).style.transform="translateY(0)";}}>
                    <div style={{ width:68, height:68, borderRadius:"50%", border:`1.5px solid ${ROLE_COLOUR[s.role]}50`, margin:"0 auto 0.9rem", display:"flex", alignItems:"center", justifyContent:"center", background:`radial-gradient(circle, ${ROLE_COLOUR[s.role]}15, rgba(10,3,6,0.9))`, fontSize:"1.3rem", position:"relative" }}>
                      🌸
                      {s.role==="Founder"&&<span style={{ position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)", fontSize:"0.8rem" }}>👑</span>}
                    </div>
                    <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"#ff9ec8", marginBottom:"0.3rem", lineHeight:1.3 }}>{s.frat_name}</div>
                    <div style={{ fontSize:"0.82rem", color:"#F5EDD8", marginBottom:"0.5rem", lineHeight:1.3 }}>{s.display_name}</div>
                    <span style={{ ...S.tag(ROLE_COLOUR[s.role]) }}>{s.role}</span>
                    {["Founder","Admin"].includes(member?.role||"") && s.id !== member?.id && !(member?.role==="Admin" && s.role==="Founder") && (
                      <div style={{ marginTop:"0.8rem" }}>
                        <button onClick={()=>deleteSister(s.id, s.display_name)} style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"0.12em", textTransform:"uppercase", background:"rgba(123,3,35,0.12)", border:"1px solid rgba(123,3,35,0.35)", color:"rgba(245,237,216,0.35)", padding:"0.3rem 0.7rem", cursor:"pointer", width:"100%" }}>
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ EVENTS ══ */}
          {activePage==="events" && member && (
            <EventsSection member={member} />
          )}

          {/* ══ THE CHALICE ══ */}
          {activePage==="chalice" && member && (
            <ChaliceSection member={member} />
          )}

          {/* ══ GALLERY ══ */}
          {activePage==="gallery" && member && (
            <GallerySection member={member} />
          )}

          {/* ══ NOTIFICATIONS ══ */}
          {activePage==="notifications" && (
            <div>
              <div style={{ marginBottom:"1.6rem" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#ff6baa", marginBottom:"0.35rem" }}>Activity</div>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Notifications</div>
                <div className="shimmer-line" style={{ margin:"1rem 0" }} />
              </div>
              <div style={S.card}>
                {notifs.length ? notifs.map(n=>(
                  <div key={n.id} onClick={()=>!n.is_read&&markRead(n.id)} style={{ display:"flex", gap:"1rem", alignItems:"flex-start", padding:"1rem 0", borderBottom:"1px solid rgba(212,175,55,0.1)", cursor: n.is_read?"default":"pointer" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background: n.is_read?"transparent":"var(--cyan)", border: n.is_read?"1px solid rgba(245,237,216,0.2)":"none", flexShrink:0, marginTop:5 }} />
                    <div>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.1em", textTransform:"uppercase", color: n.is_read?"rgba(245,237,216,0.4)":"#F5EDD8", marginBottom:"0.25rem" }}>{n.title}</div>
                      <div style={{ fontSize:"0.88rem", color:"rgba(245,237,216,0.45)", lineHeight:1.5 }}>{n.message}</div>
                      <div style={{ fontStyle:"italic", fontSize:"0.75rem", color:"rgba(245,237,216,0.2)", marginTop:"0.25rem" }}>{fmt(n.created_at)}</div>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign:"center", padding:"3rem" }}>
                    <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>🔔</div>
                    <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.35)" }}>No notifications yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ PROFILE ══ */}
          {activePage==="profile" && (
            <div>
              <div style={{ marginBottom:"1.6rem" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#ff6baa", marginBottom:"0.35rem" }}>Your Account</div>
                <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>My Profile</div>
                <div className="shimmer-line" style={{ margin:"1rem 0" }} />
              </div>

              {/* Banner */}
              <div style={{ height:90, background:"linear-gradient(135deg,rgba(255,107,170,0.2),rgba(212,175,55,0.1))", border:"1px solid rgba(212,175,55,0.14)", borderBottom:"none", position:"relative" }}>
                <div style={{ position:"absolute", bottom:-32, left:"1.6rem", width:64, height:64, borderRadius:"50%", border:"2px solid #221018", background:"rgba(255,107,170,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem" }}>🌸</div>
              </div>
              <div style={{ ...S.card, borderTop:"none", paddingTop:"3rem" }}>
                <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"1.4rem" }}>
                  <div>
                    <div style={{ fontStyle:"italic", fontSize:"1.25rem", color:"#ff9ec8", lineHeight:1.2 }}>{member?.frat_name}</div>
                    <div style={{ fontSize:"0.88rem", color:"rgba(245,237,216,0.45)" }}>{member?.display_name}</div>
                    <div style={{ marginTop:"0.4rem" }}><span style={{ ...S.tag(ROLE_COLOUR[member?.role||"Member"]) }}>{member?.role}</span></div>
                  </div>
                  <button onClick={()=>setEditing(!editing)} style={{ ...S.btn, background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.28)", color:"#fff0a0" }}>
                    {editing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {!editing ? (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
                    {[
                      { label:"SL Username", val:member?.sl_name },
                      { label:"Role",        val:member?.role },
                      { label:"Bio",         val:profile?.bio },
                      { label:"Favourite Quote", val:profile?.favourite_quote },
                      { label:"Hobbies",     val:profile?.hobbies },
                    { label:"Instagram",   val:(profile as {social_links?:{instagram?:string}})?.social_links?.instagram },
                    { label:"Twitter / X", val:(profile as {social_links?:{twitter?:string}})?.social_links?.twitter },
                    { label:"Discord",     val:(profile as {social_links?:{discord?:string}})?.social_links?.discord },
                    { label:"SL Profile",  val:(profile as {social_links?:{sl_profile?:string}})?.social_links?.sl_profile },
                    ].map(f=>(
                      <div key={f.label}>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.35rem" }}>{f.label}</div>
                        <div style={{ fontSize:"0.92rem", color: f.val?"#F5EDD8":"rgba(245,237,216,0.2)", fontStyle: f.val?"normal":"italic" }}>{f.val||"Not set yet"}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
                      <div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>Bio</div>
                        <textarea id="field-19" name="field-19" value={pBio} onChange={e=>setPBio(e.target.value)} rows={3} placeholder="Tell your sisters about yourself…" style={{ ...S.input, resize:"vertical" }} />
                      </div>
                      <div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>Favourite Quote</div>
                        <input id="field-20" name="field-20" value={pQuote} onChange={e=>setPQuote(e.target.value)} placeholder="Your favourite quote…" style={S.input} />
                      </div>
                      <div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>Hobbies</div>
                        <input id="field-21" name="field-21" value={pHobbies} onChange={e=>setPHobbies(e.target.value)} placeholder="e.g. Music, Fashion, Travel…" style={S.input} />
                      </div>
                      <div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>Change Password</div>
                        <input id="field-22" name="field-22" value={pNewPw} onChange={e=>setPNewPw(e.target.value)} type="password" placeholder="New password (leave blank to keep current)" style={S.input} />
                      </div>
                    </div>
                    {saveMsg&&<p style={{ fontSize:"0.85rem", color: saveMsg==="Saved!"?"#D4AF37":"#ff6baa", fontStyle:"italic", marginTop:"0.8rem" }}>{saveMsg}</p>}
                    <div style={{ marginTop:"1rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>Instagram username</div>
                <input id="field-23" name="field-23" value={pInstagram} onChange={e=>setPInstagram(e.target.value)} placeholder="e.g. kge_official" style={S.input} />
              </div>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>Twitter / X username</div>
                <input id="field-24" name="field-24" value={pTwitter} onChange={e=>setPTwitter(e.target.value)} placeholder="e.g. kge_official" style={S.input} />
              </div>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>Discord username</div>
                <input id="field-25" name="field-25" value={pDiscord} onChange={e=>setPDiscord(e.target.value)} placeholder="e.g. username#1234" style={S.input} />
              </div>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.5)", marginBottom:"0.4rem" }}>SL Profile URL</div>
                <input id="field-26" name="field-26" value={pSlProfile} onChange={e=>setPSlProfile(e.target.value)} placeholder="https://my.secondlife.com/..." style={S.input} />
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={saving} style={{ ...S.btn, marginTop:"1.2rem", opacity:saving?0.5:1 }}>
                      {saving?"Saving…":"Save Changes →"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* ══ TDA ══ */}
          {activePage==="tda" && member && (
            <TDASection member={member} eventAttendance={eventAttendance} onAttendanceUpdate={setEventAttendance} />
          )}

          {/* ══ SISTER'S VOICE ══ */}
          {activePage==="voice" && member && (
            <SistersVoice member={member} onElevate={async()=>{
              const me = await fetch("/api/me");
              if(me.ok){ const d=await me.json(); setMember(d.member); }
            }} />
          )}


          {/* ══ DUES ══ */}
          {activePage==="dues" && member && (
            <DuesSection member={member} />
          )}

          {activePage==="collection" && member && (
            <DivineCollectionSection member={member} />
          )}

          {activePage==="probation" && member && ["Founder","Admin"].includes(member.role) && (
            <ProbationSection member={member} />
          )}

          {activePage==="handbook" && member && (
            <HandbookSection />
          )}

          {activePage==="guide" && member && ["Founder","Admin"].includes(member.role) && (
            <GuideSection />
          )}

          {activePage==="activity" && member && (
            <ActivitySection />
          )}
          {activePage==="attendance" && member && ["Founder","Admin"].includes(member.role) && (
            <AttendanceMonitor />
          )}
          {activePage==="pledges" && member && ["Founder","Admin","DOP"].includes(member.role) && (
            <PledgesSection member={member} />
          )}
          {activePage==="applications" && member && ["Founder","Admin","DOP"].includes(member.role) && (
            <ApplicationsSection />
          )}

          </div>{/* end page-enter */}
        </div>
      </div>
    </div>
  );
}
