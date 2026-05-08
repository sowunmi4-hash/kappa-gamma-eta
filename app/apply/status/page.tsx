'use client'

import { useState } from 'react'

type AppResult = {
  found: boolean
  id?: string
  iw_name?: string
  status?: string
  interview_slots?: string[]
  interview_slot_picked?: string
  submitted_at?: string
  temp_password?: string
}

const pg: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(160deg,#0e0508 0%,#1a0a0f 60%,#2a0618 100%)',
  fontFamily: "'Cormorant Garamond',Georgia,serif",
  color: '#F5EDD8',
}

const letterWrap: React.CSSProperties = {
  maxWidth: 620,
  margin: '0 auto',
  padding: '0 20px 80px',
}

const letterCard: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(26,10,15,0.95), rgba(18,7,9,0.98))',
  border: '1px solid rgba(212,175,55,0.25)',
  padding: 'clamp(28px,5vw,52px)',
  position: 'relative',
}

const divider: React.CSSProperties = {
  width: '100%', height: '1px',
  background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)',
  margin: '1.6rem 0',
}

export default function StatusPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AppResult | null>(null)
  const [error, setError] = useState('')
  const [slotPicking, setSlotPicking] = useState(false)
  const [slotDone, setSlotDone] = useState(false)
  const [slotMsg, setSlotMsg] = useState('')

  const parseSlots = (slots: any): string[] => {
    if (!slots) return []
    if (Array.isArray(slots)) return slots
    if (typeof slots === 'string') { try { return JSON.parse(slots) } catch { return [] } }
    return []
  }

  const search = async () => {
    if (!name.trim()) return
    setLoading(true); setError(''); setResult(null); setSlotDone(false)
    try {
      const res = await fetch('/api/applications/status?name=' + encodeURIComponent(name.trim()))
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const pickSlot = async (slot: string) => {
    if (!result?.iw_name) return
    setSlotPicking(true); setSlotMsg('')
    try {
      const res = await fetch('/api/applications/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iw_name: result.iw_name, slot }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed')
      setSlotDone(true)
      setSlotMsg(slot)
      setResult(r => r ? { ...r, interview_slot_picked: slot } : r)
    } catch (e: any) { setSlotMsg('Error: ' + e.message) }
    finally { setSlotPicking(false) }
  }

  const inp: React.CSSProperties = {
    background: 'rgba(14,5,8,0.7)', border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: '4px', padding: '14px 20px', color: '#F5EDD8',
    fontFamily: 'inherit', fontSize: '16px', outline: 'none',
    flex: 1,
  }

  const date = result?.submitted_at
    ? new Date(result.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''

  return (
    <div style={pg}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(14,5,8,0.95)', borderBottom: '1px solid rgba(212,175,55,0.1)', backdropFilter: 'blur(4px)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1rem', color: '#D4AF37', letterSpacing: '0.1em' }}>ΚΓΗ</span>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {[['Apply', '/apply'], ['Check Status', '/apply/status'], ['Home', '/']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontFamily: "'Cinzel',serif", fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: l === 'Check Status' ? '#D4AF37' : 'rgba(212,175,55,0.5)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '52px 20px 36px' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.52rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#ff6baa', marginBottom: '0.6rem' }}>Kappa Gamma Eta</div>
        <h1 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 400, color: '#F5EDD8', margin: '0 0 0.5rem' }}>Application Status</h1>
        <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '1rem', margin: 0 }}>Enter your Second Life avatar name to check your status</p>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            style={inp}
            placeholder="Your SL avatar name…"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <button
            onClick={search}
            disabled={loading || !name.trim()}
            style={{
              background: loading ? 'rgba(123,3,35,0.3)' : 'linear-gradient(135deg,#7b0323,#b01840)',
              color: '#F5EDD8', border: 'none', borderRadius: '4px',
              padding: '14px 28px', fontFamily: "'Cinzel',serif",
              fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
            }}
          >{loading ? '…' : 'Check'}</button>
        </div>
        {error && <p style={{ color: '#ff6baa', fontSize: '14px', marginTop: '10px', fontStyle: 'italic' }}>{error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div style={letterWrap}>
          {!result.found ? (
            <div style={{ ...letterCard, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.5)', fontSize: '1.1rem' }}>No application found for <strong style={{ color: '#D4AF37' }}>{name}</strong>.</p>
              <p style={{ color: 'rgba(245,237,216,0.3)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Check your spelling or <a href="/apply" style={{ color: '#ff6baa', textDecoration: 'none' }}>submit an application</a>.</p>
            </div>

          ) : result.status === 'pending' ? (
            <div style={letterCard}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.4rem', color: '#D4AF37', letterSpacing: '0.08em' }}>Κ Γ Η</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.42rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)', marginTop: '0.3rem' }}>Kappa Gamma Eta</div>
              </div>
              <div style={divider} />
              <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '0.85rem', marginBottom: '1.8rem' }}>{date}</p>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>Dear <strong style={{ color: '#ff6baa' }}>{result.iw_name}</strong>,</p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.2rem' }}>
                Thank you for your interest in Kappa Gamma Eta. We have received your application and it is currently <strong style={{ color: '#D4AF37' }}>under review</strong> by our Founders.
              </p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.8rem' }}>
                We take the time to carefully consider every applicant. Please check back here for updates — you will see a new letter when a decision has been made.
              </p>
              <div style={divider} />
              <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '0.9rem', textAlign: 'right' }}>With warmth,<br /><span style={{ color: '#D4AF37' }}>The Founders of Kappa Gamma Eta</span></p>
            </div>

          ) : result.status === 'waitlisted' ? (
            <div style={letterCard}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.4rem', color: '#D4AF37', letterSpacing: '0.08em' }}>Κ Γ Η</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.42rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)', marginTop: '0.3rem' }}>Kappa Gamma Eta</div>
              </div>
              <div style={divider} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
                <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '0.85rem', margin: 0 }}>{date}</p>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.44rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.3rem 0.8rem', background: 'rgba(255,107,170,0.08)', border: '1px solid rgba(255,107,170,0.25)', color: '#ff6baa' }}>Waitlist</span>
              </div>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>Dear <strong style={{ color: '#ff6baa' }}>{result.iw_name}</strong>,</p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.2rem' }}>
                Thank you for taking the time to apply to Kappa Gamma Eta. We were genuinely moved by your application and the thoughtfulness you put into it.
              </p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.2rem' }}>
                After careful consideration, we have placed your application on our <strong style={{ color: '#ff6baa' }}>waitlist</strong>. This is not a rejection — it means we see real potential in you and want to keep the door open. Should a place become available, or should circumstances change, you will be among the first we reach out to.
              </p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.8rem' }}>
                We encourage you to continue being the woman you are. Please check back here — if your status changes, a new letter will appear.
              </p>
              <div style={{ background: 'rgba(255,107,170,0.05)', border: '1px solid rgba(255,107,170,0.15)', padding: '1rem 1.2rem', marginBottom: '1.8rem' }}>
                <p style={{ margin: 0, fontStyle: 'italic', color: 'rgba(245,237,216,0.5)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  "She is strong like whiskey, but soft like wine." — Keep being her.
                </p>
              </div>
              <div style={divider} />
              <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '0.9rem', textAlign: 'right' }}>With sincere regard,<br /><span style={{ color: '#D4AF37' }}>The Founders of Kappa Gamma Eta</span></p>
            </div>

          ) : result.status === 'interview' ? (
            <div style={letterCard}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.4rem', color: '#D4AF37', letterSpacing: '0.08em' }}>Κ Γ Η</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.42rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)', marginTop: '0.3rem' }}>Kappa Gamma Eta</div>
              </div>
              <div style={divider} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
                <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '0.85rem', margin: 0 }}>{date}</p>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.44rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.3rem 0.8rem', background: 'rgba(117,255,255,0.1)', border: '1px solid rgba(117,255,255,0.3)', color: '#75ffff' }}>Interview Stage</span>
              </div>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>Dear <strong style={{ color: '#ff6baa' }}>{result.iw_name}</strong>,</p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.2rem' }}>
                We are pleased to invite you to the <strong style={{ color: '#D4AF37' }}>interview stage</strong> of your application to Kappa Gamma Eta. Your application stood out to our Founders and we would love to get to know you better.
              </p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '2rem' }}>
                Please select one of the available time slots below. We will meet with you in Second Life at your chosen time. Come as you are — this is simply a conversation.
              </p>

              {/* Slot picker */}
              {result.interview_slot_picked || slotDone ? (
                <div style={{ background: 'rgba(53,223,36,0.06)', border: '1px solid rgba(53,223,36,0.25)', padding: '1.2rem 1.4rem', marginBottom: '1.8rem' }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#35df24', marginBottom: '0.4rem' }}>✓ Slot Confirmed</div>
                  <div style={{ color: '#F5EDD8', fontSize: '1rem' }}>{result.interview_slot_picked || slotMsg}</div>
                </div>
              ) : (
                <div style={{ marginBottom: '1.8rem' }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '1rem' }}>Available Times — Select One</div>
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {parseSlots(result.interview_slots).length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.35)', fontSize: '0.9rem' }}>Time slots will be posted shortly. Please check back soon.</p>
                    ) : parseSlots(result.interview_slots).map((slot, i) => (
                      <button key={i} onClick={() => pickSlot(slot)} disabled={slotPicking} style={{
                        background: 'rgba(123,3,35,0.15)', border: '1px solid rgba(212,175,55,0.25)',
                        color: '#F5EDD8', padding: '0.9rem 1.2rem', textAlign: 'left',
                        fontFamily: "'Cormorant Garamond',serif", fontSize: '1rem',
                        cursor: slotPicking ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '0.8rem',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.55)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(123,3,35,0.3)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.25)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(123,3,35,0.15)' }}
                      >
                        <span style={{ color: '#D4AF37', fontFamily: "'Cinzel',serif", fontSize: '0.7rem' }}>{i + 1}.</span>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={divider} />
              <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '0.9rem', textAlign: 'right' }}>With excitement,<br /><span style={{ color: '#D4AF37' }}>The Founders of Kappa Gamma Eta</span></p>
            </div>

          ) : result.status === 'rejected' ? (
            <div style={letterCard}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.4rem', color: '#D4AF37', letterSpacing: '0.08em' }}>Κ Γ Η</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.42rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)', marginTop: '0.3rem' }}>Kappa Gamma Eta</div>
              </div>
              <div style={divider} />
              <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '0.85rem', marginBottom: '1.8rem' }}>{date}</p>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>Dear <strong style={{ color: '#ff6baa' }}>{result.iw_name}</strong>,</p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.2rem' }}>
                Thank you sincerely for your interest in Kappa Gamma Eta and for taking the time to share yourself with us through your application. We have given it our full consideration.
              </p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.2rem' }}>
                After careful review, we are unable to move forward with your application at this time. This decision is never made lightly, and it is not a reflection of your worth or character.
              </p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.8rem' }}>
                We wish you nothing but the best on your journey in Second Life, and we are grateful for your interest in our sisterhood.
              </p>
              <div style={divider} />
              <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '0.9rem', textAlign: 'right' }}>With respect and warmth,<br /><span style={{ color: '#D4AF37' }}>The Founders of Kappa Gamma Eta</span></p>
            </div>

          ) : result.status === 'accepted' ? (
            <div style={{ ...letterCard, border: '1px solid rgba(212,175,55,0.4)' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.6rem', color: '#D4AF37', letterSpacing: '0.08em' }}>Κ Γ Η</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.42rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.4)', marginTop: '0.3rem' }}>Kappa Gamma Eta</div>
              </div>
              <div style={{ ...divider, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
                <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '0.85rem', margin: 0 }}>{date}</p>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.44rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.3rem 0.8rem', background: 'rgba(53,223,36,0.1)', border: '1px solid rgba(53,223,36,0.35)', color: '#35df24' }}>✓ Accepted</span>
              </div>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>Dear <strong style={{ color: '#ff6baa' }}>{result.iw_name}</strong>,</p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.2rem' }}>
                On behalf of the Founders and sisters of <strong style={{ color: '#D4AF37' }}>Kappa Gamma Eta</strong>, it is with great joy that we welcome you into our sisterhood.
              </p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.2rem' }}>
                Your application moved us. You embody the spirit of what we stand for — unity, respect, and empowerment. We believe you will be a wonderful addition to our family.
              </p>
              <p style={{ lineHeight: 1.9, color: 'rgba(245,237,216,0.75)', marginBottom: '1.2rem' }}>
                Your pledging journey begins now. You will have access to your personal pledge portal where you can track your progress. Use the credentials below to log in.
              </p>

              {result.temp_password && (
                <div style={{ background: 'rgba(53,223,36,0.05)', border: '1px solid rgba(53,223,36,0.3)', padding: '1.4rem 1.6rem', marginBottom: '1.4rem' }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(53,223,36,0.7)', marginBottom: '0.8rem' }}>Your Portal Access</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.5rem', letterSpacing: '0.12em', color: 'rgba(245,237,216,0.4)', textTransform: 'uppercase', minWidth: 80 }}>Username</span>
                      <code style={{ background: 'rgba(245,237,216,0.08)', padding: '0.3rem 0.7rem', color: '#F5EDD8', fontSize: '0.95rem', letterSpacing: '0.05em' }}>{result.iw_name}</code>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.5rem', letterSpacing: '0.12em', color: 'rgba(245,237,216,0.4)', textTransform: 'uppercase', minWidth: 80 }}>Password</span>
                      <code style={{ background: 'rgba(245,237,216,0.08)', padding: '0.3rem 0.7rem', color: '#35df24', fontSize: '1rem', letterSpacing: '0.15em', fontWeight: 'bold' }}>{result.temp_password}</code>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.5rem', letterSpacing: '0.12em', color: 'rgba(245,237,216,0.4)', textTransform: 'uppercase', minWidth: 80 }}>Login</span>
                      <code style={{ background: 'rgba(245,237,216,0.08)', padding: '0.3rem 0.7rem', color: '#75ffff', fontSize: '0.85rem' }}>kappa-gamma-eta.vercel.app/login</code>
                    </div>
                  </div>
                  <p style={{ margin: '0.8rem 0 0', fontSize: '0.8rem', color: 'rgba(245,237,216,0.35)', fontStyle: 'italic' }}>Save these credentials. You will be prompted to change your password on first login.</p>
                </div>
              )}

              <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', padding: '1.2rem 1.4rem', marginBottom: '1.8rem', textAlign: 'center' }}>
                <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.5)', margin: '0 0 0.3rem', fontSize: '0.85rem' }}>Our Motto</p>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: '0.7rem', letterSpacing: '0.1em', color: '#D4AF37', margin: 0 }}>"She is strong like whiskey, but soft like wine."</p>
              </div>
              <div style={{ ...divider, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }} />
              <p style={{ fontStyle: 'italic', color: 'rgba(245,237,216,0.4)', fontSize: '0.9rem', textAlign: 'right' }}>With love and sisterhood,<br /><span style={{ color: '#D4AF37' }}>The Founders of Kappa Gamma Eta</span></p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
