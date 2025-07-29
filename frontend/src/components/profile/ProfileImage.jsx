import React, { useEffect, useState } from "react";
import { BellOff, LaptopMinimalCheck, MessageCircleQuestion, CheckCircle } from "lucide-react";
import ActionBtn from "../buttons/ActionBtn";
import {
  Backdrop,
  Box,
  Fade,
  FormControl,
  FormControlLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  Switch,
  Typography,
  TextField
} from "@mui/material";
import useUserStore from "@/stores/useUserStore";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import uploadImageToSupabase from "@/utils/uploadImageToSupabase";
import LabeledInput from "@/components/forms/LabeledInput.jsx";
import { useRouter } from "next/router";
import LocationPicker from "@/components/profile/LocationPicker.jsx";
import useProfilesStore from "@/stores/useProfilesStore.js";

export const availabilityStatusMap = {
  ["open_to_project"]: {
    key: "open_to_project",
    title: "Open To Projects",
    icon: <LaptopMinimalCheck size={20} />,
    bgColor: "#cef7e7",
    textColor: "#297c03",
  },
  ["by_request"]: {
    key: "by_request",
    title: "Available by Request",
    icon: <MessageCircleQuestion size={20} />,
    bgColor: "#dde1fe",
    textColor: "#061a98",
  },
  ["not_available"]: {
    key: "not_available",
    title: "Not Available",
    icon: <BellOff size={20} />,
    bgColor: "#fee2b9",
    textColor: "#a06103",
  },
};

export const availabilityStatusOptions = Object.entries(availabilityStatusMap).map(([value, { title, icon }]) => ({
  value,
  title,
  icon,
}));

const ProfileImage = ({
                        name,
                        verified,
                        id,
                        availabilityStatus,
                        isMyProfile,
                        is_ghost,
                        handleSendPrivateProjectOpen,
                        bio,
                        profile
}) => {
  const [open, setOpen] = useState(false);
  const supabase = useSupabaseClient();
  const { user, setUser } = useUserStore();
  const [originalUser, setOriginalUser] = useState();

  const [imageFile, setImageFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [profileImg, setProfileImg] = useState("");
  const [coverImg, setCoverImg] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const router = useRouter();

  const {setProfiles} = useProfilesStore();

  const handleChange = (event) => {
    const { name, value, files, type, checked } = event.target;

    if (name === "profile_image" && files?.[0]) {
      setImageFile(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    } if (name === "cover_image" && files?.[0]) {
      setCoverFile(files[0]);
      setCoverPreview(URL.createObjectURL(files[0]));
    } else {
      setUser((prevUser) => ({
        ...prevUser,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  useEffect(() => {
    setProfileImg(profile.profile_img);
  }, [profile.id]);

  useEffect(() => {
    setCoverImg(profile.cover_img);
  }, [profile.id]);

  useEffect(() => {
    setProfileStatus(isMyProfile ? user?.availability_status : availabilityStatus || "");
  }, [user, id, availabilityStatus, isMyProfile]);

  useEffect(() => {
    if (open) {
      setOriginalUser(user);
    }
  }, [open]);

  const handleClose = () => {
    setUser(originalUser);
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, address, is_private, availability_status, bio, city, country } = user;

    const profile_img = imageFile
      ? await uploadImageToSupabase(supabase, imageFile, user.id, "avatars")
      : user.profile_img;

    const cover_img = coverFile
      ? await uploadImageToSupabase(supabase, coverFile, user.id, "covers")
      : user.cover_img;

    const { data, error } = await supabase
      .from("users")
      .update({
        name,
        email,
        address,
        profile_img,
        cover_img,
        is_private,
        bio,
        city,
        country,
        availability_status,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating user:", error);
      return;
    }

    setProfileImg(profile_img);
    setCoverImg(cover_img);
    setProfileStatus(availability_status);

    setProfiles(
      (prevProfiles) => prevProfiles.map((profile) => (profile.id === user.id ? {
        ...profile,
        name,
        email,
        address,
        profile_img,
        cover_img,
        is_private,
        availability_status,
        bio,
        city,
        country,
      } : profile))
    );

    setTimeout(() => {
      setOpen(false);
    }, 100);
  };

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

  return (
    <div className="mb-6 -mx-6 relative" style={{ backgroundImage: `url(${coverImg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute right-6 top-6 z-20">
        {isMyProfile && (<ActionBtn title="Edit" onClick={handleOpen}/>)}
      </div>

      <div className="relative overflow-hidden p-6">
        <div style={{ backgroundColor: "rgba(0,0,0,.35)"}} className="absolute top-0 bottom-0 left-0 right-0 z-[1]"></div>

        <div className={"flex items-center relative z-10"}>
          <div className={"shrink-0 h-32 sm:h-48 w-32 sm:w-48 rounded-full overflow-hidden border-4 border-white flex items-center justify-center bg-white"}
               style={{ backgroundImage: `url(${profileImg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          </div>
          <div className={"pl-6"}>
            <h2
              style={{ textShadow: `0 0 2px rgba(0,0,0,.25)` }}
              className="text-white font-bold text-2xl mb-4"
            >
              {isMyProfile ? user?.name : name}
              {verified && <CheckCircle size={20} strokeWidth={3} color="#22C55E" className="inline ml-2" />}
            </h2>
            <div className={"flex gap-2 items-start z-[2] flex-wrap"}>
              {profileStatus && (
                <div
                  className="flex items-center text-xs font-semibold uppercase rounded-full px-3 py-1"
                  style={{
                    color: availabilityStatusMap[profileStatus].textColor,
                    background: availabilityStatusMap[profileStatus].bgColor,
                  }}
                >
                  {availabilityStatusMap[profileStatus].icon}
                  <span className="ml-2">{availabilityStatusMap[profileStatus].title}</span>
                </div>
              )}
            </div>

            {bio?.trim() && (
              <Box className="my-4">
                  <Typography className="text-white">{bio}</Typography>
              </Box>
            )}

            {profile.country && (
              <Box className="my-4">
                <Typography className="text-white">{profile.country}{profile.city ? " - " + profile.city : ""}</Typography>
              </Box>
            )}

            {!is_ghost && (
              <div className={"mt-4"}>
                {isMyProfile ? (
                  <PrimaryBtn title={"Start A Project"} classes="w-full block mb-2" onClick={() => router.push("/projects")} />
                ) : (
                  availabilityStatus !== availabilityStatusMap.not_available.key && (
                    <PrimaryBtn title={"Send a Project"} classes="w-full block mb-2" onClick={()=>{
                      if (isMyProfile) {
                        router.push("/projects/create");
                      } else {
                        handleSendPrivateProjectOpen();
                      }
                    }} />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
              Edit Profile
            </Typography>

            <Stack spacing={2}>
              <LabeledInput
                type="name"
                name="name"
                value={user?.name ? user.name : ""}
                onChange={handleChange}
                placeholder="Enter Your Name"
                label="Your Name"
              />

              <Box sx={{ mt: 2, mb: 2 }}>
                <FormControl variant="outlined" fullWidth sx={{
                  "& .MuiOutlinedInput-root": {
                      "& .MuiSelect-select": {
                        padding: "13.5px 14px",
                      },

                      "& fieldset": {
                        borderColor: "#d1d5db", // Default border color
                        borderRadius: ".5rem",
                        borderWidth: "1px !important",
                        outline: "none",
                        boxShadow: "none",
                      },
                      "&:hover fieldset": {
                        borderColor: "#d1d5db", // On hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6366f1", // On focus
                      },
                    }}}>
                  <Select
                    labelId="availability-label"
                    id="availability_status"
                    name="availability_status"
                    value={user?.availability_status || ""}
                    onChange={handleChange}
                    fullWidth
                  >
                    {availabilityStatusOptions.map(({ value, title, icon }) => (
                      <MenuItem key={value} value={value}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {icon}
                          <span>{title}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth
                multiline
                minRows={2}
                value={user.bio}
                name="bio"
                onChange={handleChange}
                placeholder="Write a public-facing bio or description..."

                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#d1d5db" },
                    "&:hover fieldset": { borderColor: "#d1d5db" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6366f1",
                      borderWidth: "1px",
                    },
                  },
                }}
              />

              <LocationPicker />

              <Box>
                <FormControlLabel
                  control={<Switch name="is_private" checked={user?.is_private} onChange={handleChange} />}
                  label={user?.is_private ? "Private Profile" : "Public Profile"}
                />
              </Box>

              <label
                htmlFor="profile-image-upload"
                className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 hover:border-indigo-500 transition-colors text-center"
              >
                <p className="text-gray-600 mb-2">Click to upload profile image</p>
                <p className="text-indigo-500 font-semibold">Browse files</p>

                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  name="profile_image"
                  onChange={handleChange}
                  className="hidden"
                />

                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-4 rounded-md"
                    style={{ width: 100, height: 100, objectFit: "cover" }}
                  />
                )}
              </label>

              <label
                htmlFor="cover-image-upload"
                className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 hover:border-indigo-500 transition-colors text-center"
              >
                <p className="text-gray-600 mb-2">Click to upload cover image</p>
                <p className="text-indigo-500 font-semibold">Browse files</p>

                <input
                  id="cover-image-upload"
                  type="file"
                  accept="image/*"
                  name="cover_image"
                  onChange={handleChange}
                  className="hidden"
                />

                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="mt-4 rounded-md"
                    style={{ width: 100, height: 100, objectFit: "cover" }}
                  />
                )}
              </label>
            </Stack>


            <div className="flex justify-end mt-8 gap-2">
              <SecondaryBtn title={"Cancel"} onClick={handleClose} />
              <PrimaryBtn title={"Save"} onClick={handleSubmit} />
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default ProfileImage;
