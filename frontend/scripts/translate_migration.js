// need to run the script below once in supabase
// create or replace function execute_sql(sql text)
// returns void as $$
// begin
//   execute sql;
// end;
// $$ language plpgsql security definer;

import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: "/app/frontend/.env.local" });

import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_SERVICE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_URL");
}

const serviceSupabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const LANGS = ["fr", "es", "it", "pt", "ar", "ja", "hi", "ko", "zh"];

async function runMigration({ table, field }) {
  for (const lang of LANGS) {
    const col = `${field}_${lang}`;
    const sql = `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${col}" TEXT;`;
    const { error } = await serviceSupabaseAdmin.rpc("execute_sql", { sql });
    if (error) {
      console.error(`❌ Error for ${col}:`, error);
    } else {
      console.log(`✅ Created column ${col}`);
    }
  }
}

runMigration({ table: "categories", field: "title" });
