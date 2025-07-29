import { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress, Box } from "@mui/material";
import useUserStore from "@/stores/useUserStore.js";

const LocationPicker = () => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const {user, setUser} = useUserStore();

  useEffect(() => {
    const fetchCountries = async () => {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
      const data = await res.json();
      setCountries(data.data.map((c) => c.name).sort());
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!user.country) return;
    setLoadingCities(true);
    const fetchCities = async () => {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: user.country }),
      });
      const data = await res.json();
      setCities(data.data || []);
      setLoadingCities(false);
    };
    fetchCities();
  }, [user.country]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Autocomplete
        options={countries}
        value={user.country || ""}
        name={"country"}
        placeholder="Search your country..."
        onChange={(event, newValue) => {
          setUser((prev) => ({ ...prev, country: newValue, city: "" }));
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#d1d5db" },
            "&:hover fieldset": { borderColor: "#d1d5db" },
            "&.Mui-focused fieldset": {
              borderColor: "#6366f1",
              borderWidth: "1px",
            },
          },
        }}
        renderInput={(params) => <TextField {...params} />}
      />

      <Autocomplete
        options={cities}
        value={user.city || ""}
        name={"city"}
        onChange={(event, newValue) => {
          setUser((prev) => ({ ...prev, city: newValue }));
        }}
        loading={loadingCities}
        disabled={!user.country}
        renderInput={(params) => (
          <TextField
            {...params}
            {...params}
            fullWidth
            placeholder="Search your city..."
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingCities ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#d1d5db" },
                "&:hover fieldset": { borderColor: "#d1d5db" },
                "&.Mui-focused fieldset": {
                  borderColor: "#6366f1",
                  borderWidth: "1px",
                },
              },
            }}
          />
        )}
      />
    </Box>
  );
};

export default LocationPicker;
