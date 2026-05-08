'use client'

import { useState, useEffect, useCallback } from 'react'

interface App {
  id: string; iw_name: string; age: string; instagram: string; has_discord: string
  prev_sorority: boolean; online_freq: string; can_pay_dues: boolean
  instagram_daily: boolean; why_kge: string; sisterhood_meaning: string
  can_pledge: boolean; brings_to_kge: string; status: string
  review_notes: string; reviewed_by: string; reviewed_at: string; submitted_at: string
}

const STA: Record<string, { c: string; l: string }> = {
  pending:    { c: '#D4AF37', l: '⏳ Pending' },
  interview:  { c: '#75ffff', l: '💬 Interview' },
  accepted:   { c: '#35df24', l: '✅ Accepted' },
  waitlisted: { c: '#ff6baa', l: '⏸ Waitlisted' },
  rejected:   { c: '#c44',    l: '✕ Rejected' },
}
const yn = (v: boolean | null) => v === true ? 'Yes' : v === false ? 'No' : '—'

export default function ApplicationsSection() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sel, setSel] = useState<App | null>(null)
  const [ns, setNs] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const url = filter === 'all' ? '/api/applications' : '/api/applications?status=' + filter
    const res = await fetch(url)
    const data = await res.json()
    setApps(data.applications || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])
  const open = (a: App) => { setSel(a); setNs(a.status); setNotes(a.review_notes || ''); setMsg('') }

  const save = async () => {
    if (!sel) return
    setSaving(true); setMsg('')
    const res = await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sel.id, status: ns, review_notes: notes }),
    })
    if (res.ok) { setMsg('Saved!'); setSel(s => s ? { ...s, status: ns, review_notes: notes } : s); load() }
    else { setMsg('Error saving') }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', background: 'rgba(14,5,8,0.8)', border: '1px solid rgba(212,175,55,0.28)', borderRadius: '6px', padding: '9px 13px', color: '#F5EDD8', fontFamily: 'inherit', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }
  const counts: Record<string, number> = { all: 0 }
  apps.forEach(a => { counts.all++; counts[a.status] = (counts[a.status] || 0) + 1 })

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.4rem', color: '#F5EDD8', fontWeight: 400, margin: '0 0 4px' }}>Pledge Applications</h2>
        <p style={{ color: 'rgba(245,237,216,0.4)', fontSize: '0.85rem', margin: 0 }}>Review and manage incoming applications to Kappa Gamma Eta</p>
      </div>

      <div style={{ display: 'flex', gap: '7px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'interview', 'accepted', 'waitlisted', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? 'rgba(123,3,35,0.55)' : 'rgba(123,3,35,0.12)', border: '1px solid ' + (filter === f ? '#D4AF37' : 'rgba(212,175,55,0.18)'), color: filter === f ? '#D4AF37' : 'rgba(245,237,216,0.55)', borderRadius: '20px', padding: '5px 14px', cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {f === 'all' ? 'All' : STA[f]?.l || f}{counts[f] ? ' (' + counts[f] + ')' : ''}
          </button>
        ))}
      </div>

      {loading
        ? <div style={{ textAlign: 'center', color: 'rgba(245,237,216,0.35)', padding: '40px', fontStyle: 'italic' }}>Loading applications...</div>
        : apps.length === 0
          ? <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(245,237,216,0.28)' }}><div style={{ fontSize: '36px', marginBottom: '10px' }}>🌸</div><p style={{ fontStyle: 'italic' }}>No applications yet</p></div>
          : <div style={{ display: 'grid', gap: '10px' }}>
              {apps.map(a => (
                <div key={a.id} onClick={() => open(a)} style={{ background: '#221018', border: '1px solid rgba(212,175,55,' + (sel?.id === a.id ? '0.45' : '0.14') + ')', borderRadius: '10px', padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.65rem', letterSpacing: '0.1em', color: '#D4AF37' }}>{a.iw_name}</span>
                      <span style={{ background: (STA[a.status]?.c || '#888') + '22', color: STA[a.status]?.c || '#888', border: '1px solid ' + (STA[a.status]?.c || '#888') + '44', borderRadius: '10px', padding: '1px 9px', fontSize: '11px' }}>{STA[a.status]?.l || a.status}</span>
                    </div>
                    <div style={{ color: 'rgba(245,237,216,0.4)', fontSize: '0.8rem' }}>Age {a.age || '?'} · {a.online_freq || '—'} · Dues: {yn(a.can_pay_dues)} · Pledge: {yn(a.can_pledge)}</div>
                  </div>
                  <div style={{ color: 'rgba(245,237,216,0.25)', fontSize: '0.75rem', textAlign: 'right', flexShrink: 0 }}>
                    {new Date(a.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {a.reviewed_by && <div style={{ marginTop: '2px' }}>by {a.reviewed_by}</div>}
                  </div>
                </div>
              ))}
            </div>
      }

      {sel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,3,6,0.94)', backdropFilter: 'blur(4px)', zIndex: 1000, overflowY: 'auto', padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) setSel(null) }}>
          <div style={{ background: '#120709', border: '1px solid rgba(212,175,55,0.28)', borderRadius: '14px', padding: 'clamp(20px,3vw,32px)', maxWidth: '680px', width: '100%', margin: '16px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: "'Cinzel Decorative',serif", color: '#F5EDD8', fontSize: '1.2rem', fontWeight: 400, margin: '0 0 4px' }}>{sel.iw_name}</h3>
                <p style={{ color: 'rgba(245,237,216,0.4)', margin: 0, fontSize: '0.82rem' }}>Submitted {new Date(sel.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: 'rgba(245,237,216,0.4)', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '10px', marginBottom: '20px' }}>
              {[['Age', sel.age || '—'], ['Instagram', sel.instagram || '—'], ['Discord', sel.has_discord || '—'], ['Online', sel.online_freq || '—'], ['Prev Sorority', yn(sel.prev_sorority)], ['Pays Dues', yn(sel.can_pay_dues)], ['IG Daily', yn(sel.instagram_daily)], ['Can Pledge', yn(sel.can_pledge)]].map(([l, v]) => (
                <div key={l} style={{ background: 'rgba(123,3,35,0.15)', borderRadius: '7px', padding: '9px 12px' }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: 'rgba(245,237,216,0.38)', fontSize: '0.42rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>{l}</div>
                  <div style={{ color: '#F5EDD8', fontSize: '0.85rem', wordBreak: 'break-word' }}>{v}</div>
                </div>
              ))}
            </div>

            {[['🍷 Why KGE?', sel.why_kge], ['🌸 What Sisterhood Means', sel.sisterhood_meaning], ['✦ What She Brings', sel.brings_to_kge]].map(([l, v]) => v && (
              <div key={l} style={{ marginBottom: '16px' }}>
                <div style={{ fontFamily: "'Cinzel',serif", color: '#D4AF37', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>{l}</div>
                <div style={{ color: 'rgba(245,237,216,0.8)', fontSize: '0.9rem', lineHeight: '1.7', background: 'rgba(14,5,8,0.5)', borderRadius: '7px', padding: '11px 14px', borderLeft: '2px solid rgba(212,175,55,0.3)' }}>{v}</div>
              </div>
            ))}

            <div style={{ borderTop: '1px solid rgba(212,175,55,0.12)', paddingTop: '20px', marginTop: '4px' }}>
              <div style={{ fontFamily: "'Cinzel',serif", color: '#ff6baa', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>Decision</div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontFamily: "'Cinzel',serif", color: 'rgba(212,175,55,0.5)', fontSize: '0.45rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '7px' }}>Status</div>
                <select style={{ ...inp, maxWidth: '200px', cursor: 'pointer' }} value={ns} onChange={e => setNs(e.target.value)}>
                  <option value="pending">⏳ Pending</option>
                  <option value="interview">💬 Interview</option>
                  <option value="accepted">✅ Accepted</option>
                  <option value="waitlisted">⏸ Waitlisted</option>
                  <option value="rejected">✕ Rejected</option>
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontFamily: "'Cinzel',serif", color: 'rgba(212,175,55,0.5)', fontSize: '0.45rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '7px' }}>Internal Notes</div>
                <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} placeholder="Notes visible only to Founders & DOP..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={save} disabled={saving} style={{ padding: '0.65rem 1.6rem', fontFamily: "'Cinzel',serif", fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(255,107,170,0.15)', border: '1px solid rgba(255,107,170,0.4)', color: '#ff9ec8', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>{saving ? 'Saving...' : 'Save Decision'}</button>
                {msg && <span style={{ color: msg === 'Saved!' ? '#35df24' : '#ff6baa', fontSize: '0.85rem', fontStyle: 'italic' }}>{msg}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
