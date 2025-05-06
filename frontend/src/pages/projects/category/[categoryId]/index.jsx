import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import { Loader } from "lucide-react";
import ProjectsSearchBar from "@/components/projects/ProjectsSearchBar";
import ProjectPreview from "@/components/projects/ProjectPreview";
import {useSupabaseClient} from "@supabase/auth-helpers-react";

export default function Listing() {
  const router = useRouter();
  const { categoryId } = router.query;
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectCategory, setProjectCategory] = useState([]);
  const supabase = useSupabaseClient();

  console.log("categoryId", categoryId);

  useEffect(() => {
    if(!categoryId) return;
    async function fetchProjectCategory() {
      setLoading(true);
      setProjectCategory([]);

      try {
        const { data, error } = await supabase
          .from("project_categories")
          .select("title")
          .eq("id", categoryId);

        if (error) {
          console.error("Error fetching projects:", error);
        } else {
          setProjectCategory(data || []);
        }
      } catch (err) {
        console.log("An unexpected error occurred:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectCategory();
  }, [categoryId]);

  useEffect(() => {
    if(!categoryId) return;
    async function fetchProjects() {
      setLoading(true);
      setProjects([]);

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("category", categoryId);

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
  }, [categoryId]);

  useEffect(() => {
    console.log("projectCategory", projectCategory)
  }, [projectCategory]);

  return (
    <div>
      <RootNavigation title={projectCategory[0]?.title} backBtn={true} />

      <div className="pt-12">

        <ProjectsSearchBar/>

        <div className="mb-4">
          {loading && (
            <div className="flex justify-center items-center h-[75vh]">
              <Loader className="animate-spin text-green-800" />
              <p className="ml-2">Loading...</p>
            </div>
          )}

          {projects && projects.length > 0 ? (
            <div className={"grid grid-cols-2 gap-4"}>
              {projects?.map((project, index) => (
                <div className="flex justify-center">
                  <ProjectPreview
                    name={project.name}
                    key={project.id}
                    img_url={project.img_url}
                    link={"/projects/" + project.id}
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

