import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore.js";
import RootNavigation from "@/components/Nav/Nav.jsx";
import ProjectPreview from "@/components/projects/ProjectPreview.jsx";
import { LoaderItem } from "@/components/Loader.jsx";

export default function MyProjectsPage() {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchMyProjects() {
      setLoading(true);
      setProjects([]);
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, img_url")
        .eq("owner", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching my projects:", error);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    }

    fetchMyProjects();
  }, [user?.id, supabase]);

  return (
    <div>
      <RootNavigation title="My Projects" backBtn/>

      <div className="pt-12">
        <div className="mb-4">
          {loading ? (
            <LoaderItem/>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {projects.map((project) => (
                <div className="flex justify-center" key={project.id}>
                  <ProjectPreview
                    name={project.title}
                    img_url={project.img_url}
                    link={`/projects/${project.id}`}
                    width={190}
                    height={300}
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