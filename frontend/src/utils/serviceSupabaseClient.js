
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // During build time, return a dummy client that won't be used
  if (process.env.NODE_ENV === "production") {
    console.warn("Supabase credentials not found during build time");
  } else {
    throw new Error("Missing Supabase credentials");
  }
}

const serviceSupabaseClient = createClient(
  supabaseUrl ?? "",
  supabaseServiceKey ?? ""
);

export default serviceSupabaseClient;
