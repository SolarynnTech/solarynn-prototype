import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import LabeledInput from "@/components/forms/LabeledInput";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";

const CreateAccountPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const dev = "development";

  const submitForm = React.useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    phone: "",
    confirmPhone: "",
  });

  const supabase = useSupabaseClient();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const { session, isLoading } = useSessionContext();
  const { user } = useUserStore();

  useEffect(() => {
    if (!isLoading && session?.user) {
      if (user?.domain && user?.role && user?.subdivision) {
        router.push("/home");
      } else {
        router.push("/onboarding/start");
      }
    }
  }, [session, isLoading, user]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   // Get form data
  //   const formData = new FormData(submitForm.current);
  //   const userData = {
  //     username: formData.get("email")?.split("@")[0] || "", // Generate username from email
  //     email: formData.get("email") || "",
  //     phone: formData.get("phone") || "",
  //     password: formData.get("password") || "",
  //     user_type: "Public Figure", // Default user type
  //   };
  //
  //   try {
  //     // Call the register API
  //     const response = await fetch(
  //       `${"https://solaryn.onrender.com/"}/api/auth/register`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(userData),
  //       }
  //     );
  //
  //     const data = await response.json();
  //
  //     if (data.token) {
  //       localStorage.setItem("token", data.token);
  //     }
  //
  //     if (data.status) {
  //       localStorage.setItem("create-account-token", "true");
  //       router.push("/onboarding/start");
  //     } else {
  //       setError(data.message || "Registration failed. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error registering user:", error);
  //     setError("An error occurred during registration. Please try again.");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const { email, confirmEmail, password, confirmPassword, phone, confirmPhone } = formData;
    if (email !== confirmEmail || password !== confirmPassword || phone !== confirmPhone) {
      setError("Please make sure all fields match.");
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding/start`,
          data: { phone },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Optional: Store extra data in a public `profiles` table if needed
      const user = data.user;
      if (user) {
        const { error: insertError } = await supabase
          .from("users") // your custom table name
          .insert([
            {
              id: user.id, // match this with Supabase auth user.id
              email,
              phone,
              verified: true,
            },
          ]);

        if (insertError) {
          setError("Account created, but failed to save profile info.");
          return;
        }
      }

      router.push("/verify-email");
    } catch (err) {
      console.error("Supabase registration error:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <>
      <div>
        <RootNavigation title={"Create an account"} backBtn={true} />

        <form ref={submitForm} onSubmit={handleSubmit} className={"pt-4"}>
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
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter Your Number"
            label="Your Phone number"
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
          <LabeledInput
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Your Password"
            label="Re-Entry Password"
            required
          />


          <PrimaryBtn type={"submit"} title={"Continue"} classes={"w-full block mb-4 mt-9"} />

          <div className="text-green-800 text-center mt-4">
            Already have an account?{" "}
            <button
              type="button"
              className="text-green-800 border-0 p-o bg-transparent underline focus:outline-none focus:ring-0"
              onClick={() => {
                router.push("/login");
              }}
            >
              Login
            </button>
          </div>

          {error && <div style={{ color: "red", textAlign: "center", margin: "10px 0" }}>{error}</div>}
        </form>
      </div>
    </>
  );
};

export default CreateAccountPage;
