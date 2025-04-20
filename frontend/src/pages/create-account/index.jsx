import React, { useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "../../components/Nav/Nav";
import PrimaryBtn from "../../components/buttons/PrimaryBtn";
import LabeledInput from "../../components/forms/LabeledInput";

const CreateAccountPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");

  const submitForm = React.useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    phone: "",
    confirmPhone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Get form data
    const formData = new FormData(submitForm.current);
    const userData = {
      username: formData.get("email")?.split("@")[0] || "", // Generate username from email
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      password: formData.get("password") || "",
      user_type: "Public Figure", // Default user type
    };

    try {
      // Call the register API
      const response = await fetch(
        `${"https://solaryn.onrender.com/"}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.status) {
        localStorage.setItem("create-account-token", "true");
        router.push("/onboarding/start");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setError("An error occurred during registration. Please try again.");
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
            required={true}
          />
          <LabeledInput
            type="email"
            name="confirmEmail"
            value={formData.confirmEmail}
            onChange={handleInputChange}
            placeholder="Confirm Your Email"
            label="Confirm Your Email"
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
          <LabeledInput
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Your Password"
            label="Re-Entry Password"
            required={true}
          />
          <LabeledInput
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter Your Number"
            label="Your Phone number"
            required={true}
          />
          <LabeledInput
            type="tel"
            name="confirmPhone"
            value={formData.confirmPhone}
            onChange={handleInputChange}
            placeholder="Confirm Your Number"
            label="Re-Entry Phone Number"
            required={true}
          />

          <PrimaryBtn
            type={"submit"}
            title={"Continue"}
            classes={"w-full block mb-4 mt-9"}
          />

          {error && (
            <div
              style={{ color: "red", textAlign: "center", margin: "10px 0" }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default CreateAccountPage;
