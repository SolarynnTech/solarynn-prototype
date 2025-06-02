import { useState } from "react";

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
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Send Magic Link to Ghost User</h1>

      <input
        className="border p-2 w-full rounded"
        type="text"
        placeholder="Ghost User ID"
        value={ghostId}
        onChange={(e) => setGhostId(e.target.value)}
      />
      <input
        className="border p-2 w-full rounded"
        type="email"
        placeholder="Recipient Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={handleInvite}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Magic Link"}
      </button>

      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}