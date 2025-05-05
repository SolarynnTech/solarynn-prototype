import { useEffect } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function ConfirmPage() {
  const router = useRouter()
  const supabase = createPagesBrowserClient()
  const { routerReady, query } = { routerReady: router.isReady, query: router.query }

  useEffect(() => {
    if (!routerReady) return
    const { token_hash, email, next } = query
    if (!token_hash || !email) return

    supabase.auth
      .verifyOtp({ type: 'email', token: token_hash, email })
      .then(({ data, error }) => {
        if (error) console.error('OTP verify failed:', error)
        else router.replace(next || '/')
      })
  }, [routerReady, query.token_hash, query.email, query.next])

  return (
    <div className="text-center pt-20">
      <h2>Confirming your email...</h2>
    </div>
  )
}