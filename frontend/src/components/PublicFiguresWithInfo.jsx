"use client";
import React from "react";
import styles from "../components/profile.module.css";

import StatusBar from "../components/StatusBar";
import ProfileHeader from "../components/ProfileHeader";
import DetailsPanel from "../components/DetailsPanel";
import SocialMediaSection from "../components/SocialMediaSection";
import BusinessSection from "../components/BusinessSection";
import UniverseSection from "../components/UniverseSection";
import AlbumsSection from "../components/AlbumsSection";
import NavigationBar from "../components/NavigationBar";

const PublicFiguresWithInfo = () => {
  return (
    <div className={styles["profile-container"]}>
      <StatusBar />
      <ProfileHeader />
      <DetailsPanel />
      <SocialMediaSection />
      <BusinessSection />
      <UniverseSection />
      <AlbumsSection />
      <NavigationBar />
    </div>
  );
};

export default PublicFiguresWithInfo;
