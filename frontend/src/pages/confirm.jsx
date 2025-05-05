import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs' // можно и из '@supabase/supabase-js'

export default function ConfirmPage() {
  const router = useRouter()
  const supabase = createPagesBrowserClient()

  useEffect(() => {
    if (!router.isReady) return
    const code = router.query.code
    if (!code) return

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ data, error }) => {
        if (error) {
          console.error('failed:', error)
        } else {
          router.replace('/onboarding/start')
        }
      })
  }, [router.isReady, router.query.code])

  return <h2>Confirming your email…</h2>
}