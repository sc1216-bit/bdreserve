import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import CancelBookingButton from './CancelBookingButton'

const formatKST = (value: string) =>
  new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

const bookingStatusLabel = (status: string) => {
  switch (status) {
    case 'BOOKED':
      return '예약 완료'
    case 'CANCELLED_BY_MEMBER':
      return '회원 취소'
    case 'CANCELLED_BY_ADMIN':
      return '운영 취소'
    default:
      return status
  }
}

export default async function MyBookingsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      booked_at,
      cancelled_at,
      cancel_reason,
      coupon_restored,
      schedules (
        id,
        title,
        schedule_date,
        start_at,
        end_at,
        status,
        member_cancel_deadline_at,
        location_name
      )
    `)
    .eq('user_id', user.id)
    .order('booked_at', { ascending: false })

  return (
    <main className="space-y-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">회원 메뉴</p>
          <h1 className="text-2xl font-bold text-gray-900">내 예약</h1>
        </div>
        <Link
          href="/schedules"
          className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          일정 보러 가기
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          예약 정보를 불러오는 중 오류가 발생했습니다.
        </div>
      ) : null}

      {!error && (!bookings || bookings.length === 0) ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">예약 내역이 없습니다.</p>
          <p className="mt-2 text-sm text-gray-600">
            아직 예약한 일정이 없습니다. 일정 목록에서 예약을 진행해보세요.
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {bookings?.map((booking: any) => {
          const schedule = booking.schedules
          const cancelDeadline = schedule?.member_cancel_deadline_at
            ? new Date(schedule.member_cancel_deadline_at)
            : null
          const now = new Date()
          const canCancel =
            booking.status === 'BOOKED' && cancelDeadline && now < cancelDeadline

          return (
            <div
              key={booking.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">예약 번호 #{booking.id}</p>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {schedule?.title ?? '일정 정보 없음'}
                    </h2>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-sm text-gray-500">일정 날짜</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {schedule?.schedule_date ?? '-'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-sm text-gray-500">시간</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {schedule?.start_at ? formatKST(schedule.start_at) : '-'} ~{' '}
                        {schedule?.end_at ? formatKST(schedule.end_at) : '-'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-sm text-gray-500">장소</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {schedule?.location_name ?? '-'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-sm text-gray-500">예약 상태</p>
                      <p className="mt-1 font-medium text-gray-900">{bookingStatusLabel(booking.status)}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 md:col-span-2">
                      <p className="text-sm text-gray-500">회원 직접 취소 마감</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {cancelDeadline ? formatKST(cancelDeadline.toISOString()) : '-'}
                      </p>
                      {booking.status === 'BOOKED' ? (
                        canCancel ? (
                          <p className="mt-2 text-sm text-green-700">
                            지금 취소하면 쿠폰이 복구됩니다.
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-red-600">
                            취소 가능 시간이 지났습니다. 관리자에게 문의해주세요.
                          </p>
                        )
                      ) : null}
                    </div>
                  </div>

                  {booking.status !== 'BOOKED' ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                      <p>취소 사유: {booking.cancel_reason ?? '-'}</p>
                      <p className="mt-1">
                        쿠폰 복구 여부: {booking.coupon_restored ? '복구됨' : '복구 안 됨'}
                      </p>
                      {booking.cancelled_at ? (
                        <p className="mt-1">
                          취소 시각: {formatKST(booking.cancelled_at)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="min-w-[220px]">
                  <CancelBookingButton bookingId={booking.id} canCancel={Boolean(canCancel)} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
