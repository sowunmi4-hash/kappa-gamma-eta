'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface App {
  id: string; iw_name: string; age: string; instagram: string; has_discord: string
  prev_sorority: boolean; online_freq: string; can_pay_dues: boolean
  instagram_daily: boolean; why_kge: string; sisterhood_meaning: string
  can_pledge: boolean; brings_to_kge: string; status: string
  review_notes: string; reviewed_by: string; reviewed_at: string; submitted_at: string
  interview_slots: string[]; interview_slot_picked: string
}

const STA: Record<string, { c: string; l: string }> = {
  pending:    { c: '#D4AF37', l: '⏳ Pending' },
  interview:  { c: '#75ffff', l: '💬 Interview' },
  accepted:   { c: '#35df24', l: '✅ Accepted' },
  waitlisted: { c: '#ff6baa', l: '⏸ Waitlisted' },
  rejected:   { c: '#c44444', l: '✕ Rejected' },
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
  const [slots, setSlots] = useState<string[]>([])
  const [slotInput, setSlotInput] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const url = filter === 'all' ? '/api/applications' : '/api/applications?status=' + filter
    const res = await fetch(url)
    const data = await res.json()
    setApps(data.applications || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  const open = (a: App) => {
    setSel(a); setNs(a.status); setNotes(a.review_notes || ''); setMsg('')
    setSlots(a.interview_slots || []); setSlotInput('')
    document.body.style.overflow = 'hidden'
  }
  const close = () => {
    setSel(null)
    document.body.style.overflow = ''
  }

  const save = async () => {
    if (!sel) return
    setSaving(true); setMsg('')
    const res = await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sel.id, status: ns, review_notes: notes, interview_slots: ns === 'interview' ? slots : undefined }),
    })
    if (res.ok) { setMsg('Saved!'); setSel(s => s ? { ...s, status: ns, review_notes: notes } : s); load() }
    else { setMsg('Error saving') }
    setSaving(false)
  }

  const counts: Record<string, number> = { all: 0 }
  apps.forEach(a => { counts.all++; counts[a.status] = (counts[a.status] || 0) + 1 })

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(10,3,6,0.8)',
    border: '1px solid rgba(212,175,55,0.25)', borderRadius: '4px',
    padding: '0.6rem 0.9rem', color: '#F5EDD8',
    fontFamily: "'Cormorant Garamond',serif", fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box',
  }

  const modal = sel && mounted ? createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) close() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,3,6,0.92)', backdropFilter: 'blur(6px)',
        overflowY: 'auto', padding: '2rem 1rem',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      }}
    >
      <div style={{
        background: 'linear-gradient(160deg, #1a0a0f 0%, #120709 100%)',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '4px', width: '100%', maxWidth: '700px',
        margin: '0 auto', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '1.6rem 2rem 1.2rem',
          borderBottom: '1px solid rgba(212,175,55,0.1)',
          background: 'linear-gradient(135deg, rgba(255,107,170,0.06), rgba(212,175,55,0.04))',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.48rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#ff6baa', marginBottom: '0.4rem' }}>Pledge Application</div>
            <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.3rem', color: '#F5EDD8', lineHeight: 1.2 }}>{sel.iw_name}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(245,237,216,0.35)', marginTop: '0.3rem' }}>
              Submitted {new Date(sel.submitted_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              background: (STA[sel.status]?.c || '#888') + '20',
              color: STA[sel.status]?.c || '#888',
              border: '1px solid ' + (STA[sel.status]?.c || '#888') + '50',
              fontFamily: "'Cinzel',serif", fontSize: '0.46rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', padding: '0.3rem 0.8rem', borderRadius: '2px',
            }}>{STA[sel.status]?.l || sel.status}</span>
            <button onClick={close} style={{ background: 'none', border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(245,237,216,0.4)', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>

        {/* Quick facts grid */}
        <div style={{ padding: '1.4rem 2rem', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.44rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)', marginBottom: '1rem' }}>Profile</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
            {[
              ['Age', sel.age || '—'],
              ['Instagram', sel.instagram || '—'],
              ['Discord', sel.has_discord || '—'],
              ['Online Freq', sel.online_freq || '—'],
              ['Prev Sorority', yn(sel.prev_sorority)],
              ['Pays Dues', yn(sel.can_pay_dues)],
              ['IG Daily', yn(sel.instagram_daily)],
              ['Can Pledge', yn(sel.can_pledge)],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(123,3,35,0.12)', border: '1px solid rgba(212,175,55,0.08)', padding: '0.6rem 0.8rem' }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.38rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.45)', marginBottom: '0.3rem' }}>{l}</div>
                <div style={{ color: '#F5EDD8', fontSize: '0.88rem', wordBreak: 'break-word' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Essay answers */}
        <div style={{ padding: '1.4rem 2rem', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.44rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)', marginBottom: '1rem' }}>Responses</div>
          {[
            ['Why Kappa Gamma Eta?', sel.why_kge],
            ['What Sisterhood Means to Her', sel.sisterhood_meaning],
            ['What She Brings to KGE', sel.brings_to_kge],
          ].map(([label, value]) => value ? (
            <div key={label} style={{ marginBottom: '1.2rem' }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.46rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '0.5rem' }}>{label}</div>
              <div style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'rgba(245,237,216,0.75)', lineHeight: 1.7, padding: '0.9rem 1.1rem', background: 'rgba(14,5,8,0.4)', borderLeft: '2px solid rgba(212,175,55,0.3)' }}>{value}</div>
            </div>
          ) : null)}
        </div>

        {/* Decision */}
        <div style={{ padding: '1.4rem 2rem' }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.44rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)', marginBottom: '1rem' }}>Decision</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.42rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.45)', marginBottom: '0.4rem' }}>Update Status</div>
              <select id="field-39" name="field-39" style={{ ...inp, cursor: 'pointer' }} value={ns} onChange={e => setNs(e.target.value)}>
                <option value="pending">⏳ Pending</option>
                <option value="interview">💬 Interview</option>
                <option value="accepted">✅ Accepted</option>
                <option value="waitlisted">⏸ Waitlisted</option>
                <option value="rejected">✕ Rejected</option>
              </select>
            </div>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.42rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.45)', marginBottom: '0.4rem' }}>Internal Notes</div>
              <textarea id="field-40" name="field-40" style={{ ...inp, minHeight: '60px', resize: 'vertical' }} placeholder="Private notes for Founders & Admin..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {/* Interview slot builder */}
          {ns === 'interview' && (
            <div style={{ marginBottom: '1rem', background: 'rgba(117,255,255,0.04)', border: '1px solid rgba(117,255,255,0.15)', padding: '1rem 1.2rem' }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.42rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#75ffff', marginBottom: '0.8rem' }}>📅 Available Interview Slots</div>
              {sel.interview_slot_picked && (
                <div style={{ marginBottom: '0.8rem', fontSize: '0.82rem', color: '#35df24', fontStyle: 'italic' }}>✓ Applicant selected: <strong>{sel.interview_slot_picked}</strong></div>
              )}
              <div style={{ display: 'grid', gap: '0.4rem', marginBottom: '0.8rem' }}>
                {slots.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(14,5,8,0.4)', padding: '0.5rem 0.8rem' }}>
                    <span style={{ color: 'rgba(245,237,216,0.6)', fontSize: '0.9rem', flex: 1 }}>{s}</span>
                    <button onClick={() => setSlots(slots.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(245,237,216,0.3)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                  </div>
                ))}
              </div>
              {slots.length < 4 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input id="field-41" name="field-41"
                    style={{ ...inp, fontSize: '0.85rem', flex: 1 }}
                    placeholder="e.g. Saturday May 10 · 3:00 PM SLT"
                    value={slotInput}
                    onChange={e => setSlotInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && slotInput.trim()) { setSlots([...slots, slotInput.trim()]); setSlotInput('') } }}
                  />
                  <button
                    onClick={() => { if (slotInput.trim()) { setSlots([...slots, slotInput.trim()]); setSlotInput('') } }}
                    style={{ background: 'rgba(117,255,255,0.1)', border: '1px solid rgba(117,255,255,0.3)', color: '#75ffff', padding: '0 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}
                  >+ Add</button>
                </div>
              )}
              <p style={{ color: 'rgba(245,237,216,0.3)', fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'italic' }}>Up to 4 slots. Applicant picks one on the status page.</p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={save} disabled={saving} style={{
              padding: '0.65rem 1.8rem', fontFamily: "'Cinzel',serif", fontSize: '0.55rem',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              background: saving ? 'rgba(255,107,170,0.06)' : 'rgba(255,107,170,0.15)',
              border: '1px solid rgba(255,107,170,0.4)', color: '#ff9ec8',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1, transition: 'all 0.2s',
            }}>{saving ? 'Saving…' : 'Save Decision'}</button>
            {sel.reviewed_by && <span style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(245,237,216,0.25)' }}>Last reviewed by {sel.reviewed_by}</span>}
            {msg && <span style={{ fontSize: '0.85rem', color: msg === 'Saved!' ? '#35df24' : '#ff6baa', fontStyle: 'italic' }}>{msg}</span>}
          </div>
        </div>

      </div>
    </div>,
    document.body
  ) : null

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.6rem' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.55rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#ff6baa', marginBottom: '0.35rem' }}>Membership</div>
        <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.5rem', color: '#F5EDD8' }}>Pledge Applications</div>
        <div className="shimmer-line" style={{ margin: '1rem 0' }} />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'interview', 'accepted', 'waitlisted', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? 'rgba(255,107,170,0.15)' : 'transparent',
            border: '1px solid ' + (filter === f ? 'rgba(255,107,170,0.4)' : 'rgba(212,175,55,0.15)'),
            color: filter === f ? '#ff9ec8' : 'rgba(245,237,216,0.4)',
            fontFamily: "'Cinzel',serif", fontSize: '0.46rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', padding: '0.4rem 0.9rem', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {f === 'all' ? 'All' : STA[f]?.l || f}{counts[f] ? ' · ' + counts[f] : ''}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', fontStyle: 'italic', color: 'rgba(245,237,216,0.3)', fontFamily: "'Cormorant Garamond',serif" }}>Loading applications…</div>
      ) : apps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌸</div>
          <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.3)' }}>No applications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {apps.map(a => (
            <div key={a.id} onClick={() => open(a)} style={{
              background: '#221018', border: '1px solid rgba(212,175,55,' + (sel?.id === a.id ? '0.4' : '0.12') + ')',
              padding: '1rem 1.4rem', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.35)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = sel?.id === a.id ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.12)' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.65rem', letterSpacing: '0.1em', color: '#D4AF37' }}>{a.iw_name}</span>
                  <span style={{
                    background: (STA[a.status]?.c || '#888') + '18',
                    color: STA[a.status]?.c || '#888',
                    border: '1px solid ' + (STA[a.status]?.c || '#888') + '40',
                    fontFamily: "'Cinzel',serif", fontSize: '0.38rem', letterSpacing: '0.12em',
                    textTransform: 'uppercase', padding: '0.15rem 0.6rem',
                  }}>{STA[a.status]?.l || a.status}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(245,237,216,0.38)', fontStyle: 'italic' }}>
                  Age {a.age || '?'} · {a.online_freq || '—'} · Dues: {yn(a.can_pay_dues)} · Pledge: {yn(a.can_pledge)}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.42rem', letterSpacing: '0.1em', color: 'rgba(212,175,55,0.3)', textTransform: 'uppercase' }}>
                  {new Date(a.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                {a.reviewed_by && <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.2)', fontStyle: 'italic', marginTop: '0.2rem' }}>by {a.reviewed_by}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal}
    </div>
  )
}
