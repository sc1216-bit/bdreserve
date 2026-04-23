import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/common/LogoutButton'

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">회원 모드</p>
            <h1 className="text-xl font-bold text-gray-900">
              안녕하세요{profile?.name ? `, ${profile.name}님` : ''}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/schedules"
              className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800"
            >
              일정 보기
            </Link>
            <Link
              href="/bookings"
              className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800"
            >
              내 예약
            </Link>
            <Link
              href="/coupons"
              className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800"
            >
              내 쿠폰
            </Link>
            {profile?.role === 'ADMIN' ? (
              <Link
                href="/admin/schedules"
                className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                관리자
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  )
}
