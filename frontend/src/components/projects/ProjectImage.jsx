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

const ProjectImage = () => {
  const [open, setOpen] = React.useState(false);

  const [project, setProject] = React.useState({
    name: "",
    project_image: "",
    verified: false,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProject({ ...project, [name]: value });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
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
    <div className="mb-6 -mx-6 p-6 bg-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Project Info</h3>
        <ActionBtn title="Edit" onClick={handleOpen} />
      </div>

      <div className="relative overflow-hidden rounded-md">
        <div className="absolute top-0 bottom-0 left-0 right-0 z-[1] shadow-[inset_0_-40px_40px_-20px_rgba(0,0,0,0.35)]"></div>

        {project.project_image ? (
          <img src={project.project_image} alt={project.name} />
        ) : (
          <PlaceholderBox height={400} />
        )}

        {project.verified && (
          <div className="flex items-center text-sm uppercase font-semibold text-green-800 bg-green-100 rounded-full px-4 py-1.5 absolute top-4 right-4">
            <Star size={20} color="#087B43" className="mr-2" />
            <div>Verified</div>
          </div>
        )}

        <div className="text-white font-bold text-xl absolute bottom-4 left-4">
          {project.name}
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
              Edit Project
            </Typography>

            <Stack spacing={2}>
              <TextField
                id="outlined-basic"
                label="Name"
                variant="outlined"
                fullWidth
                name="name"
                value={project.name}
                onChange={handleChange}
              />
              <TextField
                id="outlined-basic"
                label="Address"
                variant="outlined"
                fullWidth
                name="address"
                value={project.project_image}
                onChange={handleChange}
              />
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default ProjectImage;
