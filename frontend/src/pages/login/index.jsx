import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import LabeledInput from "@/components/forms/LabeledInput";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";
import Link from "next/link.js";

export default function Login() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [error, setError] = useState("");
  const { user } = useUserStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { session, isLoading } = useSessionContext();

  useEffect(() => {
    if (!isLoading && session?.user) {
      if (user?.domain && user?.role && user?.subdivision) {
        router.push("/home");
      } else {
        router.push("/onboarding/start");
      }
    }
  }, [session, isLoading, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await fetch(
  //       `${"https://solaryn.onrender.com/"}/api/auth/login`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(formData),
  //       }
  //     );
  //
  //     const data = await response.json();
  //
  //     if (data.token) {
  //       localStorage.setItem("token", data.token);
  //       router.push("/home");
  //     } else {
  //       console.error("Login failed:", data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error during login:", error);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      setError(error.message);
      return;
    }

    router.push("/home");
  };

  return (
      <form className={"flex flex-col items-center justify-between grow"} onSubmit={handleSubmit}>

        <img src={"https://fyyvtuovzbvsldghtbhd.supabase.co/storage/v1/object/public/system/solaryn.png"} className={"justify-self-start self-start w-32 block mx-auto"} alt={"Solaryn"} />

        <div className={"w-full"}>
          <svg className={"mx-auto mb-8"} xmlns="http://www.w3.org/2000/svg" width="81" height="80" viewBox="0 0 81 80" fill="none">
            <rect x="0.5" width="80" height="80" rx="40" fill="#EEF2FF"/>
            <path d="M49.8333 52V49.3333C49.8333 47.9188 49.2714 46.5623 48.2712 45.5621C47.271 44.5619 45.9144 44 44.5 44H36.5C35.0855 44 33.7289 44.5619 32.7287 45.5621C31.7285 46.5623 31.1666 47.9188 31.1666 49.3333V52" stroke="#615FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M40.5 38.6667C43.4455 38.6667 45.8333 36.2789 45.8333 33.3333C45.8333 30.3878 43.4455 28 40.5 28C37.5544 28 35.1666 30.3878 35.1666 33.3333C35.1666 36.2789 37.5544 38.6667 40.5 38.6667Z" stroke="#615FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          <h1 className={"text-center mb-4"}>Login</h1>

          <LabeledInput
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter Your Email"
            label="Your Email"
            required
          />

          <LabeledInput
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter Your Password"
            label="Password"
            required
          />

          <div className="text-right">
            <Link className={"text-indigo-500 no-underline"} href={"/reset-password"}>Forgot password?</Link>
          </div>
        </div>

        <div>
          <PrimaryBtn type={"submit"} title={"Login"} classes={"w-full block mb-4 mt-9"} />

          <div className="text-gray-600 text-center mt-4">
            New user?{" "}
            <Link className={"text-indigo-500 no-underline"} href={"/create-account"}>Create an Account</Link>
          </div>

          {error && <div style={{ color: "red", textAlign: "center", margin: "10px 0" }}>{error}</div>}
        </div>
      </form>

  );
}
