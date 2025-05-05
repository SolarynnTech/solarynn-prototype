import { useEffect } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function ConfirmPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  console.log("HEY", 'data')
  useEffect(() => {
    const confirmEmail = async () => {
      console.log(router.isReady, "router.isReady")
      if (!router.isReady) return
      const { query } = router;
      console.log(query?.access_token, "query?.access_token")
      if (query?.access_token) {
        console.log(data, 'data')
        const { data, error } =
          await supabase.auth.setSession({ access_token: query.access_token, refresh_token: query.refresh_token, });

        if (!error) {
          router.replace("/onboarding/start");
        } else {
          console.error("Error confirming email:", error);
        }
      }
    };
    confirmEmail();
  }, [router.isReady, router, router.query.access_token]);
  return (
    <div className="text-center pt-20">
      <h2>Confirming your email...</h2>
    </div>
  );
}