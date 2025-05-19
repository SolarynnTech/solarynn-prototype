import { useEffect, useState } from "react";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";
import useProfilesStore from "@/stores/useProfilesStore";

export default function useAllProfiles() {
  const supabase = useSupabaseClient();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [loading, setLoading] = useState(false);

  const TABLES = [
    // { title: "Ad Agencies", table: "demo_ad_agencies", column: "agency_name", displayField: "agency_name" },
    // { title: "Business Figures", table: "demo_business_figures", column: "name", displayField: "name" },
    // { title: "Entertainment Figures", table: "demo_entertainment_figures", column: "name", displayField: "name" },
    // { title: "Fashion Figures", table: "demo_fashion_figures", column: "name", displayField: "name" },
    // {
    //   title: "Literature Journalism Figures",
    //   table: "demo_literature_journalism_figures",
    //   column: "name",
    //   displayField: "name",
    // },
    // { title: "Music Figures", table: "demo_music_figures", column: "name", displayField: "name" },
    // { title: "Partial Ad Agencies", table: "demo_ad_agencies", column: "agency_name", displayField: "agency_name" },
    // { title: "Education", table: "demo_education_entities", column: "official_name", displayField: "official_name" },
    // {
    //   title: "Fashion Image Agencies",
    //   table: "demo_fashion_image_agencies",
    //   column: "agency_name",
    //   displayField: "agency_name",
    // },
    // { title: "Political Figures", table: "demo_political_figures", column: "name", displayField: "name" },
    // { title: "Social Media Figures", table: "demo_social_media_figures", column: "name", displayField: "name" },
    // { title: "Sports Figures", table: "demo_sports_figures", column: "name", displayField: "name" },
    // { title: "Technology Figures", table: "demo_technology_figures", column: "name", displayField: "name" },
    // { title: "Visual Arts Figures", table: "demo_visual_arts_figures", column: "name", displayField: "name" },
    { title: "Registered Profiles", table: "users", column: "name", displayField: "name" },
  ];

  const { profiles, setProfiles } = useProfilesStore();

  useEffect(() => {
    if (sessionLoading) return;
    async function fetchAllProfiles() {
      setLoading(true);
      const allRecords = [];

      for (const { title, table, displayField } of TABLES) {
        const { data, error } = await supabase.from(table).select("*");

        if (error) {
          console.error(`Failed to fetch from ${title}:`, error.message);
          continue;
        }

        if (data && data.length > 0) {
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

    if (session && !profiles?.length) {
      fetchAllProfiles();
    }
  }, [session, sessionLoading]);

  return { loading };
}
