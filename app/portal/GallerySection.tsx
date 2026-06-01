"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { getSupabaseClient } from "@/lib/supabase-client";

const sb = getSupabaseClient();

type Member = { id:string; display_name:string; frat_name:string; role:string };
type Post   = { id:string; member_name:string; frat_name:string; image_url:string; caption:string; saved_by_founder:boolean; created_at:string };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (d:string) => { const dt=new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };
const isFounderAdmin = (r:string) => ["Founder","Admin"].includes(r);

type Tab = "public"|"private"|"repday";

export default function GallerySection({ member }: { member: Member }) {
  const [tab,       setTab]       = useState<Tab>("public");
  const [posts,     setPosts]     = useState<Post[]>([]);
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption,   setCaption]   = useState("");
  const [msg,       setMsg]       = useState("");
  const [preview,   setPreview]   = useState<string|null>(null);
  const [file,      setFile]      = useState<File|null>(null);
  const [lightbox,  setLightbox]  = useState<Post|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const load = useCallback(async (t:Tab) => {
    setLoading(true);
    const r = await fetch(`/api/gallery?type=${t}`);
    const d = await r.json();
    if (t==="repday") { setIsAdmin(d.isAdmin); setPosts(d.posts||[]); }
    else setPosts(d || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setMsg("");
    const folder = tab==="public"?"public":tab==="private"?"private":"repday";
    const ext = file.name.split(".").pop();
    const path = `${folder}/${member.id}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from("gallery").upload(path, file, { upsert:true });
    if (error) { setMsg("Upload failed: "+error.message); setUploading(false); return; }
    const { data: urlData } = sb.storage.from("gallery").getPublicUrl(path);
    const r = await fetch("/api/gallery", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"add", gallery_type:tab, image_url:urlData.publicUrl, caption }) });
    const d = await r.json();
    if (d.success) {
      setMsg("✓ Photo uploaded!");
      setFile(null); setPreview(null); setCaption("");
      if (fileRef.current) fileRef.current.value="";
      load(tab);
    } else setMsg(d.error||"Something went wrong.");
    setUploading(false);
  };

  const handleDelete = async (id:string) => {
    if (!confirm("Delete this photo?")) return;
    await fetch("/api/gallery", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"delete", id }) });
    load(tab);
  };

  const handleSaveRepday = async (id:string, saved:boolean) => {
    await fetch("/api/gallery", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"save_repday", id, saved:!saved }) });
    load(tab);
  };

  const card: React.CSSProperties = { background:"#221018", border:"1px solid rgba(212,175,55,0.14)" };

  const TAB_CONFIG = {
    public:  { label:"🌸 Public",       colour:"#ff6baa", desc:"Shared with all sisters" },
    private: { label:"🔒 Private",      colour:"#7BA7D4", desc:"Only you can see these" },
    repday:  { label:"👑 Rep Day",       colour:"#D4AF37", desc:"Submit your rep day photo" },
  };

  // For non-admin repday: already submitted = posts array has items
  const alreadySubmitted = tab==="repday" && !isAdmin && posts.length > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:"1.6rem" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--cyan)", marginBottom:"0.35rem" }}>Kappa Gamma Eta</div>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.5rem", color:"#F5EDD8" }}>Gallery</div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:2, marginBottom:"1.6rem", borderBottom:"1px solid rgba(212,175,55,0.14)" }}>
        {(["public","private","repday"] as Tab[]).map(t=>(
          <button key={t} onClick={()=>{ setTab(t); setMsg(""); setFile(null); setPreview(null); }} style={{
            padding:"0.6rem 1.3rem", fontFamily:"'Cinzel',serif", fontSize:"0.55rem",
            letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer",
            border:"none", background:"transparent",
            color: tab===t ? TAB_CONFIG[t].colour : "rgba(245,237,216,0.35)",
            borderBottom: tab===t ? `2px solid ${TAB_CONFIG[t].colour}` : "2px solid transparent",
            transition:"all 0.2s",
          }}>
            {TAB_CONFIG[t].label}
          </button>
        ))}
      </div>

      <p style={{ fontStyle:"italic", fontSize:"0.88rem", color:"rgba(245,237,216,0.35)", marginBottom:"1.4rem" }}>
        {TAB_CONFIG[tab].desc}
        {tab==="repday" && isAdmin && " — submit yours above, save all sister submissions below"}
      </p>

      {/* Upload zone — always shown unless non-admin already submitted rep day */}
      {!alreadySubmitted && (
        <div style={{ ...card, padding:"1.4rem", marginBottom:"1.6rem", border:"1px solid rgba(212,175,55,0.18)" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:TAB_CONFIG[tab].colour, marginBottom:"1rem" }}>
            {tab==="repday" ? "Submit Your Rep Day Photo" : "Upload Photo"}
          {tab==="repday" && isAdmin && <span style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"0.8rem", color:"rgba(212,175,55,0.4)", marginLeft:"0.5rem" }}>(your own)</span>}
          </div>

          {/* Drop zone */}
          <div
            onClick={()=>fileRef.current?.click()}
            style={{ border:"2px dashed rgba(212,175,55,0.2)", padding:"1.2rem", textAlign:"center", cursor:"pointer", marginBottom:"0.8rem", transition:"border-color 0.2s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(212,175,55,0.5)"}
            onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(212,175,55,0.2)"}
          >
            {preview ? (
              <div style={{ position:"relative", display:"inline-block" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" style={{ maxHeight:180, maxWidth:"100%", objectFit:"contain" }} />
                <button type="button" onClick={e=>{ e.stopPropagation(); setFile(null); setPreview(null); if(fileRef.current) fileRef.current.value=""; }}
                  style={{ position:"absolute", top:-8, right:-8, width:22, height:22, borderRadius:"50%", background:"rgba(192,57,43,0.8)", border:"none", color:"#fff", fontSize:"0.7rem", cursor:"pointer" }}>✕</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize:"2rem", opacity:0.4, marginBottom:"0.4rem" }}>🖼</div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(212,175,55,0.45)" }}>Click to select photo</div>
                <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.25)", marginTop:"0.3rem" }}>JPG, PNG or WebP — max 10MB</div>
              </>
            )}
          </div>
          <input id="field-6" name="field-6" ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFilePick} style={{ display:"none" }} />

          <input id="field-7" name="field-7" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Add a caption… (optional)" style={{ width:"100%", padding:"0.6rem 0.9rem", background:"rgba(255,107,170,0.05)", border:"1px solid rgba(212,175,55,0.18)", color:"#F5EDD8", fontFamily:"'Cormorant Garamond',serif", fontSize:"0.9rem", outline:"none", marginBottom:"0.8rem" }} />

          {msg && <p style={{ fontSize:"0.85rem", color:msg.startsWith("✓")?"#4DB87A":"#ff6baa", fontStyle:"italic", marginBottom:"0.8rem" }}>{msg}</p>}

          <button onClick={handleUpload} disabled={!file||uploading} style={{
            padding:"0.6rem 1.6rem", fontFamily:"'Cinzel',serif", fontSize:"0.58rem",
            letterSpacing:"0.18em", textTransform:"uppercase",
            background: !file?"rgba(212,175,55,0.04)":`${TAB_CONFIG[tab].colour}25`,
            border: `1px solid ${TAB_CONFIG[tab].colour}${!file?"18":"55"}`,
            color: !file?"rgba(245,237,216,0.25)":TAB_CONFIG[tab].colour,
            cursor: !file||uploading?"not-allowed":"pointer", opacity:uploading?0.6:1,
          }}>
            {uploading ? "Uploading…" : tab==="repday" ? "Submit Rep Day Photo →" : "Upload →"}
          </button>
        </div>
      )}

      {/* Already submitted rep day */}
      {alreadySubmitted && (
        <div style={{ ...card, padding:"1rem 1.4rem", marginBottom:"1.4rem", border:"1px solid rgba(212,175,55,0.25)", background:"rgba(212,175,55,0.04)" }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#D4AF37" }}>
            ✓ Rep Day photo submitted
            {posts[0]?.saved_by_founder && " · 💙 Saved by Founder"}
          </span>
        </div>
      )}

      {/* Photos grid */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"3rem", fontStyle:"italic", color:"rgba(245,237,216,0.3)" }}>Loading…</div>
      ) : posts.length ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"1rem" }}>
          {posts.map(p=>(
            <div key={p.id} style={{ ...card, overflow:"hidden", position:"relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt={p.caption||"Gallery photo"} onClick={()=>setLightbox(p)} style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block", cursor:"pointer" }} />

              <div style={{ padding:"0.8rem" }}>
                {(tab==="public"||tab==="repday") && p.frat_name && (
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"0.85rem", color:"#ff9ec8", marginBottom:"0.25rem" }}>{p.frat_name}</div>
                )}
                {p.caption && <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.5)", marginBottom:"0.4rem" }}>{p.caption}</div>}
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.2)" }}>{fmt(p.created_at)}</div>

                {/* Rep day saved badge */}
                {tab==="repday" && p.saved_by_founder && (
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#D4AF37", marginTop:"0.4rem" }}>💙 Saved</div>
                )}

                {/* Actions */}
                <div style={{ display:"flex", gap:"0.5rem", marginTop:"0.6rem" }}>
                  {/* Founder save button on rep day — downloads to computer */}
                  {tab==="repday" && isAdmin && (
                    <button onClick={async ()=>{
                      // Download the image to computer
                      try {
                        const res = await fetch(p.image_url);
                        const blob = await res.blob();
                        const ext = blob.type.split("/")[1] || "jpg";
                        const filename = `${p.frat_name.replace(/[^a-zA-Z0-9]/g,"_")}_RepDay.${ext}`;
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = filename;
                        document.body.appendChild(a); a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      } catch { window.open(p.image_url, "_blank"); }
                      // Mark as saved
                      handleSaveRepday(p.id, p.saved_by_founder);
                    }} style={{
                      flex:1, padding:"0.35rem 0", fontFamily:"'Cinzel',serif", fontSize:"0.46rem",
                      letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer",
                      border: p.saved_by_founder?"1px solid rgba(77,184,122,0.4)":"1px solid rgba(212,175,55,0.3)",
                      background: p.saved_by_founder?"rgba(77,184,122,0.1)":"rgba(212,175,55,0.06)",
                      color: p.saved_by_founder?"#4DB87A":"rgba(212,175,55,0.7)",
                    }}>
                      {p.saved_by_founder ? "✓ Download Again" : "⬇ Save →"}
                    </button>
                  )}
                  {/* Delete — own photos or admin */}
                  {(tab!=="repday" || isFounderAdmin(member.role)) && (
                    <button onClick={()=>handleDelete(p.id)} style={{
                      padding:"0.35rem 0.7rem", fontFamily:"'Cinzel',serif", fontSize:"0.44rem",
                      letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer",
                      border:"1px solid rgba(192,57,43,0.25)", background:"transparent",
                      color:"rgba(192,57,43,0.6)",
                    }}>✕</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:"3rem", ...card }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.7rem" }}>🌸</div>
          <p style={{ fontStyle:"italic", color:"rgba(245,237,216,0.3)" }}>
            {tab==="public" ? "No photos yet — be the first to share!" :
             tab==="private" ? "No private photos yet." :
             isAdmin ? "No rep day submissions yet — sisters haven't uploaded yet." : "You haven't submitted your rep day photo yet."}
          </p>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && typeof document !== "undefined" && createPortal(
        <div onClick={()=>setLightbox(null)} style={{
          position:"fixed", inset:0, zIndex:99999,
          background:"rgba(0,0,0,0.92)",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          cursor:"zoom-out", padding:"1rem",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.image_url}
            alt={lightbox.caption||"Gallery photo"}
            onClick={e=>e.stopPropagation()}
            style={{
              maxWidth:"90vw", maxHeight:"82vh",
              objectFit:"contain", display:"block",
              boxShadow:"0 0 60px rgba(0,0,0,0.8)",
              cursor:"default",
            }}
          />
          <div style={{ marginTop:"1rem", textAlign:"center" }} onClick={e=>e.stopPropagation()}>
            {lightbox.caption && (
              <p style={{ fontStyle:"italic", fontSize:"0.95rem", color:"rgba(245,237,216,0.7)", marginBottom:"0.3rem" }}>
                {lightbox.caption}
              </p>
            )}
            <div style={{ display:"flex", gap:"1rem", justifyContent:"center", alignItems:"center" }}>
              {lightbox.frat_name && (
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"0.85rem", color:"#ff9ec8" }}>
                  {lightbox.frat_name}
                </span>
              )}
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(245,237,216,0.25)" }}>
                {fmt(lightbox.created_at)}
              </span>
            </div>
          </div>
          <div style={{ position:"fixed", top:"1.2rem", right:"1.4rem", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,237,216,0.5)", cursor:"pointer", padding:"0.5rem", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}
            onClick={()=>setLightbox(null)}>
            ✕ Close
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
