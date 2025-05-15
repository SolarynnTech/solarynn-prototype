import React from "react";
import { Box, Chip, Tooltip, ClickAwayListener } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import InfoIcon from "@mui/icons-material/Info";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";
import VisibilitySelect from "@/components/forms/VisibilitySelect.jsx";

const ProjectVisibilitySection = ({
                                    projectVisibility,
                                    isOwner,
                                    editing,
                                    visibilityValue,
                                    tipOpen,
                                    onToggleTip,
                                    onToggleEdit,
                                    onSave,
                                    onCancel,
                                    onChange,
                                  }) => {

  const borderColor =
    projectVisibility === "private" ? "grey.400" :
      projectVisibility === "semi_public" ? "warning.main" :
        "success.main";

  const textColor =
    projectVisibility === "private" ? "grey.800" :
      projectVisibility === "semi_public" ? "warning.dark" :
        "success.main";

  const iconColor =
    projectVisibility === "private" ? undefined :
      projectVisibility === "semi_public" ? "warning.main" :
        "success.main";

  const icon =
    projectVisibility === "private" ? (
      <LockIcon sx={{ fontSize: 24 }}/>
    ) : (
      <PublicIcon sx={{ fontSize: 24 }}/>
    );

  const label = projectVisibility.replace("_", " ");

  const tipMessage =
    projectVisibility === "private"
      ? "If this project is private, only invited users or collaborators can view it."
      : "This project is public—anyone can view it.";

  return (
    <Box mb={3}>
      <Box mb={2} className="!items-center !flex justify-between">
        <h4 className="font-semibold text-lg">
          Project Visibility:
        </h4>
        {isOwner && (
          <Box display="flex" gap={1}>
            {editing ? (
              <>
                <ActionBtn title="Save" onClick={onSave}/>
                <ActionBtn title="Cancel" onClick={onCancel}/>
              </>
            ) : (
              <ActionBtn title="Edit" onClick={onToggleEdit}/>
            )}
          </Box>
        )}
      </Box>

      {isOwner && editing ? (
        <VisibilitySelect
          value={visibilityValue}
          onChange={onChange}
          options={["private", "public"]}
        />
      ) : (
        <ClickAwayListener onClickAway={() => tipOpen && onToggleTip()}>
          <Tooltip
            arrow
            placement="top"
            open={tipOpen}
            onOpen={() => onToggleTip()}
            onClose={() => tipOpen && onToggleTip()}
            title={tipMessage}
          >
            <Box onClick={() => onToggleTip()} sx={{ display: "inline-block", cursor: "pointer", width: "100%" }}>
              <Chip
                icon={icon}
                label={label}
                variant="outlined"
                sx={{
                  py: "18px",
                  width: "100%",
                  textTransform: "capitalize",
                  fontWeight: 500,
                  fontSize: "1rem",
                  borderColor: borderColor,
                  color: textColor,
                  "& .MuiChip-icon": { color: iconColor },
                }}
                deleteIcon={<InfoIcon/>}
              />
            </Box>
          </Tooltip>
        </ClickAwayListener>
      )}
    </Box>
  );
};

export default ProjectVisibilitySection;
