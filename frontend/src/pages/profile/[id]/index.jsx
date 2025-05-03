import {useEffect, useState} from "react";
import RootNavigation from "@/components/Nav/Nav";
import ProfileImage from "@/components/profile/ProfileImage";
import DetailsPanel from "@/components/profile/DetailsPanel";
import SocialMediaSection from "@/components/profile/SocialMediaSection";
import BusinessSection from "@/components/profile/BusinessSection";
import UniverseSection from "@/components/profile/UniverseSection";
import AlbumsSection from "@/components/profile/AlbumsSection";
import NavigationBar from "@/components/profile/NavigationBar";
import React from "react";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import Affiliation from "@/components/profile/Affiliation";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

const TABLES = [
  { title: "Ad Agencies", table: "demo_ad_agencies", column: "agency_name", displayField: "agency_name" },
  { title: "Business Figures", table: "demo_business_figures", column: "name", displayField: "name" },
  { title: "Entertainment Figures", table: "demo_entertainment_figures", column: "name", displayField: "name" },
  { title: "Fashion Figures", table: "demo_fashion_figures", column: "name", displayField: "name" },
  { title: "Literature Journalism Figures", table: "demo_literature_journalism_figures", column: "name", displayField: "name" },
  { title: "Music Figures", table: "demo_music_figures", column: "name", displayField: "name" },
  { title: "Partial Ad Agencies", table: "demo_ad_agencies", column: "agency_name", displayField: "agency_name" },
  { title: "Education", table: "demo_education_entities", column: "official_name", displayField: "official_name" },
  { title: "Fashion Image Agencies", table: "demo_fashion_image_agencies", column: "agency_name", displayField: "agency_name" },
  { title: "Political Figures", table: "demo_political_figures", column: "name", displayField: "name" },
  { title: "Social Media Figures", table: "demo_social_media_figures", column: "name", displayField: "name" },
  { title: "Sports Figures", table: "demo_sports_figures", column: "name", displayField: "name" },
  { title: "Technology Figures", table: "demo_technology_figures", column: "name", displayField: "name" },
  { title: "Visual Arts Figures", table: "demo_visual_arts_figures", column: "name", displayField: "name" },
];

const ProfilePage = ({ id, profile, table }) => {

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Profile not found</p>
      </div>
    );
  }

  return (
    <div>
      <RootNavigation title={"Profile"} />
      <div className="pt-4 pb-8">
        <ProfileImage name={profile.name} imgUrl={profile.img_url} id={id} />
        <SocialMediaSection links={profile.social_networks} id={id} />
        <PrimaryBtn title="Start A Project" classes="w-full block mb-12" onClick={()=> {
          router.push("/projects/new");
        }} />
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


export async function getServerSideProps(context) {
  const supabase = createPagesServerClient(context);

  const { id } = context.query;

  for (const tableInfo of TABLES) {
    const { data, error } = await supabase
      .from(tableInfo.table)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.warn(`Error checking table ${tableInfo.table}: ${error.message}`);
      continue;
    }

    if (data) {
      return {
        props: {
          id,
          profile: data,
          table: tableInfo.table,
        },
      };
    }
  }

  return {
    notFound: true,
  };
}