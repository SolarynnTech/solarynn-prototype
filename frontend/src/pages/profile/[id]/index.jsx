import { useEffect, useState } from "react";
import RootNavigation from "@/components/Nav/Nav";
import ProfileImage, { availabilityStatusMap } from "@/components/profile/ProfileImage";
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
import {TextField, Typography, Box, Button, Backdrop, Fade, Modal} from "@mui/material";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";
import MyProfileLocation from "@/components/profile/MyProfileLocation";
import ProfileLocation from "@/components/profile/ProfileLocation";
import ChatsSendMessage from "@/components/chats/SendMessage";
import SecondaryBtn from "@/components/buttons/SecondaryBtn.jsx";
import ProjectPreview from "@/components/projects/ProjectPreview.jsx";

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
  const [selectedPrivateProject, setSelectedPrivateProject] = useState(null);
  const [myPrivateProjects, setMyPrivateProjects] = useState([]);

  const handleSendPrivateProjectClose = () => {
    setSendProjectOpen(false);
    setSelectedPrivateProject(null);
  };

  const handleSendPrivateProjectOpen = () => {
    setSendProjectOpen(true);
  };

  const fetchMyPrivateProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner", user.id)
      .eq("project_visibility", "private")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching private projects:", error);
    } else {
      setMyPrivateProjects(data);
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchMyPrivateProjects();
    }
  }, [user?.id]);

  const sendPrivateProject = async () => {
    const { data: requests, error: requestsError } = await supabase
      .from("projects")
      .select("requests")
      .eq("id", selectedPrivateProject)
      .single();

    if (!requestsError) {
      if(!requests.includes(user?.id)) {
        const { data, error } = await supabase
          .from("projects")
          .update({ requests: requests.length ? [...requests, user?.id] : [user?.id] })
          .eq("id", selectedPrivateProject);
        if (error) {
          console.error("Error sending project:", error);
        }
        if (data) {
          console.log("Project sent successfully:", data);
        }
      }
    }

    handleSendPrivateProjectClose();
  }

  useEffect(() => {
    if (!profiles) return;
    const p = profiles.find((p) => p.id === id);
    setProfile(p);
    if (p?.bio) {
      setBio(p.bio);
      setCurrentBio(p.bio);
    }
  }, [profiles, id]);

  useEffect(() => {
    if (user?.id) {
      setIsMyProfile(user.id === id);
    }
    addRecentlyViewed();
  }, [user?.id, id]);

  useEffect(() => {
    const loadGroups = async () => {
      const allGroups = await fetchProfileGroups();
      if (profile?.role) {
        const filtered = allGroups.filter((group) => group.roles.includes(profile.role));
        setGroups(filtered);
      }
    };

    loadGroups();
  }, [profile?.role]);

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

  const handleSaveBio = async () => {
    if (bio.trim() === "") {
      setBio(currentBio);
      setEditingBio(false);
      return;
    }

    setSavingBio(true);
    const { data: updated, error } = await supabase.from("users").update({ bio }).eq("id", user.id).select().single();
    setSavingBio(false);
    if (error) {
      console.error("Failed to save bio:", error);
    } else {
      setProfile(updated);
      setUser((prev) => ({ ...prev, bio: updated.bio }));
      setCurrentBio(updated.bio); // обновляем базовый стейт
      setEditingBio(false);
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
    <div className="pt-8">
      <RootNavigation title={isMyProfile ? "My Profile" : "Profile"} backBtn />
      <div className="pt-4 pb-8">
        <ProfileImage
          id={id}
          isMyProfile={isMyProfile}
          name={profile.name || profile.email}
          imgUrl={profile.profile_img}
          availabilityStatus={profile.availability_status}
        />

        <SocialMediaSection id={id} isMyProfile={isMyProfile} links={profile.social_networks} />
        {isMyProfile ? (
          <PrimaryBtn title={"Start A Project"} classes="w-full block mb-2" onClick={() => router.push("/projects")} />
        ) : (
          profile.availability_status !== availabilityStatusMap.not_available.key && (
            <PrimaryBtn title={"Send a Project"} classes="w-full block mb-2" onClick={()=>{
            if (isMyProfile) {
              router.push("/projects/create");
            } else {
              handleSendPrivateProjectOpen();
            }
          }} />
          )
        )}
        {!isMyProfile && <ChatsSendMessage id={id} />}

        {(isMyProfile || profile.bio) && (
          <Box className="my-8">
            <div className="flex justify-between items-center w-full">
              <h3 className="font-bold mb-0">{isMyProfile ? "Your Bio" : "About"}</h3>

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
                    <ActionBtn title="Edit" onClick={() => setEditingBio(true)} />
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
                    onChange={(e) => setBio(e.target.value)}
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

        {isMyProfile ? (
          <MyProfileLocation location={{ country: profile.country, city: profile.city }} />
        ) : (
          profile.country && <ProfileLocation location={profile.country} />
        )}

        <DetailsPanel isMyProfile={isMyProfile} profile={profile} id={id} />

        {groups?.length &&
          groups.map((group) => {
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

        <NavigationBar />
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

            <div className={"grid grid-cols-1 gap-2 max-h-60 overflow-y-auto"}>
              {myPrivateProjects?.length && myPrivateProjects.map((proj) => (
                  <label key={proj.id} className={`flex w-full items-center mb-4 cursor-pointer p-2 rounded-xl border border-transparent ${selectedPrivateProject === proj.id ? "!border-indigo-500" : ""}`}>
                    <input
                      type="radio"
                      id={proj.id}
                      name="project"
                      value={proj.id}
                      checked={selectedPrivateProject === proj.id}
                      onChange={() => setSelectedPrivateProject(proj.id)}
                      className="mr-2 hidden"
                    />

                      <img className={"mr-2 rounded-md"} src={proj.img_url} width={"40"} height={"40"} alt={proj.title} />

                    <span className="text-gray-700">{proj.title}</span>
                  </label>
                ))}
            </div>


            <div className="flex justify-end mt-8 gap-2">
              <SecondaryBtn title={"Cancel"} onClick={handleSendPrivateProjectClose} />
              <PrimaryBtn disabled={false} title={"Submit"} onClick={sendPrivateProject} />
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default ProfilePage;
