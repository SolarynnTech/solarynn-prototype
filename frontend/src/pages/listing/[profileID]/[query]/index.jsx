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
    key_people: "Founder(s) / key people",
    founders: "Founder(s)",
    clients: "Clients / talents",
    i_support: "I like/support what you doing",
    showroom: "Showroom",
    staff_team: "Staff / team",
    affiliated: "Affiliated company",
    worked_together: "We worked together",
    album: "Professional album",
    staff: "Staff"
  }

  useEffect(() => {
    if (!profileID || !profiles?.length) return;
    const profilesIDs = profiles.find((profile) => profile.id === profileID)[query];
    if (!profilesIDs) return;
    setResults(
      profilesIDs.map((id) => {
        return profiles.find((profile) => profile.id === id);
      })
    );
  }, [profileID, query, profiles]);

  return (
    <div className="pt-8">
      <RootNavigation title={titlesEnum[query]} backBtn={true} />

      <div className="pt-12">
        <SearchBar />

        <div className="mb-4">
          {loading && (
            <div className="flex justify-center items-center h-[75vh]">
              <Loader className="animate-spin text-indigo-500" />
              <p className="ml-2">Loading...</p>
            </div>
          )}

          {results && results.length > 0 ? (
            <div className={"grid grid-cols-2 gap-4"}>
              {results?.length &&
                results?.map((profile, index) => (
                  <div className="flex justify-center" key={profile.id}>
                    <UserPreview
                      link={"/profile/" + profile?.id}
                      name={profile.name || profile.official_name || profile.agency_name}
                      img_url={profile.profile_img}
                      height={150}
                      width={150}
                    />
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-[75vh]">
              <p className="ml-2 text-lg">No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
