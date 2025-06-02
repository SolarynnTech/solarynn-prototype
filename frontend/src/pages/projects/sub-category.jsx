import React, { useState } from "react";
import NavigationBar from "@/components/profile/NavigationBar";
import Domain from "@/components/projects/Domain";
import RootNavigation from "@/components/Nav/Nav";
import Favorites from "@/components/home/Favorites";
import SearchBar from "@/components/SearchBar";
import {useSessionContext} from "@supabase/auth-helpers-react";

export default function HomePage() {
  const { session, isLoading: sessionLoading } = useSessionContext();
  return (
    <div className="py-8">
      <RootNavigation title={"Fashion"} backBtn={true} />

      <SearchBar/>

      <Favorites />

      <Domain />
      <Domain />
      <Domain />
      <Domain />

      {session && (
        <NavigationBar />
      )}
    </div>
  );
}
