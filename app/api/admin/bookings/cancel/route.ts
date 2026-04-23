import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const bookingId = Number(body.bookingId)
    const reason = String(body.reason || '').trim() || '관리자 취소'
    const restoreCoupon = body.restoreCoupon === true

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

    const { data, error } = await supabase.rpc('cancel_booking_by_admin', {
      p_booking_id: bookingId,
      p_reason: reason,
      p_restore_coupon: restoreCoupon,
    })

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message || '관리자 예약 취소 중 오류가 발생했습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(data, {
      status: data?.ok ? 200 : 400,
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: '관리자 예약 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
