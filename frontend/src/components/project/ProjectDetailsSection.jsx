import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
} from "@mui/material";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";

const ProjectDetails = ({
                          answersBySection,
                          sectionTitles,
                          currentFormPage,
                          onPageChange,
                          isOwner,
                          onSave
                        }) => {
  const currentTitle = sectionTitles[currentFormPage];
  const currentAnswers = answersBySection[currentTitle] || [];

  const [editing, setEditing] = useState(false);
  const [localBySection, setLocal] = useState({});

  const startEditing = () => {
    setLocal(answersBySection);
    setEditing(true);
  };

  const draft = editing
    ? localBySection[currentTitle]
    : currentAnswers;

  const handleChange = (id, newVal) => {
    setLocal(prev => ({
      ...prev,
      [currentTitle]: prev[currentTitle].map(item =>
        item.id === id ? { ...item, value: newVal } : item
      )
    }));
  };

  const handleSectionChange = async (newIdx) => {
    if (editing) {
      await onSave(currentTitle, draft);
    }
    onPageChange(newIdx);
  };

  const handleSave = async () => {
    await onSave(currentTitle, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <Box mb={4}>
      <Box className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg">
          Details
        </h4>
        {isOwner && !editing && (
          <ActionBtn title={"Edit"} onClick={startEditing}/>
        )}
      </Box>

      <Box sx={{
        p: 3, bgcolor: "grey.100", borderRadius: 1,
        boxShadow: 1, mb: 2, border: "1px solid", borderColor: "grey.300"
      }}>
        {draft.map(({ id, question, value }, idx) => (
          <Box
            key={id}
            sx={{
              mb: 2, pb: 2, borderBottom: 1, borderColor: "grey.300",
              ...(idx === draft.length - 1 && {
                mb: 0, pb: 0, borderBottom: 0
              })
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: "bold", fontSize: 14 }}
            >
              {question}
            </Typography>

            {editing ? (
              <TextField
                fullWidth
                variant="standard"
                value={value}
                onChange={e => handleChange(id, e.target.value)}
              />
            ) : (
              <Typography>
                {Array.isArray(value) ? value.join(", ") : value}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {sectionTitles.length > 1 && (
        <Box sx={{ display: "flex", gap: 1, overflowX: "auto", py: 1 }}>
          {sectionTitles.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => handleSectionChange(idx)}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor:
                  currentFormPage === idx ? "#6366F1" : "#e0e0e0",
                cursor: "pointer"
              }}
            />
          ))}
        </Box>
      )}

      {editing && (
        <Box className="flex gap-2 mt-2">
          <ActionBtn title={"Save"} onClick={handleSave}/>
          <ActionBtn title={"Cancel"} onClick={handleCancel}/>
        </Box>
      )}
    </Box>
  );
};

export default ProjectDetails;


