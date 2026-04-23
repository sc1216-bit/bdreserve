import NewScheduleForm from './NewScheduleForm'

export default function NewAdminSchedulePage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">관리자 일정 관리</p>
        <h2 className="text-2xl font-bold text-gray-900">새 일정 등록</h2>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <NewScheduleForm />
      </div>
    </main>
  )
}
