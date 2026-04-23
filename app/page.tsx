import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role: string | null = null
  let name: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', user.id)
      .single()

    role = profile?.role ?? null
    name = profile?.name ?? null
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
        <p className="text-sm text-gray-500">승마장 예약 서비스</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">승마장 쿠폰식 예약 웹앱</h1>
        <p className="mt-4 text-base leading-7 text-gray-600">
          예약 서비스를 시작합니다. 회원은 쿠폰으로 예약하고, 관리자는 일정을 등록하고 운영할 수 있습니다.
        </p>

        {user ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">현재 로그인 상태</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {name ? `${name}님` : '로그인 사용자'} · {role || 'MEMBER'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/schedules"
                className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                일정 보기
              </Link>
              <Link
                href="/bookings"
                className="inline-flex rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800"
              >
                내 예약
              </Link>
              <Link
                href="/coupons"
                className="inline-flex rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800"
              >
                내 쿠폰
              </Link>
              {role === 'ADMIN' ? (
                <Link
                  href="/admin/schedules"
                  className="inline-flex rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800"
                >
                  관리자 이동
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="inline-flex rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
