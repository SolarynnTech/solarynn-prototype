import { useEffect } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function ConfirmPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  console.log("HEY", 'data')
  useEffect(() => {
    if (!router.isReady) return

    const code = router.query.code
    if (!code) return
   console.log(code, 'code')
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ data, error }) => {
        console.log('exchangeCodeForSession:', { data, error })
        if (error) {
          console.error('Error exchanging auth code:', error)
        } else {
          console.log('aloha')
          router.replace('/onboarding/start')
        }
      })
  }, [router.isReady, router.query.code])
  return (
    <div className="text-center pt-20">
      <h2>Confirming your email...</h2>
    </div>
  );
}