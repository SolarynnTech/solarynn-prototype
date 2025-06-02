import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Settings, Loader } from "lucide-react";
import NavigationBar from "@/components/profile/NavigationBar";
import ProjectCategory from "@/components/projects/ProjectCategory";
import ProjectsSearchBar from "@/components/projects/ProjectsSearchBar";
import {useSessionContext, useSupabaseClient} from "@supabase/auth-helpers-react";
import NotificationsRequests from "@/components/Notifications/Requests";

export default function ProjectsPage() {
  const router = useRouter();
  const { session, isLoading: sessionLoading } = useSessionContext();

  const [projects, setProjects] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setProjects([]);

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .not("is_hidden", "eq", true)
          .not("project_visibility", "eq", "private");

        if (error) {
          console.error("Error fetching projects:", error);
        } else {
          setProjects(data || []);
        }
      } catch (err) {
        console.log("An unexpected error occurred:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  useEffect(() => {
    async function fetchProjectCategories() {
      setLoading(true);
      setProjectCategories([]);

      try {
        const { data, error } = await supabase.from("project_categories").select("*");

        if (error) {
          console.error("Error fetching projects:", error);
        } else {
          setProjectCategories(data || []);
        }
      } catch (err) {
        console.log("An unexpected error occurred:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjectCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[75vh]">
        <Loader className="animate-spin text-indigo-500" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <nav className="flex items-start justify-between relative gap4 mb-6">
        <h2>Projects</h2>
        <div className="flex items-center justify-between gap-4 pt-1">
          <NotificationsRequests />
          <Settings className="cursor-pointer hover:text-indigo-500" onClick={() => router.push("/settings")} />
        </div>
      </nav>

      <ProjectsSearchBar />

      {projectCategories &&
        projectCategories.map((category) => (
          <ProjectCategory
            data={projects.filter((project) => project.category === category.id)}
            key={category.id}
            id={category.id}
            name={category.title}
          />
        ))}

      {session && (
        <NavigationBar />
      )}
    </div>
  );
}
