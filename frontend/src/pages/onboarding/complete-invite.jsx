import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PrimaryBtn from "@/components/buttons/PrimaryBtn.jsx";
import LabeledInput from "@/components/forms/LabeledInput.jsx";

export default function CompleteInvite() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const ghostId = router.query.ghostId;

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  // Step 1: Restore session from URL fragment
  useEffect(() => {
    const tryRestoreSession = async () => {
      const hash = window.location.hash.substring(1); // Strip #
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          console.error("Failed to restore session:", error.message);
          setError("Session restore failed. Please try again.");
          return;
        }
        setSessionReady(true);
      } else {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setSessionReady(true);
        }
      }
    };

    if (router.isReady) tryRestoreSession();
  }, [router.isReady]);

  // Step 2: Handle finalization
  const handleComplete = async () => {
    setSubmitting(true);
    setError("");

    if (!sessionReady) {
      setError("Session not ready. Please wait a moment...");
      setSubmitting(false);
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
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

    const { count } = await supabase
      .from("ghost_users")
      .select("*", { count: "exact", head: true })
      .eq("id", ghostId)
      .eq("used", false);
    console.log("Matching ghost rows:", count);

    // 2. Fetch ghost user
    const { data: ghost, error: ghostError } = await supabase
      .from("ghost_users")
      .select("*")
      .eq("id", ghostId)
      .eq("used", false)
      .maybeSingle();

    if (ghostError || !ghost) {
      setError("Invalid or already used invite.");
      setSubmitting(false);
      return;
    }

    // 3. Update ghost_users
    await supabase
      .from("ghost_users")
      .update({ user_id: userId, used: true })
      .eq("id", ghostId);

    // 4. Insert into users
    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      email: ghost.email || userEmail || "",
      name: ghost.name || "",
      profile_img: ghost.profile_img || null,
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
    <div className="w-full max-w-md mx-auto mt-12">
      <h2 className="text-xl font-semibold mb-4 text-center">Set Your Password</h2>
      <p className="text-sm text-gray-600 mb-6 text-center">
        To complete your invitation, set a secure password for your account.
      </p>

      <LabeledInput
        label="Create Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={submitting}
      />

      <PrimaryBtn
        title={submitting ? "Finalizing..." : "Complete Invite"}
        onClick={handleComplete}
        disabled={submitting || !password}
      />

      {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
    </div>
  );
}