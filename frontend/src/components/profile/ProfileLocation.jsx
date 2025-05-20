import { Typography, Box } from "@mui/material";

const ProfileLocation = ({ location }) => {
  return (
    <Box className="my-8">
      <div className="flex justify-between items-center w-full">
        <h3 className="font-bold mb-0">Location</h3>
      </div>
      <Box className="mt-4">
        <Typography className="text-gray-700">{location}</Typography>
      </Box>
    </Box>
  );
};

export default ProfileLocation;
