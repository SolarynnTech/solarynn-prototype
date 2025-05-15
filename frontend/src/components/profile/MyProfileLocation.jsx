import { useEffect, useState } from "react";
import { TextField, Typography, Box, Button } from "@mui/material";
import ActionBtn from "../buttons/ActionBtn";

const MyProfileLocation = ({ location }) => {
  const [country, setCountry] = useState(location || null);
  const [editing, setEditing] = useState(false);

  const toggleEdit = () => {
    setEditing(!editing);
  };

  return (
    <Box className="my-8">
      <div className="flex justify-between items-center w-full">
        <h3 className="font-bold mb-0">My Location</h3>

        <Box display="flex" gap={2}>
          {editing ? (
            <>
              <ActionBtn title="Save" />
              <ActionBtn title="Cancel" onClick={toggleEdit} />
            </>
          ) : (
            <ActionBtn title="Edit" onClick={toggleEdit} />
          )}
        </Box>
      </div>

      <Box className="mt-4">
        {!editing &&
          (country ? (
            <Typography className="text-gray-700">{country}</Typography>
          ) : (
            <Typography className="text-gray-500 italic">
              You haven’t added a location yet. <br />
              Click Edit to add one.
            </Typography>
          ))}
      </Box>
    </Box>
  );
};

export default MyProfileLocation;
