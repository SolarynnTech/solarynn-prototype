import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Typography, Box, Stack } from "@mui/material";
import useUserStore from "@/stores/useUserStore";
import ActionBtn from "../buttons/ActionBtn";
import LocationPicker from "./LocationPicker";

const MyProfileLocation = ({ location }) => {
  const [country, setCountry] = useState(location?.country || null);
  const [city, setCity] = useState(location?.city || null);

  const [originalCountry, setOriginalCountry] = useState(location?.country || null);
  const [originalCity, setOriginalCity] = useState(location?.city || null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { user, setUser } = useUserStore();
  const supabase = useSupabaseClient();

  const toggleEdit = () => {
    setOriginalCountry(country);
    setOriginalCity(city);
    setEditing(true);
  };

  const onCancel = () => {
    setCountry(originalCountry);
    setCity(originalCity);
    setEditing(false);
  };

  const onSave = async () => {
    if (!country?.trim()) {
      setEditing(false);
      return;
    }

    setSaving(true);

    const { data: updated, error } = await supabase
      .from("users")
      .update({
        country: country,
        city: city,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to save location:", error);
    } else {
      setUser((prev) => ({
        ...prev,
        country: updated.country,
        city: updated.city,
      }));
      setEditing(false);
    }

    setSaving(false);
  };

  const handleChange = ({ country, city }) => {
    setCountry(country || null);
    setCity(city || null);
  };

  return (
    <Box className="my-8">
      <div className="flex justify-between items-center w-full">
        <h3 className="font-bold mb-0">My Location</h3>

        <Box display="flex" gap={2}>
          {editing ? (
            <>
              <ActionBtn
                title={saving ? "Saving..." : "Save"}
                disabled={!country || !city || saving}
                onClick={onSave}
              />
              <ActionBtn title="Cancel" onClick={onCancel} />
            </>
          ) : (
            <ActionBtn title="Edit" onClick={toggleEdit} />
          )}
        </Box>
      </div>

      <Box className="mt-4">
        {editing ? (
          <LocationPicker initialCountry={user.country} initialCity={user.city} onChange={handleChange} />
        ) : country && city ? (
          <Stack spacing={2}>
            <Box>
              <Typography className="text-sm text-gray-500">Country</Typography>
              <Typography className="text-gray-700 font-medium">{country}</Typography>
            </Box>

            <Box>
              <Typography className="text-sm text-gray-500">City</Typography>
              <Typography className="text-gray-700 font-medium">{city}</Typography>
            </Box>
          </Stack>
        ) : (
          <Typography className="text-gray-500 italic">
            You haven’t added a location yet. <br />
            Click Edit to update.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MyProfileLocation;
