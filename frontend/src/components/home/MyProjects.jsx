import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography } from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore.js";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";
import ProjectPreview from "@/components/projects/ProjectPreview.jsx";
import PlaceholderBox from "@/components/PlaceholderBox.jsx";

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
    <Box mb={12}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h6" fontWeight="bold">
          My Projects
        </Typography>
        {projects.length > 2 && (
          <ActionBtn
            title="See All"
            onClick={() => router.push("/projects")}
          />
        )}
      </Box>
      <div
        className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar -mx-6 px-6">
        <Box display="flex" gap={2} overflowX="auto" px={-6} className="hide-scrollbar">
          {projects.length > 0 ? (
            projects.map((proj) => (
              <ProjectPreview
                key={proj.id}
                link={`/projects/${proj.id}`}
                title={proj.title}
                img_url={proj.img_url}
                height={150} width={150}
              />
            ))
          ) : (
            <>
              <PlaceholderBox height={200} width={300}/>
              <PlaceholderBox height={200} width={300}/>
              <PlaceholderBox height={200} width={300}/>
            </>
          )}
        </Box>
      </div>
    </Box>
  );
};

export default MyProjects;
