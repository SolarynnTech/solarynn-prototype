import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import { Loader } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import UserPreview from "@/components/UserPreview";
import useProjectStore from "@/stores/useProjectStore.js";
import useProfilesStore from "@/stores/useProfilesStore";

export default function ProjectListing() {
  const router = useRouter();
  const { allProjects } = useProjectStore();
  const { profiles } = useProfilesStore();
  const { projectID, query } = router.query;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const titlesEnum = {
    participants: "Participants",
  }

  useEffect(() => {
    if (!projectID || !allProjects?.length) return;

    const profilesIDs = allProjects.find((project) => project.id === projectID)[query];
    if (!profilesIDs) return;
    setResults(
      profilesIDs.map((id) => {
        return profiles.find((profile) => profile.id === id);
      }).filter((p) => p)
    );
  }, [projectID, query, allProjects]);

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
                      name={profile?.name || profile?.email}
                      img_url={profile?.profile_img}
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
