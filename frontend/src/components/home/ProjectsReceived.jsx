import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography } from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore.js";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";
import ProjectPreview from "@/components/projects/ProjectPreview.jsx";
import PlaceholderBox from "@/components/PlaceholderBox.jsx";
import UserPreview from "@/components/UserPreview.jsx";

const ProjectsReceived = () => {
  const { user } = useUserStore();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, img_url, participants")
        .eq("is_hidden", false)
        .eq("project_visibility", "private")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) {
        console.error("Error loading projects:", error);
      } else {
        setProjects(data.filter(project => project.participants && project.participants.includes(user.id.toString())) || []);
      }
    };
    loadProjects();
  }, [user?.id, supabase]);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Projects Received</h3>

        <div className="flex items-center">
          {projects?.length > 2 && (
            <ActionBtn
              title={"See All"}
              onClick={() => {
                router.push("/listing/" + user.id + "/recently_viewed");
              }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar -mx-6 px-6">
        {projects?.length > 0 ? (
          projects?.map((profile, index) => (
            <UserPreview
              key={index}
              link={"/profile/" + profile?.id}
              name={profile.name || profile.email}
              img_url={profile.profile_img}
              height={150} width={150}
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

export default ProjectsReceived;
