import React from "react";
import { Star } from "lucide-react";
import ActionBtn from "../buttons/ActionBtn";
import {
  Backdrop,
  Box,
  Fade,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PlaceholderBox from "../PlaceholderBox";
import useUserStore from "@/stores/useUserStore";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const ProfileImage = () => {
  const [open, setOpen] = React.useState(false);
  const supabase = useSupabaseClient();
  const { user, setUser } = useUserStore();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setUser({
      ...user,
      [name]: value,
    });

    console.log("User data updated:", user);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, address } = user;

    const { data, error } = await supabase
      .from("users")
      .update({ name, email, phone, address })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating user:", error);
      return;
    }

    setOpen(false);
  }

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
    <div className="mb-6 -mx-6 p-6 bg-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">User Info</h3>
        <ActionBtn title="Edit" onClick={handleOpen} />
      </div>

      <div className="relative overflow-hidden rounded-md">
        <div className="absolute top-0 bottom-0 left-0 right-0 z-[1] shadow-[inset_0_-40px_40px_-20px_rgba(0,0,0,0.35)]"></div>

        {user?.profile_image ? (
          <img src={user.profile_image} alt={user.name} />
        ) : (
          <PlaceholderBox height={400} />
        )}

        {user?.verified && (
          <div className="flex items-center text-sm uppercase font-semibold text-green-800 bg-green-100 rounded-full px-4 py-1.5 absolute top-4 right-4">
            <Star size={20} color="#087B43" className="mr-2" />
            <div>Verified</div>
          </div>
        )}

        <div className="text-white font-bold text-xl absolute bottom-4 left-4">
          {user?.name}
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
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Edit Profile
            </Typography>

            <Stack spacing={2}>
              <TextField
                id="outlined-basic"
                label="Name"
                variant="standard"
                fullWidth
                name="name"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                value={user?.name ? user.name : ""}
                onChange={handleChange}
              />
              <TextField
                id="outlined-basic"
                label="Email"
                variant="standard"
                fullWidth
                name="email"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                value={user?.email ? user.email : ""}
                onChange={handleChange}
              />
              <TextField
                id="outlined-basic"
                label="Phone Number"
                variant="standard"
                fullWidth
                name="phone"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                value={user?.phone ? user.phone : ""}
                onChange={handleChange}
              />
              <TextField
                id="outlined-basic"
                label="Address"
                variant="standard"
                fullWidth
                name="address"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                value={user?.address ? user.address : ""}
                onChange={handleChange}
              />
            </Stack>
            <div className="flex justify-end mt-8 gap-2">
              <SecondaryBtn title={"Cancel"} onClick={handleClose} />
              <PrimaryBtn title={"Save"} onClick={handleSubmit}/>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default ProfileImage;
