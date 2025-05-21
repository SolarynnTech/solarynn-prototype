import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // 1. Delete from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    console.error("Failed to delete user:", authError);
    if (authError) throw authError;

    // 2. Optionally delete from custom users table
    await supabaseAdmin.from("users").delete().eq("id", userId);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to delete user:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
