import {useEffect, useState} from "react";
import RootNavigation from "@/components/Nav/Nav";
import ProfileImage, { availabilityStatusMap } from "@/components/profile/ProfileImage";
import DetailsPanel from "@/components/profile/DetailsPanel";
import SocialMediaSection from "@/components/profile/SocialMediaSection";
import NavigationBar from "@/components/profile/NavigationBar";
import React from "react";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import {useSessionContext, useSupabaseClient} from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";
import useProfilesStore from "@/stores/useProfilesStore";
import { useRouter } from "next/router";
import Group from "@/components/profile/Group";
import { fetchProfileGroups } from "@/libs/fetchProfileGroups";
import {TextField, Typography, Box, IconButton, Tooltip, Backdrop, Fade, Modal} from "@mui/material";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";
import ChatsSendMessage from "@/components/chats/SendMessage";
import SecondaryBtn from "@/components/buttons/SecondaryBtn.jsx";
import CategoryTile from "@/components/tiles/CategoryTile.jsx";
import ReportProfile from "@/components/profile/ReportProfile.jsx";
import BlockIcon from "@mui/icons-material/Block";
import PersonOffIcon from "@mui/icons-material/PersonOff";

const ProfilePage = () => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

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
  const [sendProjectOpen, setSendProjectOpen] = useState(false);
  const [projectCategories, setProjectCategories] = useState([]);

  const [universeCategories, setUniverseCategories] = useState([]);
  const [universeSubCategories, setUniverseSubCategories] = useState([]);
  const categoryNamesExcluded = ["Book Talent"];

  const [universeCategoryId, setUniverseCategoryId] = useState(null);
  const { session, isLoading: sessionLoading } = useSessionContext();

  const handleSendPrivateProjectClose = () => {
    setSendProjectOpen(false);
  };

  const handleSendPrivateProjectOpen = () => {
    setSendProjectOpen(true);
  };

  const [blockedUsers, setBlockedUsers] = useState(user?.blocked_users || []);
  const [isBlocked, setIsBlocked]   = useState(
    blockedUsers.includes(id)
  );

  const onToggleBlock = async () => {
    const newBlocked = isBlocked
      ? blockedUsers.filter(uid => uid !== id)
      : [...blockedUsers, id];

    const { error } = await supabase
      .from('users')
      .update({ blocked_users: newBlocked })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating block list:', error.message);
      return;
    }

    setBlockedUsers(newBlocked);
    setIsBlocked(!isBlocked);
    setUser(prev => ({
      ...prev,
      blocked_users: newBlocked
    }));
  };

  useEffect(() => {
    if (!profiles) return;
    const p = profiles.find((p) => p.id === id);
    setProfile(p);
    console.log("Profile data:", p);
  }, [profiles, id]);

  useEffect(() => {
    if (user?.id) {
      setIsMyProfile(user.id === id);
    }
    addRecentlyViewed();
  }, [user?.id, id]);

  useEffect(() => {
    fetchUniverseCategories();
  }, []);

  useEffect(() => {
    if (!profile) return;
    const loadGroups = async () => {
      const allGroups = await fetchProfileGroups();
      if (profile?.role) {
        const filtered = allGroups.filter((group) => group.roles.includes(profile.role));
        setGroups(filtered);
        console.log("Filtered groups:", allGroups);
      }
    };

    loadGroups();
  }, [profile]);

  useEffect(() => {
    async function fetchProjectCategories() {
      setProjectCategories([]);

      try {
        const { data, error } = await supabase
          .from("project_categories")
          .select("*");

        if (error) {
          console.error("Error fetching projects:", error);
        } else {
          setProjectCategories(data || []);
        }
      } catch (err) {
        console.log("An unexpected error occurred:", err);
      }
    }

    fetchProjectCategories();
  }, []);

  async function fetchUniverseSubCategory(catId) {
    try {
      const { data, error } = await supabase
        .from("universe_sub_categories")
        .select("*")
        .eq("universe_category", catId);
      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setUniverseSubCategories(data || []);
        console.log("Subcategories data:", data);
      }
    } catch (err) {
      console.log("An unexpected error occurred:", err);
    }
  }

  const addRecentlyViewed = async () => {
    if (user && user.id !== id) {
      const viewed = user.recently_viewed || [];
      if (!viewed.includes(id)) {
        viewed.push(id);
        setUser((prev) => ({ ...prev, recently_viewed: viewed }));
        await supabase.from("users").update({ recently_viewed: viewed }).eq("id", user.id);
      }
    }
  };

  const fetchUniverseCategories = async () => {
    const { data, error } = await supabase
      .from("universe_categories")
      .select("*");

    if (error) {
      console.error("Failed to fetch categories:", error);
    } else {
      setUniverseCategories(data);
    }
  };

  if (!profiles) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Profile is loading...</p>
      </div>
    );
  } else if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg mb-8">Profile not found</p>
        <PrimaryBtn
          title="Go to Home"
          onClick={() => router.push("/home")}
        />
      </div>
    );
  }

  return (
    <div className="pt-6">
      <RootNavigation title={isMyProfile ? "My Profile" : "Profile"} backBtn={!profile.is_ghost} />
      <div className="pb-8">
        <ProfileImage
          id={id}
          isMyProfile={isMyProfile}
          name={profile.name || profile.email}
          verified={profile.verified || false}
          availabilityStatus={profile.availability_status}
          is_ghost={profile.is_ghost}
          bio={profile.bio}
          profile={profile}
          handleSendPrivateProjectOpen={handleSendPrivateProjectOpen}
        />

        <SocialMediaSection id={id} isMyProfile={isMyProfile} links={profile.social_networks} />

        {!isMyProfile && !profile.is_ghost && <ChatsSendMessage id={id} />}

        {profile.questionnaire_answers && Object.keys(profile.questionnaire_answers).length > 0 && (
          <DetailsPanel isMyProfile={isMyProfile} profile={profile} id={id} />
        )}

        {profile && groups?.length ?
          groups.filter((group) => !(group.column_name === "i_support" && isMyProfile)).map((group) => {
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
            }) : null}

        {!isMyProfile && session && (
        <div className={"flex justify-end items-center gap-4 mb-8"}>
            <ReportProfile/>

          <div className={"flex items-center cursor-pointer"} onClick={onToggleBlock}>
            <IconButton
              size="small"
              sx={{
                color: isBlocked ? "grey.500" : "error.main"
              }}
            >
              {isBlocked ? <PersonOffIcon/> : <BlockIcon/>}
            </IconButton>
            <span className={"ml-1 text-xs"}>{isBlocked ? "Unblock" : "Block"}</span>
          </div>


        </div>
            )}
        {session && (
          <NavigationBar />
        )}
      </div>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={sendProjectOpen}
        onClose={handleSendPrivateProjectClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={sendProjectOpen}>
          <Box sx={style}>
            <Box sx={{ mb: 2 }}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Send a Project
              </Typography>
            </Box>

            <div className={"grid grid-cols-1 gap-2 max-h-[65vh] overflow-y-auto"}>

              {universeCategoryId ? (
                  <>
                    {universeSubCategories && universeSubCategories.length > 0 ? (
                      universeSubCategories.map((category) => (
                        <CategoryTile
                          key={category.id}
                          title={category.title}
                          onClick={() => router.push(`/projects/new/${category.id}?private=true&userId=${id}`)}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">No subcategories available</p>
                    )}
                  </>
                ) : (
                  <>
                    {universeCategories
                      ?.sort((a, b) => {
                        const aAvailable = !categoryNamesExcluded.includes(a.title);
                        const bAvailable = !categoryNamesExcluded.includes(b.title);
                        if (aAvailable && !bAvailable) return -1;
                        if (!aAvailable && bAvailable) return 1;
                        return 0;
                      })
                      .map((category) => (
                        <CategoryTile
                          key={category.id}
                          title={category.title}
                          isAvailable={!categoryNamesExcluded.includes(category.title)}
                          onClick={() => {
                            setUniverseCategoryId(category.id);
                            fetchUniverseSubCategory(category.id);
                          }}
                        />
                    ))}

                    {projectCategories &&
                      projectCategories.map((category) => (
                        <CategoryTile
                          key={category.id}
                          title={category.title}
                          bg_color={category.color}
                          onClick={() => router.push(`/projects/new/${category.id}?private=true&userId=${id}`)}
                        />
                      ))}
                  </>
              )}

            </div>

            <div className="flex justify-between mt-8 gap-2">
              <SecondaryBtn title={"Go Back"} onClick={()=> setSendProjectOpen(false)} />
              <SecondaryBtn title={"Cancel"} onClick={handleSendPrivateProjectClose} />
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default ProfilePage;
