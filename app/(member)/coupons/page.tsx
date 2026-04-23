import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const formatKST = (value: string) =>
  new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

export default async function MyCouponsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: coupons, error: couponsError } = await supabase
    .from('coupons')
    .select('id, name, total_count, remaining_count, valid_from, valid_until, status, created_at')
    .eq('user_id', user.id)
    .order('id', { ascending: false })

  const { data: transactions, error: txError } = await supabase
    .from('coupon_transactions')
    .select('id, coupon_id, booking_id, type, amount, reason, created_at')
    .eq('user_id', user.id)
    .order('id', { ascending: false })
    .limit(20)

  const totalRemaining = coupons?.reduce((sum, coupon) => sum + (coupon.remaining_count ?? 0), 0) ?? 0
  const totalCount = coupons?.reduce((sum, coupon) => sum + (coupon.total_count ?? 0), 0) ?? 0

  return (
    <main className="space-y-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">회원 메뉴</p>
          <h1 className="text-2xl font-bold text-gray-900">내 쿠폰</h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/schedules"
            className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800"
          >
            일정 보기
          </Link>
          <Link
            href="/bookings"
            className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            내 예약 보기
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">보유 쿠폰 수</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{coupons?.length ?? 0}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">총 횟수</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">남은 횟수</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalRemaining}</p>
        </div>
      </div>

      {couponsError ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          쿠폰 정보를 불러오는 중 오류가 발생했습니다.
        </div>
      ) : null}

      {!couponsError && (!coupons || coupons.length === 0) ? (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">보유한 쿠폰이 없습니다.</p>
          <p className="mt-2 text-sm text-gray-600">
            관리자에게 쿠폰 지급을 요청하거나 관리자 화면에서 테스트 쿠폰을 추가하세요.
          </p>
        </div>
      ) : null}

      {!!coupons?.length && (
        <section className="mb-8 space-y-4">
          <div>
            <p className="text-sm text-gray-500">보유 쿠폰</p>
            <h2 className="text-xl font-bold text-gray-900">쿠폰 목록</h2>
          </div>

          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">쿠폰 ID #{coupon.id}</p>
                      <h3 className="text-xl font-semibold text-gray-900">{coupon.name}</h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-sm text-gray-500">총 횟수</p>
                        <p className="mt-1 font-medium text-gray-900">{coupon.total_count}</p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-sm text-gray-500">남은 횟수</p>
                        <p className="mt-1 font-medium text-gray-900">{coupon.remaining_count}</p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-sm text-gray-500">유효 시작일</p>
                        <p className="mt-1 font-medium text-gray-900">{coupon.valid_from ?? '-'}</p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-sm text-gray-500">유효 종료일</p>
                        <p className="mt-1 font-medium text-gray-900">{coupon.valid_until ?? '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">상태</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{coupon.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">쿠폰 사용 이력</p>
          <h2 className="text-xl font-bold text-gray-900">최근 변동 내역</h2>
        </div>

        {txError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            쿠폰 이력을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : null}

        {!txError && (!transactions || transactions.length === 0) ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">쿠폰 변동 이력이 없습니다.</p>
          </div>
        ) : null}

        {!!transactions?.length && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">유형</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">변동</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">사유</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">예약 ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">생성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{tx.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{tx.type}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${tx.amount > 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{tx.reason ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{tx.booking_id ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatKST(tx.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
