import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { ok: false, message: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
