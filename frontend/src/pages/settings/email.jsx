import React, { useState } from "react";
import RootNavigation from "@/components/Nav/Nav";
import LabeledInput from "@/components/forms/LabeledInput";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function UpdateEmail() {
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [reNewEmail, setReNewEmail] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const supabase = useSupabaseClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!currentEmail || !newEmail || !reNewEmail) {
      setError("All fields are required.");
      return;
    }
    if (newEmail !== reNewEmail) {
      setError("New emails do not match.");
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: `${window.location.origin}/home`,
        }
      );

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setEmailSent(true);
    } catch (error) {
      setError(`Error updating email: ${error.message}`);
    }
  };

  return (
    <div>
      <RootNavigation title="Update Email" backBtn={true} />

      {emailSent ? (
        <div className="pt-12 px-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Check your inbox</h2>
          <p className="text-gray-600">
            We've sent you a verification link. Please confirm your email to complete your Change Email process.
          </p>
          <p className="mt-4 text-sm text-gray-500">Once confirmed, your email will be updated.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pt-4">
          <LabeledInput
            label="Your Email"
            type="email"
            name="currentEmail"
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            placeholder="Enter Your CurrentEmail"
            required
          />
          <LabeledInput
            label="Your New Email"
            type="email"
            name="newEmail"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter Your New Email"
            required
          />
          <LabeledInput
            label="Re-Entry New Email"
            type="email"
            name="reNewEmail"
            value={reNewEmail}
            onChange={(e) => setReNewEmail(e.target.value)}
            placeholder="Confirm Your New Email"
            required
          />
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
          <PrimaryBtn title="Continue" type="submit" classes="w-full mt-9" />
        </form>
      )}
    </div>
  );
}
