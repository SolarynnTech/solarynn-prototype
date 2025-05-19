import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Slider, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ActionBtn from "@/components/buttons/ActionBtn.jsx";


const ProgressTracker = ({ percentage, isOwner, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(percentage);

  useEffect(() => {
    if (!editing) setValue(percentage);
  }, [percentage, editing]);

  const handleSave = async () => {
    await onSave(value);
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(percentage);
    setEditing(false);
  };

  return (
    <Box mb={3}>
      <Box className={"flex items-center justify-between mb-4"}>
        {!editing ? (
          <>
            <h4 className="font-semibold text-lg">
              {percentage}% Complete
            </h4>
            {isOwner && (
              <IconButton size="small" onClick={() => setEditing(true)}>
                <EditIcon />
              </IconButton>
            )}
          </>
        ) : (
          <>
            <Typography variant="h6">Update Progress</Typography>
            <Box className={"flex gap-2"}>
              <ActionBtn title="Save"  onClick={handleSave}/>
              <ActionBtn title="Cancel"  onClick={handleCancel}/>
            </Box>
          </>
        )}
      </Box>

      {!editing ? (
        <Box height={10} bgcolor="#e0e0e0" borderRadius={5} overflow="hidden">
          <Box width={`${percentage}%`} height="100%" bgcolor="#6366F1" />
        </Box>
      ) : (
        <Slider
          value={value}
          onChange={(e, v) => setValue(v)}
          aria-labelledby="progress-slider"
          valueLabelDisplay="auto"
          min={0}
          max={100}
          sx={{
            height: 8,

            '& .MuiSlider-rail': {
              backgroundColor: '#e0e0e0',
              height: 8,
            },
            '& .MuiSlider-thumb': {
              width: 20,
              height: 20,
              marginTop: 0,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px rgba(46, 125, 50, 0.16)',
              },
            },

          }}
        />
      )}
    </Box>
  );
};

export default ProgressTracker;