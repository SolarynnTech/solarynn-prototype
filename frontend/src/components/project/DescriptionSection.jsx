import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
} from "@mui/material";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";

const ProjectDescription = ({
                              description,
                              budget,
                              isOwner,
                              onSave,
                            }) => {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(description || "");
  const [bud, setBud] = useState(budget);

  useEffect(() => {
    setDesc(description || "");
    setBud(budget);
  }, [description, budget]);

  const handleSave = () => {
    onSave({ description: desc, budget: bud });
    setEditing(false);
  };

  const handleCancel = () => {
    setDesc(description || "");
    setBud(budget);
    setEditing(false);
  };

  return (
    <Box className={"mb-2"}>
      <Box className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg">
          Description
        </h4>
        {isOwner && !editing && (
          <ActionBtn title="Edit" onClick={() => setEditing(true)}/>
        )}
      </Box>

      {editing ? (
        <TextField
          multiline
          rows={4}
          variant="standard"
          fullWidth
          value={desc}
          onChange={e => setDesc(e.target.value)}
          sx={{
            "& .MuiInput-underline:before": {
              borderBottom: "1px solid #000",
            },
            "& .MuiInput-underline:after": {
              borderBottom: "1px solid #000",
            }
          }}
        />
      ) : desc ? (
        <p>
          {desc}
        </p>
      ) : (
        <p className="text-gray-400 text-center !text-sm">
          {isOwner
            ? "You haven’t added a project description yet."
            : "There is no description available for this project."}
        </p>
      )
      }

      <Box className="flex justify-between items-center mt-6 mb-4">
        <h4 className="font-semibold text-lg">
          Budget
        </h4>
        {editing ? (
          <TextField
            type="number"
            variant="standard"
            value={bud}
            onChange={e => setBud(Number(e.target.value))}
            InputProps={{ endAdornment: <Typography>$</Typography> }}
            sx={{
              "& .MuiInput-underline:before": {
                borderBottom: "1px solid #000",
              },
              "& .MuiInput-underline:after": {
                borderBottom: "1px solid #000",
              }
            }}
          />
        ) : (
          <Typography>{bud}$</Typography>
        )}
      </Box>

      {editing && (
        <Box className="flex gap-2">
          <ActionBtn title="Save" onClick={handleSave}/>
          <ActionBtn title="Cancel" onClick={handleCancel}/>
        </Box>
      )}
    </Box>
  );
};

export default ProjectDescription;
