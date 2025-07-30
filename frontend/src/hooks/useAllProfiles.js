import { useEffect, useRef, useState } from "react";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";
import useProfilesStore from "@/stores/useProfilesStore";

export default function useAllProfiles() {
  const supabase = useSupabaseClient();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [loading, setLoading] = useState(false);
  const { profiles, setProfiles } = useProfilesStore();

  const prevSessionRef = useRef(null);

  useEffect(() => {
    if (sessionLoading) return;

    const prevSession = prevSessionRef.current;
    const nowAuthenticated = !!session;
    const wasUnauthenticated = !prevSession;

    const shouldRefetch = !profiles?.length || (wasUnauthenticated && nowAuthenticated);

    async function fetchAllProfiles() {
      const isAuthenticated = !!session;

      const TABLES = isAuthenticated
        ? [
          { title: "Registered Profiles", table: "users", column: "name", displayField: "name" },
          { title: "Public Profiles", table: "ghost_users", column: "name", displayField: "name" },
        ]
        : [
          { title: "Public Profiles", table: "ghost_users", column: "name", displayField: "name" },
        ];

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

    if (shouldRefetch) {
      fetchAllProfiles();
    }

    prevSessionRef.current = session;
  }, [sessionLoading, session]);

  return { loading };
}