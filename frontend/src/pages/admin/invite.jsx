import React, { useState } from "react";
import LabeledInput from "@/components/forms/LabeledInput.jsx";
import PrimaryBtn from "@/components/buttons/PrimaryBtn.jsx";

export default function InviteAdminPage() {
  const [email, setEmail] = useState("");
  const [ghostId, setGhostId] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ghostId }),
      });

      const result = await response.json();
      if (response.ok) {
        setStatus(`✅ Magic link sent to ${email}`);
      } else {
        setStatus(`❌ ${result.error}`);
      }
    } catch (err) {
      setStatus(`❌ Unexpected error: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="w-full pt-8">
      <h1 className="text-xl font-bold mb-8 text-center">Send Magic Link to Ghost User</h1>

      <LabeledInput
        label="Ghost User ID"
        type="text"
        name="ghostId"
        value={ghostId}
        onChange={(e) => setGhostId(e.target.value)}
        required
      />

      <LabeledInput
        label="Recipient Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <PrimaryBtn title={loading ? "Sending..." : "Send Magic Link"}
        onClick={handleInvite}
        disabled={loading}
      />

      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}