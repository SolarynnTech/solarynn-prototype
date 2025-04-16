"use client";
import React from "react";
import "../styles/profile.css";

import StatusBar from "./sections/StatusBar";
import ProfileHeader from "./sections/ProfileHeader";
import SocialMediaSection from "./sections/SocialMediaSection";
import BusinessSection from "./sections/BusinessSection";
import UniverseSection from "./sections/UniverseSection";
import AlbumsSection from "./sections/AlbumsSection";
import NavigationBar from "./sections/NavigationBar";

const PublicFiguresWithInfo = () => {
  return (
    <div className="profile-container">
      <StatusBar />
      <ProfileHeader />
      <SocialMediaSection />
      <BusinessSection />
      <UniverseSection />
      <AlbumsSection />
      <NavigationBar />
    </div>
  );
};

export default PublicFiguresWithInfo;
