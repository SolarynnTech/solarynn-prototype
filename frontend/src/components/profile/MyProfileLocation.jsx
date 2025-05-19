import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Typography, Box } from "@mui/material";
import useUserStore from "@/stores/useUserStore";
import ActionBtn from "../buttons/ActionBtn";
import CountryPicker from "./CountryPicker";

const MyProfileLocation = ({ location }) => {
  const [countryName, setCountryName] = useState(location || null);
  const [originalCountry, setOriginalCountry] = useState(location || null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, setUser } = useUserStore();
  const supabase = useSupabaseClient();

  const toggleEdit = () => {
    setOriginalCountry(countryName);
    setEditing(true);
  };

  const onCancel = () => {
    setCountryName(originalCountry);
    setEditing(false);
  };

  const onSave = async () => {
    if (!countryName || countryName.trim() === "") {
      setEditing(false);
      return;
    }

    setSaving(true);

    const { data: updated, error } = await supabase
      .from("users")
      .update({ country: countryName })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to save country:", error);
    } else {
      setUser((prev) => ({ ...prev, country: updated.country }));
      setEditing(false);
    }

    setSaving(false);
  };

  const handleCountryChange = (country) => {
    setCountryName(country?.name || null);
  };

  return (
    <Box className="my-8">
      <div className="flex justify-between items-center w-full">
        <h3 className="font-bold mb-0">My Location</h3>

        <Box display="flex" gap={2}>
          {editing ? (
            <>
              <ActionBtn title={saving ? "Saving..." : "Save"} disabled={!countryName || saving} onClick={onSave} />
              <ActionBtn title="Cancel" onClick={onCancel} />
            </>
          ) : (
            <ActionBtn title="Edit" onClick={toggleEdit} />
          )}
        </Box>
      </div>

      <Box className="mt-4">
        {editing ? (
          <CountryPicker value={countryName} onChange={handleCountryChange} />
        ) : countryName ? (
          <Typography className="text-gray-700">{countryName}</Typography>
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
