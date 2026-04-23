import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const scheduleId = Number(body.scheduleId)

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

    const { data, error } = await supabase.rpc('book_schedule', {
      p_schedule_id: scheduleId,
    })

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message || '예약 처리 중 오류가 발생했습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(data, {
      status: data?.ok ? 200 : 400,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: '예약 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
