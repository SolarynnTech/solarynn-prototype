import React, { useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import LabeledInput from "@/components/forms/LabeledInput";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function UpdatePhone() {
  const [currentPhone, setCurrentPhone] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [reNewPhone, setReNewPhone] = useState("");
  const [error, setError] = useState("");
  const supabase = useSupabaseClient();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!newPhone || !reNewPhone) {
      setError("All fields are required.");
      return;
    }
    if (newPhone !== reNewPhone) {
      setError("New phone numbers do not match.");
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ phone: newPhone });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/home");
    } catch (error) {
      setError(`Error updating Phone Number: ${error.message}`);
    }
  };

  return (
    <div>
      <RootNavigation title="Update Phone Number" backBtn={true} />
      <form onSubmit={handleSubmit} className="pt-4">
        {/* <LabeledInput
          label="Your Phone Number"
          type="tel"
          name="currentPhone"
          value={currentPhone}
          onChange={(e) => setCurrentPhone(e.target.value)}
          placeholder="Enter Your Current Phone Number"
          required
        /> */}
        <LabeledInput
          label="Your New Phone Number"
          type="tel"
          name="newPhone"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          placeholder="Enter Your New Phone Number"
          required
        />
        <LabeledInput
          label="Re-Entry New Phone Number"
          type="tel"
          name="reNewPhone"
          value={reNewPhone}
          onChange={(e) => setReNewPhone(e.target.value)}
          placeholder="Confirm Your New Phone Number"
          required
        />
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <PrimaryBtn title="Continue" type="submit" classes="w-full mt-9" />
      </form>
    </div>
  );
}
