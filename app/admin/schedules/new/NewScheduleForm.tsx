'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewScheduleForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    scheduleDate: '',
    startTime: '',
    endTime: '',
    capacity: '6',
    minLevelPriority: '1',
    locationName: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/admin/schedules/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!data.ok) {
        setIsError(true)
        setMessage(data.message || '일정 등록에 실패했습니다.')
        return
      }

      setIsError(false)
      setMessage('일정이 등록되었습니다.')
      router.push('/admin/schedules')
      router.refresh()
    } catch {
      setIsError(true)
      setMessage('일정 등록 요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-gray-700">일정명</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="예: 초급 그룹 레슨"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-gray-700">설명</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="일정 설명을 입력하세요."
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">일정 날짜</label>
        <input
          type="date"
          name="scheduleDate"
          value={form.scheduleDate}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">장소</label>
        <input
          name="locationName"
          value={form.locationName}
          onChange={handleChange}
          placeholder="예: 실내 마장 A"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">시작 시간</label>
        <input
          type="time"
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">종료 시간</label>
        <input
          type="time"
          name="endTime"
          value={form.endTime}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">정원</label>
        <input
          type="number"
          min="1"
          name="capacity"
          value={form.capacity}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">최소 레벨</label>
        <select
          name="minLevelPriority"
          value={form.minLevelPriority}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
        >
          <option value="1">초급 이상 (1)</option>
          <option value="2">중급 이상 (2)</option>
          <option value="3">고급 이상 (3)</option>
        </select>
      </div>

      <div className="md:col-span-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
        회원 직접 취소 마감 시각은 저장 시 자동 계산됩니다. 정책: 일정 시작일 기준 2일 전 18:00
      </div>

      <div className="md:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? '저장 중...' : '일정 등록'}
        </button>
      </div>

      {message ? (
        <div className={`md:col-span-2 text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>
          {message}
        </div>
      ) : null}
    </form>
  )
}
