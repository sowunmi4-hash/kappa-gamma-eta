import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: 'members' } }
)

async function getSessionMember(token: string) {
  const { data: session } = await supabase
    .from('website_sessions').select('member_id, is_active, expires_at')
    .eq('session_token', token).single()
  if (!session?.is_active || new Date(session.expires_at) < new Date()) return null
  const { data: member } = await supabase
    .from('roster').select('id, role, display_name')
    .eq('id', session.member_id).single()
  return member
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('kge_session')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const member = await getSessionMember(token)
  if (!member || !['Founder', 'DOP'].includes(member.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  let q = supabase.from('applications').select('*').order('submitted_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ applications: data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { iw_name, age, why_kge, sisterhood_meaning, brings_to_kge } = body
  if (!iw_name?.trim() || !age?.trim() || !why_kge?.trim() || !sisterhood_meaning?.trim() || !brings_to_kge?.trim())
    return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
  if (parseInt(age) < 18)
    return NextResponse.json({ error: 'You must be 18 or older to apply.' }, { status: 400 })
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: existing } = await supabase.from('applications').select('id')
    .eq('iw_name', iw_name.trim()).gte('submitted_at', cutoff).maybeSingle()
  if (existing)
    return NextResponse.json({ error: 'An application from this avatar was submitted recently. Please wait 30 days before reapplying.' }, { status: 409 })
  const { data, error } = await supabase.from('applications').insert({
    iw_name: iw_name.trim(), age: age.trim(),
    instagram: body.instagram?.trim() || null,
    has_discord: body.has_discord?.trim() || null,
    prev_sorority: body.prev_sorority === true,
    online_freq: body.online_freq || null,
    can_pay_dues: body.can_pay_dues === true,
    instagram_daily: body.instagram_daily === true,
    why_kge: why_kge.trim(),
    sisterhood_meaning: sisterhood_meaning.trim(),
    can_pledge: body.can_pledge === true,
    brings_to_kge: brings_to_kge.trim(),
    status: 'pending',
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('kge_session')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const member = await getSessionMember(token)
  if (!member || !['Founder', 'DOP'].includes(member.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, status, review_notes } = await request.json()
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
  const { error } = await supabase.from('applications').update({
    status, review_notes: review_notes || null,
    reviewed_by: member.display_name,
    reviewed_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
