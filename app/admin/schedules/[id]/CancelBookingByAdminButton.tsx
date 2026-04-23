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
  const [loadingType, setLoadingType] = useState<'restore' | 'no_restore' | null>(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleCancel = async (restoreCoupon: boolean) => {
    if (disabled) {
      setIsError(true)
      setMessage('취소할 수 없는 예약입니다.')
      return
    }

    const reason = window.prompt(
      restoreCoupon
        ? '관리자 취소 사유를 입력해주세요.\n예: 승마장 사정으로 관리자 취소'
        : '관리자 취소 사유를 입력해주세요.\n예: 당일 취소로 쿠폰 미복구 처리'
    )
    if (reason === null) return

    const trimmedReason = reason.trim() || '관리자 취소'
    const modeLabel = restoreCoupon ? '쿠폰 복구' : '쿠폰 미복구'
    const confirmed = window.confirm(
      `정말 이 예약을 관리자 취소하시겠습니까?\n\n처리 방식: ${modeLabel}\n사유: ${trimmedReason}`
    )
    if (!confirmed) return

    setLoadingType(restoreCoupon ? 'restore' : 'no_restore')
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/admin/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          reason: trimmedReason,
          restoreCoupon,
        }),
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
      setLoadingType(null)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handleCancel(true)}
        disabled={loadingType !== null || disabled}
        className="inline-flex w-full justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loadingType === 'restore' ? '처리 중...' : '복구하고 취소'}
      </button>

      <button
        type="button"
        onClick={() => handleCancel(false)}
        disabled={loadingType !== null || disabled}
        className="inline-flex w-full justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loadingType === 'no_restore' ? '처리 중...' : '미복구로 취소'}
      </button>

      <p className="text-xs text-gray-600">
        운영 상황에 따라 쿠폰 복구 여부를 선택해서 취소할 수 있습니다.
      </p>

      {message ? (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>{message}</p>
      ) : null}
    </div>
  )
}
