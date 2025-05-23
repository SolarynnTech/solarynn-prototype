import React, { useEffect, useState } from "react";
import { BellOff, LaptopMinimalCheck, MessageCircleQuestion, Star } from "lucide-react";
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
} from "@mui/material";
import PlaceholderBox from "../PlaceholderBox";
import useUserStore from "@/stores/useUserStore";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import uploadImageToSupabase from "@/utils/uploadImageToSupabase";
import LabeledInput from "@/components/forms/LabeledInput.jsx";

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

const ProfileImage = ({ name, id, imgUrl, availabilityStatus, isMyProfile }) => {
  const [open, setOpen] = useState(false);
  const supabase = useSupabaseClient();
  const { user, setUser } = useUserStore();
  const [originalUser, setOriginalUser] = useState();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImg, setProfileImg] = useState("");
  const [profileStatus, setProfileStatus] = useState("");

  const handleChange = (event) => {
    const { name, value, files, type, checked } = event.target;

    if (name === "profile_image" && files?.[0]) {
      setImageFile(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setUser((prevUser) => ({
        ...prevUser,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  useEffect(() => {
    setProfileImg(isMyProfile ? user?.profile_img : imgUrl || "");
  }, [user, id, imgUrl, isMyProfile]);

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
    const { name, email, address, is_private, availability_status } = user;

    const profile_img = imageFile ? await uploadImageToSupabase(supabase, imageFile, user.id) : user.profile_img;

    const { data, error } = await supabase
      .from("users")
      .update({
        name,
        email,
        address,
        profile_img,
        is_private,
        availability_status,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating user:", error);
      return;
    }

    setProfileImg(profile_img);
    setProfileStatus(availability_status);

    setUser((prevUser) => ({
      ...prevUser,
      name,
      email,
      address,
      profile_img,
      is_private,
      availability_status,
    }));

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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">User Info</h3>
        <div className={"flex gap-2"}>
          {isMyProfile && (<ActionBtn title="Edit" onClick={handleOpen}/>)}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-md">
        <div className="absolute top-0 bottom-0 left-0 right-0 z-[1] shadow-[inset_0_-40px_40px_-20px_rgba(0,0,0,0.35)]"></div>

        {profileImg ? <img src={`${profileImg}?t=${Date.now()}`} alt={user?.name} /> : <PlaceholderBox height={400} />}

        <div className={"flex gap-2 items-start justify-end absolute top-2 right-2 z-[2]"}>
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

          {user?.verified && (
            <div className="flex items-center text-xs uppercase font-semibold text-indigo-500 bg-indigo-100 rounded-full px-3 py-1">
              <Star size={20} color="#615FFF" className="mr-2" />
              <div>Verified</div>
            </div>
          )}
        </div>


        <div
          style={{ textShadow: `0 0 2px rgba(0,0,0,.2)` }}
          className="text-white font-bold text-xl absolute bottom-3 left-4 z-[2]"
        >
          {isMyProfile ? user?.name : name}
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

              {/*<TextField*/}
              {/*  id="outlined-basic"*/}
              {/*  label="Address"*/}
              {/*  variant="standard"*/}
              {/*  fullWidth*/}
              {/*  name="address"*/}
              {/*  slotProps={{*/}
              {/*    inputLabel: {*/}
              {/*      shrink: true,*/}
              {/*    },*/}
              {/*  }}*/}
              {/*  value={user?.address ? user.address : ""}*/}
              {/*  onChange={handleChange}*/}
              {/*/>*/}
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
