'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  bookingId: number
  disabled?: boolean
}

type ApiResponse = {
  ok: boolean
  message: string
  booking_id?: number
}

export default function CancelBookingByAdminButton({ bookingId, disabled = false }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleCancel = async () => {
    if (disabled) {
      setIsError(true)
      setMessage('취소할 수 없는 예약입니다.')
      return
    }

    const reason = window.prompt('관리자 취소 사유를 입력해주세요.\n예: 전화 요청으로 관리자 취소')
    if (reason === null) return

    const trimmedReason = reason.trim() || '관리자 취소'
    const confirmed = window.confirm(
      `정말 이 예약을 관리자 취소하시겠습니까?\n\n사유: ${trimmedReason}`
    )
    if (!confirmed) return

    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/admin/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, reason: trimmedReason }),
      })

      const data: ApiResponse = await res.json()

      if (!data.ok) {
        setIsError(true)
        setMessage(data.message || '관리자 예약 취소에 실패했습니다.')
        return
      }

      setIsError(false)
      setMessage(data.message)
      router.refresh()
    } catch {
      setIsError(true)
      setMessage('관리자 예약 취소 요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading || disabled}
        className="inline-flex w-full justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loading ? '취소 처리 중...' : '예약 1건 관리자 취소'}
      </button>

      {message ? (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>{message}</p>
      ) : null}
    </div>
  )
}
