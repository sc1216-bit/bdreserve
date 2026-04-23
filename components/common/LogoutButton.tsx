'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  variant?: 'light' | 'dark'
}

export default function LogoutButton({ variant = 'light' }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!res.ok) {
        alert('로그아웃 처리 중 오류가 발생했습니다.')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      alert('로그아웃 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const className =
    variant === 'dark'
      ? 'inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400'
      : 'inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 disabled:cursor-not-allowed disabled:bg-gray-100'

  return (
    <button type="button" onClick={handleLogout} disabled={loading} className={className}>
      {loading ? '로그아웃 중...' : '로그아웃'}
    </button>
  )
}
