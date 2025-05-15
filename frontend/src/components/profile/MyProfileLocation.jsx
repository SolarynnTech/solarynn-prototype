import { useState } from "react";
import { Typography, Box } from "@mui/material";
import ActionBtn from "../buttons/ActionBtn";
import CountryPicker from "./CountryPicker";

const MyProfileLocation = ({ location }) => {
  const [country, setCountry] = useState(location || null);
  const [editing, setEditing] = useState(false);

  const toggleEdit = () => {
    setEditing(!editing);
  };

  const onSave = () => {
    setEditing(false);
  };

  const handleCountryChange = (country) => {
    setCountry(country?.name || null);
  };

  return (
    <Box className="my-8">
      <div className="flex justify-between items-center w-full">
        <h3 className="font-bold mb-0">My Location</h3>

        <Box display="flex" gap={2}>
          {editing ? (
            <>
              <ActionBtn title="Save" disabled={!country} onClick={onSave} />
              <ActionBtn title="Cancel" onClick={toggleEdit} />
            </>
          ) : (
            <ActionBtn title="Edit" onClick={toggleEdit} />
          )}
        </Box>
      </div>

      <Box className="mt-4">
        {editing ? (
          <CountryPicker onChange={handleCountryChange} />
        ) : country ? (
          <Typography className="text-gray-700">{country}</Typography>
        ) : (
          <Typography className="text-gray-500 italic">
            You haven’t added a location yet. <br />
            Click Edit to add one.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MyProfileLocation;
