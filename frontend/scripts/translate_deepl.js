import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: "/app/frontend/.env.local" });

import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

if (!process.env.SUPABASE_SERVICE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_URL");
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const LANGS = ["fr", "es", "it", "pt", "ar", "ja", "hi", "ko", "zh"];

async function deeplTranslate(text, targetLang) {
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
    },
    body: new URLSearchParams({
      text,
      target_lang: targetLang.toUpperCase(),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepL API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.translations[0]?.text;
}

async function translateField({ table, field }) {
  const { data: rows, error } = await supabase
    .from(table)
    .select(["id", field, ...LANGS.map((lang) => `${field}_${lang}`)].join(","));

  if (error) {
    console.error("❌ Error fetching data:", error);
    return;
  }

  for (const row of rows) {
    const updates = {};

    for (const lang of LANGS) {
      const col = `${field}_${lang}`;
      if (!row[col] && row[field]) {
        try {
          const translated = await deeplTranslate(row[field], lang);
          updates[col] = translated;
          console.log(`🌍 Translated "${row[field]}" → [${lang}]: ${result.text}`);
        } catch (err) {
          console.error(`❌ Translation error (${lang}):`, err.message);
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase.from(table).update(updates).eq("id", row.id);

      if (updateError) {
        console.error(`❌ Update failed for ID ${row.id}:`, updateError);
      } else {
        console.log(`✅ Updated ID ${row.id}`);
      }
    }
  }
}

translateField({ table: "categories", field: "title" });
