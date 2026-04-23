import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const formatKST = (value: string) =>
  new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

const scheduleStatusLabel = (status: string) => {
  switch (status) {
    case 'OPEN':
      return '예약 가능'
    case 'CLOSED':
      return '마감'
    case 'CANCELLED':
      return '운영 취소'
    default:
      return status
  }
}

const levelLabel = (priority: number) => {
  switch (priority) {
    case 1:
      return '초급 이상'
    case 2:
      return '중급 이상'
    case 3:
      return '고급 이상'
    default:
      return `레벨 ${priority} 이상`
  }
}

export default async function MemberSchedulesPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: schedules, error } = await supabase
    .from('schedules')
    .select(`
      id,
      title,
      description,
      schedule_date,
      start_at,
      end_at,
      capacity,
      reserved_count,
      min_level_priority,
      status,
      member_cancel_deadline_at,
      location_name
    `)
    .order('start_at', { ascending: true })

  return (
    <main className="space-y-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">회원 메뉴</p>
          <h1 className="text-2xl font-bold text-gray-900">예약 가능한 일정</h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/bookings"
            className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800"
          >
            내 예약 보기
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          일정 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      ) : null}

      {!error && (!schedules || schedules.length === 0) ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">등록된 일정이 없습니다.</p>
          <p className="mt-2 text-sm text-gray-600">
            관리자가 예약 가능한 일정을 아직 등록하지 않았습니다.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4">
        {schedules?.map((schedule) => {
          const availableCount = Math.max(0, schedule.capacity - schedule.reserved_count)

          return (
            <Link
              key={schedule.id}
              href={`/schedules/${schedule.id}`}
              className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">일정 ID #{schedule.id}</p>
                    <h2 className="text-xl font-semibold text-gray-900">{schedule.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {schedule.description || '등록된 설명이 없습니다.'}
                    </p>
                  </div>

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
                      <p className="text-sm text-gray-500">예약 가능 레벨</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {levelLabel(schedule.min_level_priority)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 md:col-span-2">
                      <p className="text-sm text-gray-500">장소 / 상태</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {schedule.location_name || '-'} · {scheduleStatusLabel(schedule.status)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-[180px]">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-900">상세 보기</p>
                    <p className="mt-2 text-sm text-gray-600">
                      클릭하면 일정 상세와 예약 화면으로 이동합니다.
                    </p>
                    <div className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
                      일정 상세 보기
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
