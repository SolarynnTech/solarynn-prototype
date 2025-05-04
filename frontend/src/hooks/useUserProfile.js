import { useEffect, useState } from "react";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";
import useCategoriesStore from "@/stores/useCategoriesStore";
import useUserStore from "@/stores/useUserStore";

export default function useUserProfile() {
  const supabase = useSupabaseClient();
  const { setRole, setDomain, setSubDivision } = useCategoriesStore();
  const { setUser, setSocialNetworks, social_networks } = useUserStore();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    console.log("session", session);
    if (sessionLoading || !session?.user) return;

    const fetchData = async () => {

      console.log("Fetching user profile...");

      setLoading(true);
      try {
        const { data : userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        //console.log("User profile loaded", userData);

        if (userError) {
          console.error("Error loading user profile:", userError.message);
          return;
        }

        setUser(userData);

        setSocialNetworks({...social_networks, ...userData.social_networks} || {});

        if (userData.role || userData.domain || userData.subdivision) {
          const categoryIds = [userData.role, userData.domain, userData.subdivision].filter(Boolean);

          const { data: catData, error: catError } = await supabase
            .from("categories")
            .select("id, title, color, img_url")
            .in("id", categoryIds);

          if (catError) {
            console.error("Error loading categories:", catError.message);
            return;
          }

          // console.log("catData", catData);

          catData.forEach((cat) => {
            if (cat.id === userData.role) setRole({...cat, level: "role"});
            else if (cat.id === userData.domain) setDomain({...cat, level: "domain"});
            else if (cat.id === userData.subdivision) setSubDivision({...cat, level: "subdivision"});
          });
        }

      } catch (err) {
        console.error("Failed to load user profile:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, sessionLoading]);

  return { loading };
}