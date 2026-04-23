import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import CancelScheduleButton from './CancelScheduleButton'

export default async function AdminSchedulesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: schedules, error } = await supabase
    .from('schedules')
    .select('id, title, schedule_date, start_at, end_at, capacity, reserved_count, min_level_priority, status, location_name, cancel_reason')
    .order('start_at', { ascending: true })

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">관리자 일정 관리</p>
          <h2 className="text-2xl font-bold text-gray-900">일정 목록</h2>
        </div>
        <Link
          href="/admin/schedules/new"
          className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          새 일정 등록
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          일정 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      ) : null}

      {!error && (!schedules || schedules.length === 0) ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">등록된 일정이 없습니다.</p>
          <p className="mt-2 text-sm text-gray-600">새 일정 등록 버튼을 눌러 테스트 일정을 만들어보세요.</p>
        </div>
      ) : null}

      <div className="space-y-4">
        {schedules?.map((schedule) => {
          const availableCount = Math.max(0, schedule.capacity - schedule.reserved_count)
          const isCancelled = schedule.status === 'CANCELLED'

          return (
            <div
              key={schedule.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">일정 ID #{schedule.id}</p>
                    <h3 className="text-xl font-semibold text-gray-900">{schedule.title}</h3>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-sm text-gray-500">일정 날짜</p>
                      <p className="mt-1 font-medium text-gray-900">{schedule.schedule_date}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-sm text-gray-500">시간</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {new Date(schedule.start_at).toLocaleString('ko-KR')} ~ {new Date(schedule.end_at).toLocaleString('ko-KR')}
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
                  </div>
                </div>

                <div className="min-w-[280px] space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">운영 액션</p>

                  <Link
                    href={`/admin/schedules/${schedule.id}`}
                    className="inline-flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900"
                  >
                    예약자 목록 / 상세 보기
                  </Link>

                  <p className="text-sm text-gray-600">
                    우천, 기상 악화, 강사 부재, 시설 점검 등으로 일정 전체를 취소할 수 있습니다.
                  </p>

                  <CancelScheduleButton scheduleId={schedule.id} disabled={isCancelled} />

                  <p className="text-xs text-gray-500">
                    일정 전체 취소 시 관련 BOOKED 예약은 모두 관리자 취소 처리되고 쿠폰이 복구됩니다.
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
