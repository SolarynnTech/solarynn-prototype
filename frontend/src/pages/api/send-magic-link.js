import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { email, ghostId } = req.body;

    if (!email || !ghostId) {
        return res.status(400).json({ error: "Missing email or ghostId" });
    }

    try {
        // Optional: Verify the ghostId exists
        const { data: ghost, error: ghostError } = await supabase
            .from("ghost_users")
            .select("id")
            .eq("id", ghostId)
            .single();

        if (ghostError || !ghost) {
            return res.status(404).json({ error: "Ghost user not found" });
        }

        const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding/complete-invite?ghostId=${ghostId}`;

        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
            redirectTo,
        });

        if (inviteError) {
            return res.status(400).json({ error: inviteError.message });
        }

        return res.status(200).json({ success: true });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}