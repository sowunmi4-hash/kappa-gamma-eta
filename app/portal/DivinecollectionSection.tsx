"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Member = { id:string; display_name:string; frat_name:string; role:string; sl_name:string };
type Item = {
  id:string; name:string; description:string; category:string;
  image_url:string; item_key:string; posted_by_name:string; created_at:string;
  claimed:boolean; redelivery_count:number;
};

const CATEGORIES = ["Clothing","Paddle","Accessories","Gear","Uniform","Other"];

const card:  React.CSSProperties = { background:"#221018", border:"1px solid rgba(212,175,55,0.14)", overflow:"hidden" };
const input: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.2)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", outline:"none" };
const lbl:   React.CSSProperties = { display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(212,175,55,0.6)", marginBottom:"0.4rem" };

const CATCOLOUR: Record<string,string> = {
  Clothing:"#ff9ec8", Paddle:"#D4AF37", Accessories:"#7BA7D4",
  Gear:"#75ffff", Uniform:"#b01840", Other:"rgba(245,237,216,0.5)",
};

function timeAgo(d:string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff/86400000);
  if (days===0) return "Today";
  if (days===1) return "Yesterday";
  return `${days}d ago`;
}

export default function DivineCollectionSection({ member }: { member: Member }) {
  const [items,      setItems]      = useState<Item[]>([]);
  const [filter,     setFilter]     = useState("Clothing");
  const [loading,    setLoading]    = useState(false);
  const [delivering, setDelivering] = useState<string|null>(null);
  const [msg,        setMsg]        = useState<{id:string; text:string; type:"ok"|"err"|"dues"}|null>(null);
  const [showAdd,    setShowAdd]    = useState(false);

  // Add form
  const [aName,     setAName]     = useState("");
  const [aDesc,     setADesc]     = useState("");
  const [aCat,      setACat]      = useState("Clothing");
  const [aKey,      setAKey]      = useState("");
  const [aFile,     setAFile]     = useState<File|null>(null);
  const [aPreview,  setAPreview]  = useState<string|null>(null);
  const [aSaving,   setASaving]   = useState(false);
  const [aMsg,      setAMsg]      = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isFounder = ["Founder","Admin"].includes(member.role);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/collection");
    setItems(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeliver = async (item: Item) => {
    setDelivering(item.id); setMsg(null);
    const r = await fetch("/api/collection/deliver", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ item_id:item.id, is_redelivery:item.claimed }),
    });
    const d = await r.json();
    if (d.success) {
      setMsg({ id:item.id, text: item.claimed ? "✓ Redelivery sent! Check your SL inventory." : "✓ Delivered! Check your SL inventory.", type:"ok" });
      load();
    } else if (d.error === "dues_unpaid") {
      setMsg({ id:item.id, text:d.message, type:"dues" });
    } else {
      setMsg({ id:item.id, text:d.message||"Something went wrong.", type:"err" });
    }
    setDelivering(null);
  };

  const handleDelete = async (id:string) => {
    if (!confirm("Remove this item from the collection?")) return;
    await fetch("/api/collection", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"delete", id }) });
    load();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aName) { setAMsg("Name is required."); return; }
    setASaving(true); setAMsg("");
    let imageUrl = "";
    if (aFile) {
      const ext = aFile.name.split(".").pop();
      const path = `items/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await sb.storage.from("collection").upload(path, aFile, { upsert:true });
      if (error) { setAMsg("Image upload failed: "+error.message); setASaving(false); return; }
      const { data: urlData } = sb.storage.from("collection").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }
    const r = await fetch("/api/collection", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"add", name:aName, description:aDesc, category:aCat, image_url:imageUrl, item_key:aKey }) });
    const d = await r.json();
    if (d.success) {
      setAMsg("✓ Item added to the collection!");
      setAName(""); setADesc(""); setAKey(""); setAFile(null); setAPreview(null);
      if (fileRef.current) fileRef.current.value="";
      setShowAdd(false); load();
    } else setAMsg(d.error||"Something went wrong.");
    setASaving(false);
  };

  const filtered = items.filter(i=>i.category===filter);

  return (
    <div>
      {/* Crystal Hero */}
      <div style={{ textAlign:"center", marginBottom:"2rem", position:"relative" }}>
        <div style={{
          display:"inline-block", position:"relative",
          filter:"drop-shadow(0 0 32px rgba(255,107,170,0.5)) drop-shadow(0 0 80px rgba(123,3,35,0.4))",
          animation:"float 3s ease-in-out infinite",
        }}>
          <img
            src="/regalia-crystal.png"
            alt="KGE Regalia Crystal"
            style={{ width:"clamp(140px,20vw,220px)", display:"block", margin:"0 auto", mixBlendMode:"screen" }}
          />
        </div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-12px); }
          }
        `}</style>
      </div>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"1.6rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#D4AF37", marginBottom:"0.35rem" }}>Kappa Gamma Eta</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Regalia</div>
          <div style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.4)" }}>Official KGE gear — click to receive directly to your SL inventory</div>
        </div>
        {isFounder && (
          <button onClick={()=>{ setShowAdd(!showAdd); setAMsg(""); }} style={{
            padding:"0.55rem 1.2rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem",
            letterSpacing:"0.18em", textTransform:"uppercase",
            background: showAdd?"rgba(212,175,55,0.1)":"rgba(212,175,55,0.15)",
            border:"1px solid rgba(212,175,55,0.4)", color:"#fff0a0", cursor:"pointer",
          }}>
            {showAdd ? "✕ Cancel" : "✦ Add Item"}
          </button>
        )}
      </div>

      <div style={{ height:1.5, background:"linear-gradient(90deg,transparent,#D4AF37 30%,#fff8a0 50%,#D4AF37 80%,transparent)", marginBottom:"1.4rem", opacity:0.6 }} />

      {/* Add item form */}
      {showAdd && isFounder && (
        <form onSubmit={handleAdd} style={{ background:"rgba(212,175,55,0.04)", border:"1px solid rgba(212,175,55,0.25)", padding:"1.6rem", marginBottom:"1.6rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#D4AF37", marginBottom:"1.2rem" }}>Add to Collection</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lbl}>Item Name *</label>
              <input value={aName} onChange={e=>setAName(e.target.value)} placeholder="e.g. KGE Formal Gown" style={input} required />
            </div>
            <div>
              <label style={lbl}>Category</label>
              <select value={aCat} onChange={e=>setACat(e.target.value)} style={input}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>SL Inventory Item Name</label>
              <input value={aKey} onChange={e=>setAKey(e.target.value)} placeholder="Exact name as it appears in SL" style={input} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lbl}>Description</label>
              <textarea value={aDesc} onChange={e=>setADesc(e.target.value)} rows={2} placeholder="Describe this item…" style={{ ...input, resize:"vertical" }} />
            </div>
            {/* Image upload */}
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lbl}>Item Photo *</label>
              <div onClick={()=>fileRef.current?.click()} style={{ border:"2px dashed rgba(212,175,55,0.25)", padding:"1.2rem", textAlign:"center", cursor:"pointer", transition:"border-color 0.2s" }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(212,175,55,0.5)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(212,175,55,0.25)"}>
                {aPreview ? (
                  <div style={{ position:"relative", display:"inline-block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={aPreview} alt="Preview" style={{ maxHeight:160, maxWidth:"100%", objectFit:"contain" }} />
                    <button type="button" onClick={e=>{ e.stopPropagation(); setAFile(null); setAPreview(null); if(fileRef.current) fileRef.current.value=""; }}
                      style={{ position:"absolute", top:-8, right:-8, width:22, height:22, borderRadius:"50%", background:"rgba(192,57,43,0.8)", border:"none", color:"#fff", fontSize:"0.7rem", cursor:"pointer" }}>✕</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize:"1.8rem", opacity:0.4, marginBottom:"0.4rem" }}>🖼</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.45)" }}>Click to upload photo</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; setAFile(f); const r=new FileReader(); r.onload=ev=>setAPreview(ev.target?.result as string); r.readAsDataURL(f); }} style={{ display:"none" }} />
            </div>
          </div>
          {aMsg && <p style={{ fontSize:"0.85rem", color:aMsg.startsWith("✓")?"#4DB87A":"#ff6baa", fontStyle:"italic", marginBottom:"0.8rem" }}>{aMsg}</p>}
          <button type="submit" disabled={aSaving||!aFile} style={{
            padding:"0.65rem 2rem", fontFamily:"'Cinzel',serif", fontSize:"0.6rem",
            letterSpacing:"0.2em", textTransform:"uppercase",
            background: !aFile?"rgba(212,175,55,0.04)":"rgba(212,175,55,0.15)",
            border:`1px solid ${!aFile?"rgba(212,175,55,0.1)":"rgba(212,175,55,0.45)"}`,
            color: !aFile?"rgba(245,237,216,0.2)":"#fff0a0",
            cursor:aSaving||!aFile?"not-allowed":"pointer", opacity:aSaving?0.5:1,
          }}>
            {aSaving?"Adding…":"Add to Collection →"}
          </button>
        </form>
      )}

      {/* Category filter */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:"1.4rem" }}>
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{
            padding:"0.35rem 0.9rem", fontFamily:"'Cinzel',serif", fontSize:"0.5rem",
            letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer",
            border:`1px solid ${filter===c?"rgba(212,175,55,0.5)":"rgba(212,175,55,0.15)"}`,
            background: filter===c?"rgba(212,175,55,0.12)":"transparent",
            color: filter===c?"#fff0a0":"rgba(245,237,216,0.4)",
            transition:"all 0.2s",
          }}>{c}</button>
        ))}
      </div>

      {/* Items grid */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"3rem", fontStyle:"italic", color:"rgba(245,237,216,0.3)" }}>Loading collection…</div>
      ) : filtered.length ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"1.2rem" }}>
          {filtered.map(item=>(
            <div key={item.id} style={{ ...card, position:"relative" }} className="anim-card">
              {/* Category badge */}
              <div style={{ position:"absolute", top:10, left:10, zIndex:2, fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", padding:"0.2rem 0.55rem", background:"rgba(14,5,8,0.85)", border:`1px solid ${CATCOLOUR[item.category]||"rgba(245,237,216,0.3)"}50`, color:CATCOLOUR[item.category]||"rgba(245,237,216,0.5)" }}>
                {item.category}
              </div>

              {/* Image */}
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block" }} />
              ) : (
                <div style={{ width:"100%", aspectRatio:"1", background:"rgba(212,175,55,0.04)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"3rem", opacity:0.3 }}>✦</div>
              )}
              {/* Info */}
              <div style={{ padding:"1rem" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5EDD8", marginBottom:"0.3rem" }}>{item.name}</div>
                {item.description && <p style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.45)", lineHeight:1.5, marginBottom:"0.6rem" }}>{item.description}</p>}
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(245,237,216,0.2)", marginBottom:"0.8rem" }}>
                  Added by {item.posted_by_name} · {timeAgo(item.created_at)}
                  {item.claimed && item.redelivery_count > 0 && ` · Redelivered ${item.redelivery_count}×`}
                </div>

                {/* Message for this item */}
                {msg?.id===item.id && (
                  <div style={{ padding:"0.6rem 0.8rem", marginBottom:"0.7rem", fontSize:"0.82rem", lineHeight:1.5,
                    color: msg.type==="ok"?"#4DB87A":msg.type==="dues"?"#D4AF37":"#ff6baa",
                    background: msg.type==="ok"?"rgba(77,184,122,0.08)":msg.type==="dues"?"rgba(212,175,55,0.08)":"rgba(255,107,170,0.08)",
                    border: `1px solid ${msg.type==="ok"?"rgba(77,184,122,0.3)":msg.type==="dues"?"rgba(212,175,55,0.3)":"rgba(255,107,170,0.3)"}`,
                    fontStyle:"italic",
                  }}>
                    {msg.text}
                    {msg.type==="dues" && (
                      <div style={{ marginTop:"0.4rem", fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                        🏺 Visit the KGE Dues Terminal in Second Life
                      </div>
                    )}
                  </div>
                )}

                {/* Receive / Redelivery button */}
                <button
                  onClick={()=>handleDeliver(item)}
                  disabled={delivering===item.id}
                  style={{
                    width:"100%", padding:"0.6rem", fontFamily:"'Cinzel',serif",
                    fontSize:"0.55rem", letterSpacing:"0.15em", textTransform:"uppercase",
                    cursor:delivering===item.id?"not-allowed":"pointer",
                    border: item.claimed?"1px solid rgba(117,255,255,0.35)":"1px solid rgba(212,175,55,0.45)",
                    background: item.claimed?"rgba(117,255,255,0.08)":"rgba(212,175,55,0.12)",
                    color: item.claimed?"var(--cyan)":"#fff0a0",
                    opacity:delivering===item.id?0.5:1, transition:"all 0.2s",
                  }}>
                  {delivering===item.id ? "Delivering…" : item.claimed ? "✓ Redelivery →" : "✦ Receive →"}
                </button>

                {/* Founder/Admin delete */}
                {isFounder && (
                  <button
                    onClick={()=>handleDelete(item.id)}
                    style={{
                      width:"100%", padding:"0.5rem", marginTop:"0.5rem",
                      fontFamily:"'Cinzel',serif", fontSize:"0.52rem",
                      letterSpacing:"0.12em", textTransform:"uppercase",
                      cursor:"pointer",
                      border:"1px solid rgba(192,57,43,0.35)",
                      background:"rgba(192,57,43,0.08)",
                      color:"rgba(220,80,60,0.7)",
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.background="rgba(192,57,43,0.18)"; (e.currentTarget as HTMLButtonElement).style.color="#e05030"; }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background="rgba(192,57,43,0.08)"; (e.currentTarget as HTMLButtonElement).style.color="rgba(220,80,60,0.7)"; }}
                  >
                    ✕ Remove Item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background:"#221018", border:"1px solid rgba(212,175,55,0.14)", textAlign:"center", padding:"4rem 2rem" }}>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.4rem", color:"rgba(212,175,55,0.2)", marginBottom:"0.8rem" }}>✦</div>
          <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.3)", marginBottom:"0.8rem" }}>
            {filter==="All" ? "The collection is empty." : `No ${filter} items yet.`}
          </p>
          {isFounder && filter==="All" && (
            <button onClick={()=>setShowAdd(true)} style={{ padding:"0.55rem 1.4rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.18em", textTransform:"uppercase", background:"rgba(212,175,55,0.12)", border:"1px solid rgba(212,175,55,0.35)", color:"#fff0a0", cursor:"pointer" }}>
              ✦ Add the first item
            </button>
          )}
        </div>
      )}
    </div>
  );
}
