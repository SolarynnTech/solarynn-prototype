import React, { useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FlagIcon from "@mui/icons-material/Flag";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";
import { Snackbar } from "@mui/material";

const EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

const ProjectImage = ({
                        imgUrl,
                        isFav,
                        onToggleFav,
                        onReport,
                        alertsEnabled,
                        onToggleAlerts,
                        onImageClick
                      }) => {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL);
    setSnackbarOpen(true);
  };

  return (
    <Box className="relative">
      <img
        src={imgUrl}
        alt="Preview"
        className="mt-2 rounded-md w-full h-auto max-h-[400px] object-contain"
        onClick={onImageClick}
        style={{ cursor: onImageClick ? "pointer" : "default" }}
      />

      <Stack
        spacing={1}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          bgcolor: "rgba(255,255,255,0.8)",
          p: 1,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}
      >
        <Tooltip title="Save to Favorites">
          <IconButton size="small" onClick={onToggleFav} sx={{ color: "#6366F1" }}>
            {isFav ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
          </IconButton>
        </Tooltip>

        <Tooltip title="Report">
          <IconButton
            sx={{ color: "#d32f2f" }}
            onClick={() => {
              window.location.href = `mailto:${EMAIL}?subject=Project%20Report`;
              setTimeout(() => setOpen(true), 1000);
            }}
          >
            <FlagIcon/>
          </IconButton>
        </Tooltip>

        <Tooltip title="Receive Alerts">
          <IconButton size="small" onClick={onToggleAlerts} sx={{ color: "#f9a825" }}>
            {alertsEnabled ? <NotificationsActiveIcon/> : <NotificationsOffIcon/>}
          </IconButton>
        </Tooltip>
      </Stack>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Copied to clipboard!"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{
        sx: {
          width: 370,
          maxWidth: "90vw"
        }
      }}>
        <DialogTitle className="!font-semibold !text-lg">
          Unable to open your mail client?
        </DialogTitle>
        <DialogContent>
          <Typography className="!text-sm">
            Please copy the address below and send an email manually:
          </Typography>
          <Box
            mt={2}
            mb={2}
            sx={{
              p: 1,
              bgcolor: "#f5f5f5",
              borderRadius: 1,
              fontFamily: "monospace",
            }}
          >
            {EMAIL}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <ActionBtn
              title="Copy to clipboard"
              onClick={handleCopy}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProjectImage;

