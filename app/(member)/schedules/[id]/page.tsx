import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ReserveButton from './ReserveButton'

type PageProps = {
  params: Promise<{ id: string }>
}

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

export default async function ScheduleDetailPage({ params }: PageProps) {
  const { id } = await params
  const scheduleId = Number(id)

  if (!scheduleId) {
    redirect('/schedules')
  }

  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: schedule, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('id', scheduleId)
    .single()

  if (error || !schedule) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-semibold text-red-700">일정을 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-red-600">
            존재하지 않거나 조회할 수 없는 일정입니다.
          </p>
          <Link
            href="/schedules"
            className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            일정 목록으로 돌아가기
          </Link>
        </div>
      </main>
    )
  }

  const availableCount = Math.max(0, schedule.capacity - schedule.reserved_count)

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <Link href="/schedules" className="text-sm text-gray-600 hover:text-black">
          ← 일정 목록으로
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">승마 일정 상세</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{schedule.title}</h1>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {scheduleStatusLabel(schedule.status)}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">일정 날짜</p>
            <p className="mt-1 text-base font-medium text-gray-900">{schedule.schedule_date}</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">시간</p>
            <p className="mt-1 text-base font-medium text-gray-900">
              {formatKST(schedule.start_at)} ~ {formatKST(schedule.end_at)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">정원 / 예약 현황</p>
            <p className="mt-1 text-base font-medium text-gray-900">
              정원 {schedule.capacity}명 · 현재 {schedule.reserved_count}명 · 남은 자리 {availableCount}명
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">예약 가능 레벨</p>
            <p className="mt-1 text-base font-medium text-gray-900">
              {levelLabel(schedule.min_level_priority)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 md:col-span-2">
            <p className="text-sm text-gray-500">회원 직접 취소 마감</p>
            <p className="mt-1 text-base font-medium text-gray-900">
              {formatKST(schedule.member_cancel_deadline_at)}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              예약 시 쿠폰 1회가 차감됩니다. 회원 직접 취소는 시작일 기준 2일 전 18시 전까지만 가능합니다.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 md:col-span-2">
            <p className="text-sm text-gray-500">설명</p>
            <p className="mt-1 whitespace-pre-wrap text-base text-gray-900">
              {schedule.description || '등록된 설명이 없습니다.'}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <ReserveButton scheduleId={schedule.id} />
        </div>
      </div>
    </main>
  )
}
