import React from "react";
import { MenuItem, TextField } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const VisibilitySelect = ({ value, onChange, options }) => {
  const selectStyles = {
    "& .MuiInput-underline:before": { borderBottomColor: "#000" },
    "& .MuiInput-underline:hover:before": { borderBottomColor: "#000" },
    "& .MuiInput-underline.Mui-focused:after": {
      borderBottomColor: "#000",
      borderBottomWidth: 2,
    },
    "& .MuiSelect-select": { pr: 4 },
  };


  return (
    <TextField
      select
      variant="standard"
      fullWidth
      value={value}
      onChange={onChange}
      SelectProps={{
        IconComponent: ArrowDropDownIcon,
        sx: { right: 0, position: "absolute" },
      }}
      sx={selectStyles}
    >
      {options.map(opt => (
        <MenuItem key={opt} value={opt} >
          {opt}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default VisibilitySelect;