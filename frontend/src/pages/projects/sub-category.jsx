import React, { useState } from "react";
import NavigationBar from "../../components/profile/NavigationBar";
import SubCategory from "../../components/projects/SubCategory";
import RootNavigation from "../../components/Nav/Nav";
import Favorites from "../../components/home/Favorites";
import SearchBar from "../../components/SearchBar";

export default function HomePage() {
  return (
    <div className="pb-8">
      <RootNavigation title={"Fashion"} backBtn={true} />

      <SearchBar/>

      <Favorites />

      <SubCategory />
      <SubCategory />
      <SubCategory />
      <SubCategory />

      <NavigationBar />
    </div>
  );
}
