import React, { useState, useEffect } from "react";
import RootNavigation from "@/components/Nav/Nav";
import { Loader } from "lucide-react";
import useProfilesStore from "@/stores/useProfilesStore";
import UserPreview from "@/components/UserPreview";
import Pagination from "@mui/material/Pagination";
import { useRouter } from "next/router";

export default function Profiles() {
  const { profiles } = useProfilesStore();
  const router = useRouter();
  const { id } = router.query;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 12; // Adjust as needed

  useEffect(() => {
    if (!id || !profiles?.length) return;
    const filtered = profiles.filter((profile) => profile.domain === id);
    setResults(filtered);
  }, [id, profiles]);

  // Pagination logic
  const totalPages = Math.ceil(results.length / profilesPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * profilesPerPage,
    currentPage * profilesPerPage
  );

  return (
    <div>
      <RootNavigation title={"Profiles"} backBtn={true} />

      <div className="pt-12">
        <div className="mb-4">
          {loading && (
            <div className="flex justify-center items-center h-[75vh]">
              <Loader className="animate-spin text-green-800" />
              <p className="ml-2">Loading...</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {paginatedResults?.length && paginatedResults.map((profile, index) => (
              <div key={profile.id} className="flex justify-center">
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

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, value) => setCurrentPage(value)}
                shape="rounded"
                color="primary"
                siblingCount={1}
                boundaryCount={1}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}