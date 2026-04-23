import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const scheduleId = Number(body.scheduleId)
    const reason = String(body.reason || '').trim() || '관리자 일정 취소'

    if (!scheduleId) {
      return NextResponse.json(
        { ok: false, message: 'scheduleId가 필요합니다.' },
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

    const { data, error } = await supabase.rpc('cancel_schedule_by_admin', {
      p_schedule_id: scheduleId,
      p_reason: reason,
    })

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message || '일정 취소 중 오류가 발생했습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(data, {
      status: data?.ok ? 200 : 400,
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: '일정 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
