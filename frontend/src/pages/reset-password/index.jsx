import React, { useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import LabeledInput from "@/components/forms/LabeledInput";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function ResetPassword() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
      setMessage("");
    } else {
      setError("");
      setMessage("Password reset link has been sent to your email.");
    }
  };

  return (
    <div>
      <RootNavigation title="Reset Password" />

      <div className="pt-12">
        <div className="mb-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6aa16236d7d2303d78c21642039e4cccc56b6ef3?placeholderIfAbsent=true"
            alt="Solaryyn Logo"
          />
        </div>
      </div>

      <form onSubmit={handleReset}>
        <LabeledInput
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Your Email"
          label="Your Email"
          required
        />

        <PrimaryBtn type="submit" title="Send Reset Link" classes="w-full block mt-6" />

        {message && <p className="text-green-700 mt-4 text-center">{message}</p>}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        <div className="text-center mt-6 text-indigo-500">
          <button type="button" className="underline bg-transparent border-0" onClick={() => router.push("/login")}>
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
