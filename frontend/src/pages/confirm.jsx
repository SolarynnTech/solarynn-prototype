import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export default function ConfirmPage() {
  const router = useRouter()
  const supabase = createPagesBrowserClient()

  useEffect(() => {
    if (!router.isReady) return

    const { access_token, refresh_token } = router.query
    if (!access_token || !refresh_token) return

    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) console.error('Error confirming email:', error)
        else router.replace('/onboarding/start')
      })
  }, [
    router.isReady,
    router.query.access_token,
    router.query.refresh_token,
  ])

  return (
    <div className="text-center pt-20">
      <h2>Confirming your email...</h2>
    </div>
  )
}