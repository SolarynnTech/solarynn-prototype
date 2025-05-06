import React, {useEffect, useState} from "react";
import { useRouter } from "next/router";
import { Mail, Bell, Settings, Search } from "lucide-react";
import NavigationBar from "@/components/profile/NavigationBar";
import ProjectCategory from "@/components/projects/ProjectCategory";
import ProjectsSearchBar from "@/components/projects/ProjectsSearchBar";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function ProjectsPage() {
  const router = useRouter();

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
          .select("*");

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
        const { data, error } = await supabase
          .from("project_categories")
          .select("*");

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

  useEffect(() => {
    console.log("projects", projects);
    console.log("projectCategories", projectCategories);
  }, [projects, projectCategories]);


  return (
    <div className="pb-8">
      <nav className="flex items-center justify-between relative py-2 gap4 mb-6">
        <h1>Projects</h1>
        <div className="flex items-center justify-between gap-4">
          <Mail className="cursor-pointer hover:text-green-800" onClick={() => router.push("/mail")} />
          <Bell className="cursor-pointer hover:text-green-800" onClick={() => router.push("/notifications")} />
          <Settings className="cursor-pointer hover:text-green-800" onClick={() => router.push("/settings")} />
        </div>
      </nav>

      <ProjectsSearchBar/>

      {projectCategories && projectCategories.map((category) => (
        <ProjectCategory
          data={projects.filter(project => project.category === category.id)}
          key={category.id}
          id={category.id}
          name={category.title}
        />
      ))}

      <NavigationBar />
    </div>
  );
}
