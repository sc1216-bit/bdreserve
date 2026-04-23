-- 1) 예전 관리자 취소 함수 시그니처 제거
drop function if exists public.cancel_booking_by_admin(bigint, text);
drop function if exists public.cancel_booking_by_admin(bigint, text, boolean);

-- 2) 복구/미복구 선택형 관리자 취소 함수 재생성
create function public.cancel_booking_by_admin(
  p_booking_id bigint,
  p_reason text default '관리자 취소',
  p_restore_coupon boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_user_id uuid;
  v_booking record;
  v_schedule record;
  v_coupon record;
  v_new_remaining integer;
begin
  v_admin_user_id := auth.uid();

  if v_admin_user_id is null then
    return jsonb_build_object(
      'ok', false,
      'message', '로그인이 필요합니다.'
    );
  end if;

  if not public.is_admin() then
    return jsonb_build_object(
      'ok', false,
      'message', '관리자 권한이 필요합니다.'
    );
  end if;

  select *
  into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if v_booking is null then
    return jsonb_build_object(
      'ok', false,
      'message', '예약 정보를 찾을 수 없습니다.'
    );
  end if;

  if v_booking.status <> 'BOOKED' then
    return jsonb_build_object(
      'ok', false,
      'message', '이미 취소된 예약입니다.'
    );
  end if;

  select *
  into v_schedule
  from public.schedules
  where id = v_booking.schedule_id
  for update;

  if v_schedule is null then
    return jsonb_build_object(
      'ok', false,
      'message', '일정 정보를 찾을 수 없습니다.'
    );
  end if;

  if p_restore_coupon and v_booking.coupon_id is not null then
    update public.coupons
    set
      remaining_count = remaining_count + 1,
      status = 'ACTIVE'
    where id = v_booking.coupon_id
    returning *
    into v_coupon;

    if v_coupon is null then
      return jsonb_build_object(
        'ok', false,
        'message', '쿠폰 복구 대상 정보를 찾을 수 없습니다.'
      );
    end if;

    v_new_remaining := v_coupon.remaining_count;

    insert into public.coupon_transactions (
      coupon_id,
      user_id,
      booking_id,
      type,
      amount,
      reason,
      created_by
    )
    values (
      v_coupon.id,
      v_booking.user_id,
      v_booking.id,
      'RESTORE',
      1,
      '관리자 취소 복구',
      v_admin_user_id
    );
  end if;

  update public.bookings
  set
    status = 'CANCELLED_BY_ADMIN',
    cancelled_at = now(),
    cancel_reason = coalesce(p_reason, '관리자 취소'),
    cancelled_by = v_admin_user_id,
    coupon_restored = case
      when p_restore_coupon and v_booking.coupon_id is not null then true
      else false
    end
  where id = p_booking_id;

  update public.schedules
  set reserved_count = greatest(reserved_count - 1, 0)
  where id = v_schedule.id;

  insert into public.audit_logs (
    actor_user_id,
    target_type,
    target_id,
    action,
    before_data,
    after_data
  )
  values (
    v_admin_user_id,
    'BOOKING',
    v_booking.id::text,
    'CANCEL_BOOKING_BY_ADMIN',
    jsonb_build_object(
      'status', v_booking.status,
      'schedule_id', v_booking.schedule_id,
      'user_id', v_booking.user_id
    ),
    jsonb_build_object(
      'status', 'CANCELLED_BY_ADMIN',
      'reason', coalesce(p_reason, '관리자 취소'),
      'coupon_restored', case when p_restore_coupon then true else false end
    )
  );

  return jsonb_build_object(
    'ok', true,
    'message', case
      when p_restore_coupon
        then '관리자 취소가 완료되었습니다. 쿠폰이 복구되었습니다.'
      else '관리자 취소가 완료되었습니다. 쿠폰은 복구되지 않았습니다.'
    end,
    'booking_id', v_booking.id,
    'coupon_restored', case when p_restore_coupon then true else false end,
    'coupon_remaining', case
      when p_restore_coupon then v_new_remaining
      else null
    end
  );

exception
  when others then
    return jsonb_build_object(
      'ok', false,
      'message', '관리자 예약 취소 처리 중 오류가 발생했습니다.'
    );
end;
$$;

revoke all on function public.cancel_booking_by_admin(bigint, text, boolean) from public;
grant execute on function public.cancel_booking_by_admin(bigint, text, boolean) to authenticated;
