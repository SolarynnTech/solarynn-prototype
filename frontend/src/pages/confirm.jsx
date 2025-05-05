import { useEffect } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function ConfirmPage() {
  const router = useRouter()
  const supabase = createPagesBrowserClient()

  useEffect(() => {
    if (!router.isReady) return

    const { token_hash, next } = router.query
    console.log(token_hash, "token_hash")
    if (!token_hash) return

    supabase.auth
      .verifyOtp({
        type: 'email',
        token: token_hash,
      })
      .then(({ data, error }) => {
        if (error) {
          console.error('OTP verification failed:', error)
        } else {
          const redirectTo = typeof next === 'string' ? next : '/onboarding/start'
          router.replace(redirectTo)
        }
      })
  }, [router.isReady, router.query.token_hash, router.query.next])

  return (
    <div className="text-center pt-20">
      <h2>Confirming your email...</h2>
    </div>
  )
}