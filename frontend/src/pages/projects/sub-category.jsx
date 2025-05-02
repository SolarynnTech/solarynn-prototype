import React, { useState } from "react";
import NavigationBar from "../../components/profile/NavigationBar";
import Domain from "../../components/projects/Domain";
import RootNavigation from "../../components/Nav/Nav";
import Favorites from "../../components/home/Favorites";
import SearchBar from "../../components/SearchBar";

export default function HomePage() {
  return (
    <div className="pb-8">
      <RootNavigation title={"Fashion"} backBtn={true} />

      <SearchBar/>

      <Favorites />

      <Domain />
      <Domain />
      <Domain />
      <Domain />

      <NavigationBar />
    </div>
  );
}
