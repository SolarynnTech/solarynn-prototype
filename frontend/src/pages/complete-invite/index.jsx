import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CompleteInvite() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const ghostId = router.query.ghostId;

  const [ghost, setGhost] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGhost = async () => {
      if (!ghostId) return;
      const { data, error } = await supabase
        .from("ghost_users")
        .select("*")
        .eq("id", ghostId)
        .eq("used", false)
        .single();
      if (error) setError("Invite not found or already used");
      else setGhost(data);
    };

    fetchGhost();
  }, [ghostId]);

  const handleActivate = async () => {
    setLoading(true);
    setError("");

    const { data, error: signupError } = await supabase.auth.signUp({
      email: ghost.email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    const userId = data?.user?.id;
    if (!userId) {
      setError("User ID missing");
      return;
    }

    // Link ghost user and create real profile
    await supabase.from("ghost_users").update({
      user_id: userId,
      used: true,
    }).eq("id", ghost.id);

    await supabase.from("users").insert({
      id: userId,
      name: ghost.name,
      email: ghost.email,
      profile_img: ghost.profile_image || null,
      social_networks: ghost.social_networks || {},
      bio: ghost.bio || "",
      city: ghost.city || "",
      country: ghost.country || "",
      birthday: ghost.birthday || null,
    });

    router.push("/home");
  };

  if (!ghost) return <p>Loading invite...</p>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Welcome, {ghost.name}!</h1>
      <p>Finish setting up your account:</p>

      <input
        type="password"
        placeholder="Choose a password"
        className="border p-2 rounded w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleActivate}
        disabled={loading || !password}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Activating..." : "Activate My Account"}
      </button>

      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}