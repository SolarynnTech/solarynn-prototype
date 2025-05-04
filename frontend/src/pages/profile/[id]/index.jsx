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
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";
import useProfilesStore from "@/stores/useProfilesStore";



const ProfilePage = ({ id }) => {

  const [profile, setProfile] = useState(null);
  const {user, setUser} = useUserStore();
  const supabase = useSupabaseClient();
  const { profiles } = useProfilesStore();

  useEffect(() => {
    if(!profiles) return;
    setProfile(profiles.find((p) => p.id === id));
  }, [profiles]);

  const updateRecentlyViewed = async () => {
    const { data: userData, error } = await supabase
      .from("users")
      .update({recently_viewed: user?.recently_viewed ? [...user?.recently_viewed, id] : [id]})
      .eq("id", user?.id);

    if (!error) {
      console.log("User recently viewed updated", userData);
      setUser((prevUser) => ({
        ...prevUser,
        recently_viewed: prevUser?.recently_viewed ? [...prevUser?.recently_viewed, id] : [id],
      }));
    }
  }

  useEffect(() => {
    if (user?.id && user?.id !== id && !user?.recently_viewed?.includes(id)) {
      updateRecentlyViewed();
    }
  }, [user?.id, profile]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Profile is loading...</p>
      </div>
    );
  }

  return (
    <div>
      <RootNavigation title={"Profile"} />
      <div className="pt-4 pb-8">
        <ProfileImage name={profile.name || profile.official_name || profile.agency_name} imgUrl={profile.img_url} id={id} />
        <SocialMediaSection links={profile.social_networks} id={id} />
        <PrimaryBtn title="Start A Project" classes="w-full block mb-12" onClick={()=> {
          router.push("/projects/new");
        }} />
        <DetailsPanel profile={profile} id={id} />
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
  const { id } = context.query;

  return {
    props: {
      id
    },
  };
}