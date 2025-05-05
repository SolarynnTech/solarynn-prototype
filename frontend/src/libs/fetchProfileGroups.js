import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const fetchProfileGroups = async () => {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase.from("groups").select("*");

  if (error) {
    console.error("Failed to fetch groups:", error.message);
    return [];
  }

  return data;
};