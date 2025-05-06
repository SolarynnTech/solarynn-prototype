import {useEffect, useState} from "react";
import RootNavigation from "@/components/Nav/Nav";
import ProfileImage from "@/components/profile/ProfileImage";
import DetailsPanel from "@/components/profile/DetailsPanel";
import SocialMediaSection from "@/components/profile/SocialMediaSection";
import NavigationBar from "@/components/profile/NavigationBar";
import React from "react";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";
import useProfilesStore from "@/stores/useProfilesStore";
import {useRouter} from "next/router";
import Group from "@/components/profile/Group";
import { fetchProfileGroups } from "@/libs/fetchProfileGroups";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const {user, setUser} = useUserStore();
  const supabase = useSupabaseClient();
  const { profiles } = useProfilesStore();
  const router = useRouter();
  const { id } = router.query;
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const loadGroups = async () => {
      const allGroups = await fetchProfileGroups();
      console.log("allGroups", allGroups);
      if (profile?.role) {
        const filtered = allGroups.filter((group) =>
          group.roles.includes(profile.role)
        );
        setGroups(filtered);
      }
    };

    loadGroups();
  }, [profile?.role]);

  useEffect(() => {
    console.log("groups",  groups)
  }, [groups]);

  useEffect(() => {
    if(!profiles) return;
    setProfile(profiles.find((p) => p.id === id));
  }, [profiles, id]);

  const [isMyProfile, setIsMyProfile] = useState(null);

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
    setIsMyProfile(user?.id === id);
  }, [user?.id, id]);

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
        <ProfileImage id={id} isMyProfile={isMyProfile} name={profile.name || profile.official_name || profile.agency_name} imgUrl={profile?.img_url} />
        <SocialMediaSection id={id} isMyProfile={isMyProfile} links={profile.social_networks} />
        <PrimaryBtn title="Start A Project" classes="w-full block mb-12" onClick={()=> {
          router.push("/projects");
        }} />
        <DetailsPanel isMyProfile={isMyProfile} profile={profile} id={id} />

        {groups?.length && groups.map((group) => {
          return (
            <Group
              key={group.id}
              id={id}
              groupId={group.id}
              title={group.title}
              data={profile[group.column_name]}
              columnName={group.column_name}
              isMyProfile={isMyProfile}
              profile={profile}
            />
          )
        })}

        <NavigationBar />
      </div>
    </div>
  );
};

export default ProfilePage;