import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import CancelBookingByAdminButton from './CancelBookingByAdminButton'

type PageProps = {
  params: Promise<{ id: string }>
}

const formatKST = (value: string) =>
  new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

export default async function AdminScheduleDetailPage({ params }: PageProps) {
  const { id } = await params
  const scheduleId = Number(id)

  if (!scheduleId) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()

  const { data: schedule, error: scheduleError } = await supabase
    .from('schedules')
    .select('id, title, description, schedule_date, start_at, end_at, capacity, reserved_count, min_level_priority, status, location_name, cancel_reason')
    .eq('id', scheduleId)
    .single()

  if (scheduleError || !schedule) {
    notFound()
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      booked_at,
      cancelled_at,
      cancel_reason,
      coupon_restored,
      user_id,
      profile:profiles!bookings_user_id_fkey (
        id,
        name,
        email,
        phone
      )
    `)
    .eq('schedule_id', scheduleId)
    .order('booked_at', { ascending: true })

  const availableCount = Math.max(0, schedule.capacity - schedule.reserved_count)

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">관리자 일정 상세</p>
          <h2 className="text-2xl font-bold text-gray-900">{schedule.title}</h2>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/schedules"
            className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800"
          >
            일정 목록
          </Link>
          <Link
            href="/admin/schedules/new"
            className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            새 일정 등록
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-sm text-gray-500">일정 날짜</p>
            <p className="mt-1 font-medium text-gray-900">{schedule.schedule_date}</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-sm text-gray-500">시간</p>
            <p className="mt-1 font-medium text-gray-900">
              {formatKST(schedule.start_at)} ~ {formatKST(schedule.end_at)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-sm text-gray-500">정원 / 예약 현황</p>
            <p className="mt-1 font-medium text-gray-900">
              정원 {schedule.capacity}명 · 현재 {schedule.reserved_count}명 · 남은 자리 {availableCount}명
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-sm text-gray-500">최소 레벨</p>
            <p className="mt-1 font-medium text-gray-900">priority {schedule.min_level_priority} 이상</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 md:col-span-2">
            <p className="text-sm text-gray-500">장소 / 상태</p>
            <p className="mt-1 font-medium text-gray-900">
              {schedule.location_name || '-'} · {schedule.status}
            </p>
            {schedule.cancel_reason ? (
              <p className="mt-2 text-sm text-red-700">취소 사유: {schedule.cancel_reason}</p>
            ) : null}
          </div>

          <div className="rounded-xl bg-gray-50 p-3 md:col-span-2">
            <p className="text-sm text-gray-500">설명</p>
            <p className="mt-1 whitespace-pre-wrap text-gray-900">
              {schedule.description || '등록된 설명이 없습니다.'}
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">예약자 현황</p>
          <h3 className="text-xl font-bold text-gray-900">예약자 목록</h3>
        </div>

        {bookingsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            예약자 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : null}

        {!bookingsError && (!bookings || bookings.length === 0) ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">예약자가 없습니다.</p>
          </div>
        ) : null}

        <div className="space-y-4">
          {bookings?.map((booking: any) => {
            const profile = booking.profile
            const canAdminCancel = booking.status === 'BOOKED' && schedule.status !== 'CANCELLED'

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">예약 ID #{booking.id}</p>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {profile?.name || '이름 없음'}
                      </h4>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-sm text-gray-500">이메일</p>
                        <p className="mt-1 font-medium text-gray-900">{profile?.email || '-'}</p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-sm text-gray-500">전화번호</p>
                        <p className="mt-1 font-medium text-gray-900">{profile?.phone || '-'}</p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-sm text-gray-500">예약 상태</p>
                        <p className="mt-1 font-medium text-gray-900">{booking.status}</p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-sm text-gray-500">예약 시각</p>
                        <p className="mt-1 font-medium text-gray-900">
                          {booking.booked_at ? formatKST(booking.booked_at) : '-'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3 md:col-span-2">
                        <p className="text-sm text-gray-500">취소 정보</p>
                        <p className="mt-1 text-gray-900">
                          사유: {booking.cancel_reason || '-'} / 쿠폰 복구: {booking.coupon_restored ? '복구됨' : '미복구'}
                        </p>
                        {booking.cancelled_at ? (
                          <p className="mt-1 text-sm text-gray-600">
                            취소 시각: {formatKST(booking.cancelled_at)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[260px] space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-900">운영 액션</p>
                    <p className="text-sm text-gray-600">
                      회원 취소 기한이 지난 예약도 관리자 권한으로 취소하고 쿠폰을 복구할 수 있습니다.
                    </p>
                    <CancelBookingByAdminButton bookingId={booking.id} disabled={!canAdminCancel} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
