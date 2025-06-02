import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CompleteInvite() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const ghostId = router.query.ghostId;

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const exchangeCode = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession();
        if (exchangeError) {
          console.error("Session error:", exchangeError.message);
          router.push("/login");
        }
      }
    };

    if (router.isReady) {
      exchangeCode();
    }
  }, [router.isReady]);

  const handleComplete = async () => {
    setSubmitting(true);
    setError("");

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.auth.getSession();

    const userId = sessionData?.session?.user?.id;
    const userEmail = sessionData?.session?.user?.email;

    if (!userId || !ghostId) {
      setError("Missing session or ghost ID.");
      setSubmitting(false);
      return;
    }

    // 1. Update password
    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) {
      setError("Failed to update password: " + pwError.message);
      setSubmitting(false);
      return;
    }

    // 2. Get ghost user
    const { data: ghost, error: ghostError } = await supabase
      .from("ghost_users")
      .select("*")
      .eq("id", ghostId)
      .eq("used", false)
      .single();

    if (ghostError || !ghost) {
      setError("Invalid or already used invite.");
      setSubmitting(false);
      return;
    }

    // 3. Update ghost user
    await supabase
      .from("ghost_users")
      .update({ user_id: userId, used: true })
      .eq("id", ghostId);

    // 4. Create new user record
    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      email: ghost.email || userEmail,
      name: ghost.name,
      profile_img: ghost.profile_image || null,
      bio: ghost.bio || "",
      city: ghost.city || "",
      country: ghost.country || "",
      birthday: ghost.birthday || null,
      social_networks: ghost.social_networks || {},
      availability_status: "open_to_project",
    });

    if (insertError) {
      setError("Failed to create user: " + insertError.message);
      setSubmitting(false);
      return;
    }

    router.push("/home");
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h2 className="text-xl font-semibold mb-4 text-center">Set Your Password</h2>
      <p className="text-sm text-gray-600 mb-4 text-center">
        To complete your invitation, set a secure password for your account.
      </p>

      <input
        type="password"
        placeholder="Create Password"
        className="w-full border border-gray-300 px-4 py-2 rounded mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleComplete}
        disabled={submitting || !password}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Finalizing..." : "Complete Invite"}
      </button>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
}