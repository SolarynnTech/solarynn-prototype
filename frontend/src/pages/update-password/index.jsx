import React, { useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import LabeledInput from "@/components/forms/LabeledInput";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function UpdatePassword() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setMessage("");
    } else {
      setMessage("Password updated successfully. Redirecting to login...");
      setError("");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div>
      <RootNavigation title="Update Password" />

      <div className="pt-12">
        <div className="mb-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6aa16236d7d2303d78c21642039e4cccc56b6ef3?placeholderIfAbsent=true"
            alt="Solaryyn Logo"
          />
        </div>
      </div>

      <form onSubmit={handleUpdate}>
        <LabeledInput
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Your New Password"
          label="New Password"
          required
        />

        <PrimaryBtn type="submit" title="Update Password" classes="w-full block mt-6" />

        {message && <p className="text-green-700 mt-4 text-center">{message}</p>}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      </form>
    </div>
  );
}
