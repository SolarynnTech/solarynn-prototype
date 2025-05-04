import { useRouter } from "next/router";
import { useEffect } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function ConfirmPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();

  useEffect(() => {
    const confirmEmail = async () => {
      const { query } = router;
      if (query?.access_token) {
        // Store session manually
        const { data, error } = await supabase.auth.setSession({
          access_token: query.access_token,
          refresh_token: query.refresh_token,
        });

        if (!error) {
          router.replace("/onboarding/start");
        } else {
          console.error("Error confirming email:", error);
        }
      }
    };

    confirmEmail();
  }, [router]);

  return (
    <div className="text-center pt-20">
      <h2>Confirming your email...</h2>
    </div>
  );
}