'use client'

import { useState } from 'react'

type F = {
  iw_name: string; age: string; instagram: string; has_discord: string
  prev_sorority: string; online_freq: string; can_pay_dues: string
  instagram_daily: string; can_pledge: string
  why_kge: string; sisterhood_meaning: string; brings_to_kge: string
}

export default function ApplyPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<F>({
    iw_name: '', age: '', instagram: '', has_discord: '',
    prev_sorority: '', online_freq: '', can_pay_dues: '',
    instagram_daily: '', can_pledge: '',
    why_kge: '', sisterhood_meaning: '', brings_to_kge: '',
  })

  const set = (f: keyof F, v: string) => { setForm(p => ({ ...p, [f]: v })); setError('') }

  const validate = () => {
    if (step === 1) {
      if (!form.iw_name.trim()) return 'Please enter your Second Life avatar name'
      if (!form.age.trim()) return 'Please enter your age'
      if (parseInt(form.age) < 18) return 'You must be 18 or older to apply'
    }
    if (step === 3) {
      if (!form.why_kge.trim()) return 'Please answer why you want to join KGE'
      if (!form.sisterhood_meaning.trim()) return 'Please share what sisterhood means to you'
      if (!form.brings_to_kge.trim()) return 'Please tell us what you bring to KGE'
    }
    return null
  }

  const next = () => { const e = validate(); if (e) { setError(e); return }; setStep(s => s + 1); setError(''); window.scrollTo(0, 0) }
  const back = () => { setStep(s => s - 1); setError('') }

  const submit = async () => {
    const e = validate(); if (e) { setError(e); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          prev_sorority: form.prev_sorority === 'yes',
          can_pay_dues: form.can_pay_dues === 'yes',
          instagram_daily: form.instagram_daily === 'yes',
          can_pledge: form.can_pledge === 'yes',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const pg: React.CSSProperties = { minHeight: '100vh', background: 'linear-gradient(160deg,#0e0508 0%,#1a0a0f 60%,#2a0618 100%)', fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#F5EDD8' }
  const inp: React.CSSProperties = { width: '100%', background: 'rgba(14,5,8,0.7)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#F5EDD8', fontFamily: 'inherit', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', marginBottom: '7px', color: '#D4AF37', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }
  const fld: React.CSSProperties = { marginBottom: '22px' }
  const RB = (v: string, f: keyof F, l: string) => (
    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', fontSize: '15px', marginRight: '20px' }}>
      <input type="radio" name={f} value={v} checked={form[f] === v} onChange={e => set(f, e.target.value)} style={{ accentColor: '#D4AF37', width: '16px', height: '16px' }} />{l}
    </label>
  )
  const steps = [{ n: 1, t: 'About You', i: '✦' }, { n: 2, t: 'Background', i: '🍷' }, { n: 3, t: 'Your Heart', i: '🌸' }]

  if (submitted) return (
    <div style={{ ...pg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>🌸</div>
      <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', color: '#D4AF37', fontWeight: 400, margin: '0 0 14px' }}>Application Received</h1>
      <p style={{ color: 'rgba(245,237,216,0.7)', fontSize: '17px', maxWidth: '500px', lineHeight: 1.7, margin: '0 auto 20px' }}>
        Thank you, <strong style={{ color: '#ff6baa' }}>{form.iw_name}</strong>. Your application to Kappa Gamma Eta has been received. Our Founders will review it and reach out to you in Second Life.
      </p>
      <div style={{ width: '1px', height: '36px', background: 'rgba(212,175,55,0.25)', margin: '0 auto 20px' }} />
      <p style={{ color: '#D4AF37', fontSize: '14px', fontStyle: 'italic' }}>"She is strong like whiskey, but soft like wine."</p>
      <a href="/" style={{ color: 'rgba(245,237,216,0.35)', fontSize: '13px', textDecoration: 'none', marginTop: '28px', display: 'block' }}>← Return to site</a>
    </div>
  )

  return (
    <div style={pg}>
      <div style={{ textAlign: 'center', padding: '56px 20px 28px' }}>
        <div style={{ fontSize: '46px', marginBottom: '14px' }}>🍷</div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,50px)', fontWeight: 400, color: '#D4AF37', margin: '0 0 8px', letterSpacing: '0.04em' }}>Join the Sisterhood</h1>
        <p style={{ color: '#ff6baa', fontSize: '17px', fontStyle: 'italic', margin: '0 0 6px' }}>Kappa Gamma Eta — ΚΓΗ</p>
        <p style={{ color: 'rgba(245,237,216,0.4)', fontSize: '13px', fontStyle: 'italic' }}>"She is strong like whiskey, but soft like wine."</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: '0 20px' }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: s.n === step ? '#7b0323' : s.n < step ? 'rgba(212,175,55,0.15)' : 'transparent', border: '2px solid ' + (s.n <= step ? '#D4AF37' : 'rgba(212,175,55,0.22)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: s.n < step ? '#D4AF37' : '#F5EDD8', transition: 'all 0.3s' }}>
              {s.n < step ? '✓' : s.n}
            </div>
            {i < 2 && <div style={{ width: '28px', height: '1px', background: s.n < step ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.12)' }} />}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 20px 80px' }}>
        <div style={{ background: 'rgba(14,5,8,0.55)', border: '1px solid rgba(212,175,55,0.16)', borderRadius: '16px', padding: 'clamp(22px,4vw,42px)', backdropFilter: 'blur(10px)' }}>
          <h3 style={{ color: '#ff6baa', fontSize: '21px', fontWeight: 400, margin: '0 0 2px', fontStyle: 'italic' }}>{steps[step - 1].i} {steps[step - 1].t}</h3>
          <p style={{ color: 'rgba(245,237,216,0.28)', fontSize: '11px', margin: '0 0 26px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Step {step} of 3</p>

          {step === 1 && <>
            <div style={fld}><label style={lbl}>Second Life Avatar Name *</label><input style={inp} placeholder="Your SL display or username" value={form.iw_name} onChange={e => set('iw_name', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={fld}><label style={lbl}>Age * <span style={{ color: '#ff6baa', textTransform: 'none', letterSpacing: 0 }}>(18+)</span></label><input style={inp} type="number" min="18" max="99" placeholder="Your RL age" value={form.age} onChange={e => set('age', e.target.value)} /></div>
              <div style={fld}><label style={lbl}>Instagram Handle</label><input style={inp} placeholder="@yourhandle" value={form.instagram} onChange={e => set('instagram', e.target.value)} /></div>
            </div>
            <div style={fld}><label style={lbl}>Do you have Discord?</label><input style={inp} placeholder="Yes — username  or  No" value={form.has_discord} onChange={e => set('has_discord', e.target.value)} /></div>
          </>}

          {step === 2 && <>
            <div style={fld}><label style={lbl}>How often are you online in Second Life?</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.online_freq} onChange={e => set('online_freq', e.target.value)}>
                <option value="">Select one</option>
                <option value="Daily">Daily</option>
                <option value="Several times a week">Several times a week</option>
                <option value="Weekends mainly">Weekends mainly</option>
                <option value="A few times a month">A few times a month</option>
              </select>
            </div>
            <div style={fld}><label style={lbl}>Have you been in a sorority before?</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>{RB('yes', 'prev_sorority', 'Yes')}{RB('no', 'prev_sorority', 'No')}</div></div>
            <div style={fld}><label style={lbl}>Are you able to pay monthly dues? (L$2,000/mo)</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>{RB('yes', 'can_pay_dues', 'Yes')}{RB('no', 'can_pay_dues', 'No')}</div></div>
            <div style={fld}><label style={lbl}>Do you post on Instagram daily?</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>{RB('yes', 'instagram_daily', 'Yes')}{RB('no', 'instagram_daily', 'No')}</div></div>
            <div style={fld}><label style={lbl}>Are you able to commit to the pledging process?</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>{RB('yes', 'can_pledge', 'Yes')}{RB('no', 'can_pledge', 'No')}</div></div>
          </>}

          {step === 3 && <>
            <div style={fld}><label style={lbl}>Why do you want to join Kappa Gamma Eta? *</label><textarea style={{ ...inp, minHeight: '110px', resize: 'vertical', lineHeight: '1.6' }} placeholder="What draws you to KGE? What do you hope to find here..." value={form.why_kge} onChange={e => set('why_kge', e.target.value)} /></div>
            <div style={fld}><label style={lbl}>What does sisterhood mean to you? *</label><textarea style={{ ...inp, minHeight: '110px', resize: 'vertical', lineHeight: '1.6' }} placeholder="Share what unity, respect, and empowerment mean to you..." value={form.sisterhood_meaning} onChange={e => set('sisterhood_meaning', e.target.value)} /></div>
            <div style={fld}><label style={lbl}>What do you bring to KGE? *</label><textarea style={{ ...inp, minHeight: '110px', resize: 'vertical', lineHeight: '1.6' }} placeholder="Your qualities, energy, talents..." value={form.brings_to_kge} onChange={e => set('brings_to_kge', e.target.value)} /></div>
            <div style={{ background: 'rgba(123,3,35,0.1)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '8px', padding: '13px 15px', marginBottom: '8px' }}><p style={{ margin: 0, fontSize: '12px', color: 'rgba(245,237,216,0.45)', lineHeight: '1.7' }}>By submitting, you confirm you are 18+ and all information is truthful. Kappa Gamma Eta reserves the right to accept or decline any application.</p></div>
          </>}

          {error && <div style={{ background: 'rgba(180,20,40,0.18)', border: '1px solid rgba(255,107,170,0.28)', borderRadius: '8px', padding: '11px 15px', marginBottom: '14px', color: '#ff6baa', fontSize: '14px' }}>⚠ {error}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            {step > 1 ? <button onClick={back} style={{ background: 'transparent', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.28)', borderRadius: '8px', padding: '11px 22px', fontFamily: 'inherit', fontSize: '14px', cursor: 'pointer' }}>← Back</button> : <div />}
            {step < 3
              ? <button onClick={next} style={{ background: 'linear-gradient(135deg,#7b0323,#b01840)', color: '#F5EDD8', border: 'none', borderRadius: '8px', padding: '11px 26px', fontFamily: 'inherit', fontSize: '14px', cursor: 'pointer' }}>Continue →</button>
              : <button onClick={submit} disabled={loading} style={{ background: loading ? 'rgba(123,3,35,0.3)' : 'linear-gradient(135deg,#7b0323,#b01840)', color: '#F5EDD8', border: 'none', borderRadius: '8px', padding: '11px 26px', fontFamily: 'inherit', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>{loading ? '✦ Submitting...' : '🌸 Submit Application'}</button>
            }
          </div>
        </div>

      </div>
    </div>
  )
}
