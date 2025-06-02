import { useEffect, useState } from "react";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";
import useProfilesStore from "@/stores/useProfilesStore";

export default function useAllProfiles() {
  const supabase = useSupabaseClient();
  const { session, isLoading: sessionLoading } = useSessionContext();

  const [loading, setLoading] = useState(false);

  const { profiles, setProfiles } = useProfilesStore();

  // Dynamically define what tables to fetch based on auth
  const TABLES = session
    ? [
      { title: "Registered Profiles", table: "users", column: "name", displayField: "name" },
      { title: "Public Profiles", table: "ghost_users", column: "name", displayField: "name" },
    ]
    : [
      { title: "Public Profiles", table: "ghost_users", column: "name", displayField: "name" },
    ];

  useEffect(() => {
    if (sessionLoading) return;

    async function fetchAllProfiles() {
      const { data } = await supabase.auth.getSession();
      console.log("Current session:", data);
      setLoading(true);
      const allRecords = [];

      for (const { title, table, displayField } of TABLES) {
        const { data, error } = await supabase.from(table).select("*");

        if (error) {
          console.error(`Failed to fetch from ${title}:`, error.message);
          continue;
        }

        if (data?.length) {
          const enriched = data.map((item) => ({
            ...item,
            __table: table,
            __title: title,
            __displayField: displayField,
          }));
          allRecords.push(...enriched);
        }
      }

      setProfiles(allRecords);
      setLoading(false);
    }

    if (!profiles?.length) {
      fetchAllProfiles();
    }
  }, [session, sessionLoading]);

  return { loading };
}