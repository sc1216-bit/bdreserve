import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/common/LogoutButton'

export default async function AdminLayout({
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
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'ADMIN') {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">관리자 페이지</p>
          <h1 className="mt-1 text-2xl font-bold text-red-700">접근 권한이 없습니다</h1>
          <p className="mt-3 text-sm text-red-700">
            현재 로그인한 계정은 관리자 권한이 아닙니다. profiles 테이블에서 role을 ADMIN으로 바꾼 뒤 다시 접속하세요.
          </p>
          <Link
            href="/schedules"
            className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            회원 일정으로 이동
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">관리자 모드</p>
            <h1 className="text-xl font-bold text-gray-900">
              승마장 관리자{profile?.name ? ` · ${profile.name}` : ''}
            </h1>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link href="/admin/schedules" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800">
              일정 목록
            </Link>
            <Link href="/admin/schedules/new" className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
              일정 등록
            </Link>
            <Link href="/schedules" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800">
              회원 화면
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  )
}
