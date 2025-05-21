import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import LabeledInput from "@/components/forms/LabeledInput";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";
import Link from "next/link";
import {DatePicker} from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import LabeledDatePicker from "@/components/forms/LabeledDatepicker";

const CreateAccountPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const dev = "development";
  const [loading, setLoading] = useState(false);
  const submitForm = React.useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    birthday: null,
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
    const { email, password, confirmPassword } = formData;
    if (password !== confirmPassword ) {
      setError("Please make sure all fields match.");
      return;
    }

    const today = new Date();
    const birthDate = new Date(formData.birthday);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (age < 18) {
      setError("The required age is 18 years or older.");
      return;
    }

    setLoading(true);

    try {
      const { data, signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding/start`,
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
              birthday: formData.birthday,
            },
          ]);

        if (insertError) {
          setError("Account created, but failed to save profile info.");
          return;
        }
      }

      await router.push("/verify-email");
    } catch (err) {
      console.error("Supabase registration error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <form className={"flex flex-col items-center justify-between grow"} ref={submitForm} onSubmit={handleSubmit}>

      <img src={"https://fyyvtuovzbvsldghtbhd.supabase.co/storage/v1/object/public/system/solaryn.png"} className={"justify-self-start self-start w-32 block mx-auto"} alt={"Solaryn"} />

      <div className={"w-full"}>
        <svg className={"mx-auto mb-8"} xmlns="http://www.w3.org/2000/svg" width="81" height="80" viewBox="0 0 81 80" fill="none">
          <rect x="0.5" width="80" height="80" rx="40" fill="#EEF2FF"/>
          <path d="M39.8333 44H33.8333C32.4188 44 31.0623 44.5619 30.0621 45.5621C29.0619 46.5623 28.5 47.9188 28.5 49.3333V52" stroke="#615FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M53.004 46.168C53.5351 45.6369 53.8335 44.9165 53.8335 44.1653C53.8335 43.4142 53.5351 42.6938 53.004 42.1627C52.4729 41.6315 51.7525 41.3331 51.0013 41.3331C50.2502 41.3331 49.5298 41.6315 48.9987 42.1627L43.652 47.512C43.335 47.8288 43.103 48.2204 42.9773 48.6507L41.8613 52.4773C41.8279 52.5921 41.8259 52.7137 41.8555 52.8295C41.8852 52.9452 41.9454 53.0509 42.0299 53.1354C42.1144 53.2199 42.2201 53.2801 42.3359 53.3098C42.4517 53.3395 42.5733 53.3375 42.688 53.304L46.5147 52.188C46.9449 52.0624 47.3365 51.8303 47.6533 51.5133L53.004 46.168Z" stroke="#615FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M37.8333 38.6667C40.7789 38.6667 43.1667 36.2789 43.1667 33.3333C43.1667 30.3878 40.7789 28 37.8333 28C34.8878 28 32.5 30.3878 32.5 33.3333C32.5 36.2789 34.8878 38.6667 37.8333 38.6667Z" stroke="#615FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <h1 className={"text-center mb-4"}>Create an account</h1>
        <LabeledInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter Your Email"
          label="Your Email"
          disabled={loading}
          required
        />
        {/*<LabeledInput*/}
        {/*  type="tel"*/}
        {/*  name="phone"*/}
        {/*  value={formData.phone}*/}
        {/*  onChange={handleInputChange}*/}
        {/*  placeholder="Enter Your Number"*/}
        {/*  label="Your Phone number"*/}
        {/*  required*/}
        {/*/>*/}
        <LabeledInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter Your Password"
          label="Password"
          disabled={loading}
          required
        />
        <LabeledInput
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm Your Password"
          label="Re-Entry Password"
          disabled={loading}
          required
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <LabeledDatePicker
            label="Birthday"
            message="This service is only available for users 18 years and older"
            value={formData.birthday}
            onChange={(newDate) =>
              setFormData((prev) => ({ ...prev, birthday: newDate }))
            }
          />
        </LocalizationProvider>

      </div>

      <div>
      <PrimaryBtn type={"submit"} title={loading ? "Signing Up..." : "Sign Up"} classes={"w-full block mb-4 mt-9"} />

      <div className="text-gray-600 text-center mt-4">
        Already have an account?{" "}
        <Link className={"text-indigo-500 no-underline"} href={"/login"}>Login</Link>
      </div>

      {error && <div style={{ color: "red", textAlign: "center", margin: "10px 0" }}>{error}</div>}
      </div>
    </form>

  );
};

export default CreateAccountPage;
