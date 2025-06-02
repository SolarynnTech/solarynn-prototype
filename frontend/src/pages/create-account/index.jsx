import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import LabeledInput from "@/components/forms/LabeledInput";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";
import Link from "next/link";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import LabeledDatePicker from "@/components/forms/LabeledDatepicker";

const CreateAccountPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submitForm = React.useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    birthday: null,
  });

  const supabase = useSupabaseClient();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password, confirmPassword, birthday } = formData;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;

    if (age < 18) {
      setError("The required age is 18 years or older.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
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

      const user = data.user;
      if (user) {
        const response = await fetch("/api/create-user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            email,
            birthday,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          setError("Account created, but failed to save profile info: " + result.error);
          return;
        }
      }

      await router.push("/verify-email");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col items-center justify-between grow" ref={submitForm} onSubmit={handleSubmit}>
      <img src="https://fyyvtuovzbvsldghtbhd.supabase.co/storage/v1/object/public/system/solaryn.png" className="w-32 mx-auto" alt="Solaryn" />

      <div className="w-full">
        <h1 className="text-center mb-4">Create an account</h1>

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
            onChange={(newDate) => setFormData((prev) => ({ ...prev, birthday: newDate }))}
          />
        </LocalizationProvider>
      </div>

      <div>
        <PrimaryBtn type="submit" title={loading ? "Signing Up..." : "Sign Up"} classes="w-full block mb-4 mt-9" />

        <div className="text-gray-600 text-center mt-4">
          Already have an account? <Link href="/login" className="text-indigo-500">Login</Link>
        </div>

        {error && <div style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</div>}
      </div>
    </form>
  );
};

export default CreateAccountPage;