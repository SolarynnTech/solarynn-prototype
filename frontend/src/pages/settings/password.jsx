import React, { useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import LabeledInput from "@/components/forms/LabeledInput";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";

export default function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [error, setError] = useState("");
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { user } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!currentPassword || !newPassword || !reNewPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== reNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    // First, authenticate the user with their current password
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (error) {
        setError("Current password is incorrect.");
        console.error("Authentication failed:", error.message);
        return;
      }
    } catch (error) {
      setError(`Error verifying Current Password: ${error.message}`);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/home");
    } catch (error) {
      setError(`Error updating Password: ${error.message}`);
    }
  };

  return (
    <div>
      <RootNavigation title="Update Password" backBtn={true} />
      <form onSubmit={handleSubmit} className="pt-4">
        <LabeledInput
          label="Your Password"
          type="password"
          name="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter Your Current Password"
          required
        />
        <LabeledInput
          label="Your New Password"
          type="password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter Your New Password"
          required
        />
        <LabeledInput
          label="Re-Entry New Password"
          type="password"
          name="reNewPassword"
          value={reNewPassword}
          onChange={(e) => setReNewPassword(e.target.value)}
          placeholder="Confirm Your New Password"
          required
        />
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <PrimaryBtn title="Continue" type="submit" classes="w-full mt-9" />
      </form>
    </div>
  );
}
