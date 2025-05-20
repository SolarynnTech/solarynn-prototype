import { useState } from "react";
import { Backdrop, Box, Fade, Modal, TextField, Typography } from "@mui/material";
import SecondaryBtn from "../buttons/SecondaryBtn";
import PrimaryBtn from "../buttons/PrimaryBtn";
import { MessageSquareWarning } from "lucide-react";

const ReportProfile = () => {
  const [open, setOpen] = useState(false);
  const [complaint, setComplaint] = useState("");

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

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSubmit = (value) => {
    console.log("send");
    setOpen(false);
  };

  const handleChange = (event) => {
    setComplaint(event.target.value);
  };

  return (
    <>
      <button type="button" onClick={handleOpen}>
        <MessageSquareWarning />
      </button>

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
            <Box sx={{ mb: 2 }}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Submit a Report About This Profile
              </Typography>
            </Box>

            <TextField
              name="complaint"
              placeholder="Describe the issue or concern you want to report..."
              fullWidth
              multiline
              minRows={3}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              value={complaint}
              onChange={handleChange}
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
            <div className="flex justify-end mt-8 gap-2">
              <SecondaryBtn title={"Cancel"} onClick={handleClose} />
              <PrimaryBtn disabled={!complaint} title={"Submit"} onClick={handleSubmit} />
            </div>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default ReportProfile;
