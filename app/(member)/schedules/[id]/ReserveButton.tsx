'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  scheduleId: number
}

type BookingResponse = {
  ok: boolean
  message: string
  booking_id?: number
  coupon_remaining?: number
}

export default function ReserveButton({ scheduleId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleReserve = async () => {
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      })

      const data: BookingResponse = await res.json()

      if (!data.ok) {
        setIsError(true)
        setMessage(data.message || '예약에 실패했습니다.')
        return
      }

      setIsError(false)
      setMessage(
        data.coupon_remaining !== undefined
          ? `${data.message} 남은 쿠폰: ${data.coupon_remaining}회`
          : data.message
      )

      router.refresh()
    } catch {
      setIsError(true)
      setMessage('예약 요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleReserve}
        disabled={loading}
        className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loading ? '예약 처리 중...' : '예약하기'}
      </button>

      {message ? (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>{message}</p>
      ) : null}
    </div>
  )
}
