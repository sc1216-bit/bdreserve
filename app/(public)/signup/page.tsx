'use client'

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

export default function SignupPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setErrorMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('회원가입이 완료되었습니다. 이메일 인증 설정이 켜져 있다면 메일을 확인해주세요.')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">회원가입</h1>
          <p className="mt-2 text-sm text-slate-500">기본 회원 계정을 만듭니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              placeholder="홍길동"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">전화번호</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              placeholder="010-1234-5678"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              placeholder="8자 이상 권장"
              required
            />
          </div>

          {message ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          이미 계정이 있나요?{' '}
          <Link href="/login" className="font-medium text-slate-900 underline underline-offset-2">
            로그인
          </Link>
        </p>
      </div>
    </main>
  )
}
