import React, { useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "../../components/Nav/Nav";
import LabeledInput from "../../components/forms/LabeledInput";
import PrimaryBtn from "../../components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function Login() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
      return;
    }

    console.log("Signed in user:", data.user);
    router.push("/home");
  };

  return (
    <div>
      <RootNavigation title="Login" />

      <div className="pt-12">
        <div className="mb-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6aa16236d7d2303d78c21642039e4cccc56b6ef3?placeholderIfAbsent=true"
            alt="Solaryyn Logo"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <LabeledInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter Your Email"
          label="Your Email"
          required={true}
        />

        <LabeledInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter Your Password"
          label="Password"
          required={true}
        />

        <div className="text-right">
          <button
            type="button"
            className="text-green-800 border-0 p-o bg-transparent hover:underline focus:outline-none focus:ring-0"
            onClick={async () => {
              const email = prompt("Enter your email to reset password:");
              if (email) {
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) {
                  alert("Error: " + error.message);
                } else {
                  alert("Password reset link sent to your email.");
                }
              }
            }}
          >
            Forgot password?
          </button>
        </div>

        <PrimaryBtn
          type={"submit"}
          title={"Login"}
          classes={"w-full block mb-4 mt-9"}
        />

        <div className="text-green-800 text-center mt-4">
          New user?{" "}
          <button
            type="button"
            className="text-green-800 border-0 p-o bg-transparent underline focus:outline-none focus:ring-0"
            onClick={() => {
              router.push("/create-account");
            }}
          >
            Create an Account
          </button>
        </div>
      </form>
    </div>
  );
}
