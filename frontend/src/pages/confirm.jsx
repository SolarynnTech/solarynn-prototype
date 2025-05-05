import { useEffect } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function ConfirmPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  console.log("HEY", 'data')
  useEffect(() => {
    const confirmEmail = async () => {
      if (!router.isReady) return
      supabase.auth
        .getSessionFromUrl({ storeSession: true })
        .then(({ error }) => {
          if (error) console.error(error)
          else router.replace('/onboarding/start')
        })
    };
    confirmEmail();
  }, [router.isReady]);
  return (
    <div className="text-center pt-20">
      <h2>Confirming your email...</h2>
    </div>
  );
}