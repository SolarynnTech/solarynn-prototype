import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography } from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore.js";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";
import ProjectPreview from "@/components/projects/ProjectPreview.jsx";
import PlaceholderBox from "@/components/PlaceholderBox.jsx";
import UserPreview from "@/components/UserPreview.jsx";

const MyProjects = () => {
  const { user } = useUserStore();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, img_url")
        .eq("owner", user.id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) {
        console.error("Error loading projects:", error);
      } else {
        setProjects(data || []);
      }
    };
    loadProjects();
  }, [user?.id, supabase]);

  return (

    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">My Projects</h3>

        <div className="flex items-center">
          {projects.length > 2 && (
            <ActionBtn
              title="See All"
              onClick={() => router.push("/projects/my-projects")} />
          )}
        </div>
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar custom-scrollbar -mx-6 px-6">
        {projects && projects.length > 0 ? (
          projects.map((proj) => (
            <ProjectPreview
              key={proj.id}
              link={`/projects/${proj.id}`}
              title={proj.title}
              img_url={proj.img_url}
              height={150}
              width={150}
            />
          ))
        ) : (
          <>
            <PlaceholderBox height={150} width={150} />
            <PlaceholderBox height={150} width={150} />
            <PlaceholderBox height={150} width={150} />
          </>
        )}
      </div>
    </div>
  );
};

export default MyProjects;
