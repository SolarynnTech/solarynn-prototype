import { useEffect, useState } from "react";
import RootNavigation from "@/components/Nav/Nav";
import ProfileImage from "@/components/profile/ProfileImage";
import DetailsPanel from "@/components/profile/DetailsPanel";
import SocialMediaSection from "@/components/profile/SocialMediaSection";
import NavigationBar from "@/components/profile/NavigationBar";
import React from "react";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";
import useProfilesStore from "@/stores/useProfilesStore";
import { useRouter } from "next/router";
import Group from "@/components/profile/Group";
import { fetchProfileGroups } from "@/libs/fetchProfileGroups";
import { TextField, Typography, Box, Button } from "@mui/material";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const { user, setUser } = useUserStore();
  const supabase = useSupabaseClient();
  const { profiles } = useProfilesStore();
  const router = useRouter();
  const { id } = router.query;
  const [groups, setGroups] = useState([]);

  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [currentBio, setCurrentBio] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  const [isMyProfile, setIsMyProfile] = useState(null);

  useEffect(() => {
    if (!profiles) return;
    const p = profiles.find((p) => p.id === id);
    setProfile(p);
    if (p?.bio) setBio(p.bio);
    setCurrentBio(p.bio);
  }, [profiles, id]);

  useEffect(() => {
    if (user?.id) {
      setIsMyProfile(user.id === id);
    }
  }, [user?.id, id]);

  useEffect(() => {
    const loadGroups = async () => {
      const allGroups = await fetchProfileGroups();
      if (profile?.role) {
        const filtered = allGroups.filter((group) =>
          group.roles.includes(profile.role)
        );
        setGroups(filtered);
      }
    };

    loadGroups();
  }, [profile?.role]);

  const handleSaveBio = async () => {
    if (bio.trim() === "") {
      setBio(currentBio);
      setEditingBio(false);
      return;
    }

    setSavingBio(true);
    const { data: updated, error } = await supabase
      .from("users")
      .update({ bio })
      .eq("id", user.id)
      .select()
      .single();
    setSavingBio(false);
    if (error) {
      console.error("Failed to save bio:", error);
    } else {
      setProfile(updated);
      setUser(prev => ({ ...prev, bio: updated.bio }));
      setCurrentBio(updated.bio);   // обновляем базовый стейт
      setEditingBio(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Profile is loading...</p>
      </div>
    );
  }

  return (
    <div>
      <RootNavigation title={isMyProfile ? "My Profile" : "Profile"} backBtn/>
      <div className="pt-4 pb-8 px-4">
        <ProfileImage
          id={id}
          isMyProfile={isMyProfile}
          name={profile.name || profile.official_name || profile.agency_name}
          imgUrl={profile.img_url}
        />

        <SocialMediaSection
          id={id}
          isMyProfile={isMyProfile}
          links={profile.social_networks}
        />
        <PrimaryBtn
          title="Start A Project"
          classes="w-full block mb-12"
          onClick={() => router.push("/projects")}
        />

        {(isMyProfile || profile.bio) && (
          <Box className="my-8">
            <div className="flex justify-between items-center w-full">
              <h3 className="font-bold mb-0">
                {isMyProfile ? "Your Bio" : "About"}
              </h3>

              {isMyProfile && (
                <Box display="flex" gap={2}>
                  {editingBio ? (
                    <>
                      <ActionBtn
                        title={savingBio ? "Saving..." : "Save"}
                        onClick={handleSaveBio}
                        disabled={savingBio || bio.trim() === ""}
                      />
                      <ActionBtn
                        title="Cancel"
                        onClick={() => {
                          setBio(profile.bio || "");
                          setEditingBio(false);
                        }}
                        disabled={savingBio}
                      />
                    </>
                  ) : (
                    <ActionBtn title="Edit" onClick={() => setEditingBio(true)}/>
                  )}
                </Box>
              )}
            </div>

            <Box className="mt-4">
              {isMyProfile ? (
                editingBio ? (
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    value={bio}
                    onBlur={() => {
                      if (bio.trim() === "") {
                        setBio(currentBio);
                        setEditingBio(false);
                      }
                    }}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Write a public-facing bio or description..."
                    disabled={savingBio}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#000" },
                        "&:hover fieldset": { borderColor: "#000" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#000",
                          borderWidth: "2px",
                        },
                      },
                    }}
                  />
                ) : bio.trim() ? (
                  <Typography className="text-gray-700">{bio}</Typography>
                ) : (
                  <Typography className="text-gray-500 italic">
                    You haven’t added a bio yet. Click Edit to add one.
                  </Typography>
                )
              ) : (
                <Typography className="text-gray-700">{profile.bio}</Typography>
              )}
            </Box>
          </Box>
        )}


        <DetailsPanel isMyProfile={isMyProfile} profile={profile} id={id}/>

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
          );
        })}

        <NavigationBar/>
      </div>
    </div>
  );
};

export default ProfilePage;