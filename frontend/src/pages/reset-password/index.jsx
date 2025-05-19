import React, { useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import LabeledInput from "@/components/forms/LabeledInput";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link.js";

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
    <form className={"flex flex-col items-center justify-between grow"} onSubmit={handleReset}>

      <img src={"https://fyyvtuovzbvsldghtbhd.supabase.co/storage/v1/object/public/system/solaryn.png"} className={"justify-self-start self-start w-32 block mx-auto"} alt={"Solaryn"} />

      <div className={"w-full"}>
        <svg className={"mx-auto mb-8"} xmlns="http://www.w3.org/2000/svg" width="81" height="80" viewBox="0 0 81 80" fill="none">
          <rect x="0.5" width="80" height="80" rx="40" fill="#EEF2FF"/>
          <path d="M37.8334 44H32.5C31.0855 44 29.729 44.5619 28.7288 45.5621C27.7286 46.5623 27.1667 47.9188 27.1667 49.3333V52" stroke="#615FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M36.5 38.6667C39.4455 38.6667 41.8334 36.2789 41.8334 33.3333C41.8334 30.3878 39.4455 28 36.5 28C33.5545 28 31.1667 30.3878 31.1667 33.3333C31.1667 36.2789 33.5545 38.6667 36.5 38.6667Z" stroke="#615FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M42.9 50.5333C43.5716 51.4288 44.508 52.0903 45.5764 52.4241C46.6449 52.7578 47.7913 52.747 48.8532 52.393C49.9151 52.039 50.8388 51.3599 51.4933 50.4518C52.1478 49.5437 52.5 48.4527 52.5 47.3333C52.5 46.0603 51.9943 44.8394 51.0941 43.9392C50.1939 43.0391 48.973 42.5333 47.7 42.5333C46.2813 42.5333 44.9906 43.1093 44.0626 44.0373L41.8333 46.2667" stroke="#615FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M41.8333 42V46.2667H46.1" stroke="#615FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <h1 className={"text-center mb-4"}>Reset Password</h1>

        <LabeledInput
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Your Email"
          label="Your Email"
          required
        />
      </div>

      <div>
        <PrimaryBtn type="submit" title="Send Reset Link" classes="w-full block mt-6" />

        {message && <p className="text-green-700 mt-4 text-center">{message}</p>}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        <div className="text-center mt-6">
          <Link className={"text-indigo-500 no-underline"} href={"/login"}>Back to Login</Link>
        </div>
      </div>
    </form>
  );
}
