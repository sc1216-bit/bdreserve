import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function buildKstIso(date: string, time: string) {
  return `${date}T${time}:00+09:00`
}

function buildMemberCancelDeadline(date: string) {
  const target = new Date(`${date}T00:00:00+09:00`)
  target.setDate(target.getDate() - 2)
  const yyyy = target.getFullYear()
  const mm = String(target.getMonth() + 1).padStart(2, '0')
  const dd = String(target.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T18:00:00+09:00`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const title = String(body.title || '').trim()
    const description = String(body.description || '').trim()
    const scheduleDate = String(body.scheduleDate || '').trim()
    const startTime = String(body.startTime || '').trim()
    const endTime = String(body.endTime || '').trim()
    const locationName = String(body.locationName || '').trim()
    const capacity = Number(body.capacity)
    const minLevelPriority = Number(body.minLevelPriority)

    if (!title || !scheduleDate || !startTime || !endTime || !capacity || !minLevelPriority) {
      return NextResponse.json(
        { ok: false, message: '필수 입력값이 누락되었습니다.' },
        { status: 400 }
      )
    }

    const startAt = buildKstIso(scheduleDate, startTime)
    const endAt = buildKstIso(scheduleDate, endTime)

    if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      return NextResponse.json(
        { ok: false, message: '종료 시간은 시작 시간보다 뒤여야 합니다.' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json(
        { ok: false, message: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { error } = await supabase.from('schedules').insert({
      title,
      description: description || null,
      schedule_date: scheduleDate,
      start_at: startAt,
      end_at: endAt,
      capacity,
      reserved_count: 0,
      min_level_priority: minLevelPriority,
      status: 'OPEN',
      member_cancel_deadline_at: buildMemberCancelDeadline(scheduleDate),
      location_name: locationName || null,
      created_by: user.id,
    })

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message || '일정 등록 중 오류가 발생했습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, message: '일정이 등록되었습니다.' })
  } catch {
    return NextResponse.json(
      { ok: false, message: '일정 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
