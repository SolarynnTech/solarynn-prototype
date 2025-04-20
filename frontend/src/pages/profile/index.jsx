import RootNavigation from "../../components/Nav/Nav";
import ProfileImage from "../../components/profile/ProfileImage";
import DetailsPanel from "../../components/profile/DetailsPanel";
import SocialMediaSection from "../../components/profile/SocialMediaSection";
import BusinessSection from "../../components/profile/BusinessSection";
import UniverseSection from "../../components/profile/UniverseSection";
import AlbumsSection from "../../components/profile/AlbumsSection";
import NavigationBar from "../../components/profile/NavigationBar";
import React from "react";
import PrimaryBtn from "../../components/buttons/PrimaryBtn";
import Affiliation from "../../components/profile/Affiliation";

const ProfilePage = () => {
  return (
    <div>
      <RootNavigation title="Your Profile" />

      <div className="pt-4 pb-8">
        <ProfileImage />
        <SocialMediaSection />
        <PrimaryBtn title="Start A Project" classes="w-full block mb-12" />
        <DetailsPanel />
        <Affiliation />
        <BusinessSection />
        <UniverseSection />
        <AlbumsSection />
        <NavigationBar />
      </div>
    </div>
  );
};

export default ProfilePage;
