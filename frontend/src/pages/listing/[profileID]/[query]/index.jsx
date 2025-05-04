import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import { Loader } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import useProfilesStore from "@/stores/useProfilesStore";
import UserPreview from "@/components/UserPreview";

export default function Listing() {
  const router = useRouter();
  const { profiles } = useProfilesStore();
  const { profileID, query } = router.query;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const titlesEnum = {
    recently_viewed: "Recently Viewed",
    favorites: "Favorites",
  }

  useEffect(() => {
    if (!profileID || !profiles?.length) return;
    const profilesIDs = profiles.find((profile) => profile.id === profileID)[query];
    if (!profilesIDs) return;
    setResults(profilesIDs.map((id) => {
      return profiles.find((profile) => profile.id === id);
      }))
    }, [profileID, query, profiles]);

  return (
    <div>
      <RootNavigation title={titlesEnum[query]} backBtn={true} />

      <div className="pt-12">

        <SearchBar/>

        <div className="mb-4">
          {loading && (
            <div className="flex justify-center items-center h-[75vh]">
              <Loader className="animate-spin text-green-800" />
              <p className="ml-2">Loading...</p>
            </div>
          )}

          <div className={"grid grid-cols-2 gap-4"}>
            {results?.map((profile, index) => (
              <div className="flex justify-center">
                <UserPreview
                  key={index}
                  link={"/profile/" + profile.id}
                  name={profile.name || profile.official_name || profile.agency_name}
                  img_url={profile.profile_img}
                  height={150} width={150}
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

