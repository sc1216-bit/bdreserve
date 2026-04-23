import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const bookingId = Number(body.bookingId)

    if (!bookingId) {
      return NextResponse.json(
        { ok: false, message: 'bookingId가 필요합니다.' },
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

    const { data, error } = await supabase.rpc('cancel_booking_by_member', {
      p_booking_id: bookingId,
    })

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message || '취소 처리 중 오류가 발생했습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(data, {
      status: data?.ok ? 200 : 400,
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: '취소 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
