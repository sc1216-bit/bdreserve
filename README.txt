적용 순서
1) Supabase SQL Editor에서 SQL_cancel_booking_by_admin_hotfix.sql 실행
2) app/api/admin/bookings/cancel/route.ts 덮어쓰기
3) npm run dev 재실행

핵심 수정
- 예전 cancel_booking_by_admin 함수 시그니처를 제거해서 호출 꼬임 방지
- 관리자 취소 시 복구/미복구를 확실히 분기
- route.ts에서 false 문자열/값이 true로 바뀌지 않도록 엄격 비교 사용

실행 후 바로 확인할 SQL
select id, remaining_count
from public.coupons
order by id desc;

select id, status, coupon_restored, cancel_reason
from public.bookings
order by id desc;

select id, type, amount, reason, booking_id
from public.coupon_transactions
order by id desc;
