import { useEffect, useState } from "react";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";
import useProjectStore from "@/stores/useProjectStore";

export default function useAllProjects() {
  const supabase = useSupabaseClient();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [loading, setLoading] = useState(false);

  const { allProjects, setAllProjects } = useProjectStore();

  useEffect(() => {
    if (sessionLoading) return;
    async function fetchAllProjects() {
      setLoading(true);
      const { data, error } = await supabase.from("projects").select("*");
      if(!error){
        setAllProjects(data);
      } else {
        console.error("Failed to fetch projects:", error.message);
      }
    }
    setLoading(false);
    if (session && !allProjects?.length) {
      fetchAllProjects();
    }
  }, [session, sessionLoading]);

  return { loading };
}
