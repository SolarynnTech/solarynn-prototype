import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, email, birthday } = req.body;

  if (!id || !email || !birthday) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { error } = await supabase.from('users').insert([
    {
      id,
      email,
      birthday,
      availability_status: 'open_to_project',
    },
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}