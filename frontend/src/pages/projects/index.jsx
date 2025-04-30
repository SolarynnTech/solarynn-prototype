import React, { useState } from "react";
import { useRouter } from "next/router";
import { Mail, Bell, Settings, Search } from "lucide-react";
import NavigationBar from "../../components/profile/NavigationBar";
import ProjectPreview from "../../components/projects/ProjectPreview";
import SearchBar from "../../components/SearchBar";

export default function ProjectsPage() {
  const router = useRouter();

  return (
    <div className="pb-8">
      <nav className="flex items-center justify-between relative py-2 gap4 mb-6">
        <h1>Projects</h1>
        <div className="flex items-center justify-between gap-4">
          <Mail />
          <Bell />
          <Settings />
        </div>
      </nav>

      <SearchBar/>

      <ProjectPreview name={"Public Figures"} />
      <ProjectPreview name={"Fashion Brands"} />
      <ProjectPreview name={"Industry Experts"} />
      <ProjectPreview name={"Companies"} />



      <NavigationBar />
    </div>
  );
}
