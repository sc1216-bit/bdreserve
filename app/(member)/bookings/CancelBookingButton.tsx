'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  bookingId: number
  canCancel: boolean
}

type CancelResponse = {
  ok: boolean
  message: string
}

export default function CancelBookingButton({ bookingId, canCancel }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleCancel = async () => {
    if (!canCancel) {
      setIsError(true)
      setMessage('취소 가능 시간이 지났습니다. 관리자에게 문의해주세요.')
      return
    }

    const confirmed = window.confirm('정말 이 예약을 취소하시겠습니까?')
    if (!confirmed) return

    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })

      const data: CancelResponse = await res.json()

      if (!data.ok) {
        setIsError(true)
        setMessage(data.message || '예약 취소에 실패했습니다.')
        return
      }

      setIsError(false)
      setMessage(data.message)
      router.refresh()
    } catch {
      setIsError(true)
      setMessage('예약 취소 요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-900">예약 관리</p>

      <button
        type="button"
        onClick={handleCancel}
        disabled={loading || !canCancel}
        className="inline-flex w-full justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loading ? '취소 처리 중...' : '예약 취소'}
      </button>

      <p className="text-xs text-gray-600">
        취소 가능 시간 안에서만 회원이 직접 취소할 수 있습니다.
      </p>

      {message ? (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>{message}</p>
      ) : null}
    </div>
  )
}
