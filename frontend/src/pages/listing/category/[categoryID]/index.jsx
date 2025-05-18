import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import { Loader } from "lucide-react";
import useProfilesStore from "@/stores/useProfilesStore";
import UserPreview from "@/components/UserPreview";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function Listing() {
  const router = useRouter();
  const { profiles } = useProfilesStore();
  const { categoryID, query } = router.query;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState(null);
  const supabase = useSupabaseClient();

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryID);
    if (error) {
      console.error("Failed to fetch categories:", error);
    } else {
      setCategoryName(data[0]?.title);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (!categoryID || !profiles) return;
    fetchCategories();
    setResults(profiles.filter((profile) => profile.role === categoryID));
    setLoading(false);
  }, [categoryID, profiles]);

  return (
    <div>
      <RootNavigation title={categoryName} backBtn={true} />
      <div className="pt-12">
        <div className="mb-4">
          {loading ? (
            <div className="flex justify-center items-center h-[75vh]">
              <Loader className="animate-spin text-green-800" />
              <p className="ml-2">Loading...</p>
            </div>
          ) : (
            <>
              {!loading && results && results.length > 0 ? (
                <div className={"grid grid-cols-2 gap-4"}>
                  {results?.length && results?.map((profile, index) => (
                    <div className="flex justify-center" key={profile.id}>
                      <UserPreview
                        link={"/profile/" + profile?.id}
                        name={profile.name || profile.official_name || profile.agency_name}
                        img_url={profile.profile_img}
                        height={150} width={150}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-[75vh]">
                  <p className="ml-2 text-lg">No results found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}