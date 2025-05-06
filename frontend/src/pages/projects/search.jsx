import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import { Loader } from "lucide-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import ProjectsSearchBar from "@/components/projects/ProjectsSearchBar";

export default function Search() {
  const router = useRouter();
  const { searchQuery } = router.query;
  const supabase = useSupabaseClient();

  const [projectResults, setProjectResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError(null);
      setProjectResults([]);

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, title")
          .ilike("title", `%${searchQuery}%`);

        if (error) {
          console.error("Error fetching projects:", error);
          setError("Failed to fetch projects.");
        } else {
          setProjectResults(data || []);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    if (searchQuery) {
      fetchProjects();
    }
  }, [searchQuery]);

  return (
    <div>
      <RootNavigation title="Search Results" backBtn={true} />

      <div className="pt-12">
        <ProjectsSearchBar />

        <div className="mb-4">
          {loading && (
            <div className="flex justify-center items-center h-[75vh]">
              <Loader className="animate-spin text-green-800" />
              <p className="ml-2">Loading...</p>
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}

          {!loading && searchQuery && projectResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Matching Projects</h2>
              <ul>
                {projectResults.map((project) => (
                  <li key={project.id} className="mb-2">
                    <a
                      href={`/projects/${project.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {project.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loading && searchQuery && projectResults.length === 0 && (
            <h1 className="text-2xl font-bold">No results found</h1>
          )}
        </div>
      </div>
    </div>
  );
}