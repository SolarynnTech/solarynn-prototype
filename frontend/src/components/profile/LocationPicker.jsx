import { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress, Box } from "@mui/material";

const LocationPicker = ({ onChange, initialCountry = "", initialCity = "" }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
      const data = await res.json();
      setCountries(data.data.map((c) => c.name).sort());
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    setLoadingCities(true);
    const fetchCities = async () => {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry }),
      });
      const data = await res.json();
      setCities(data.data || []);
      setLoadingCities(false);
    };
    fetchCities();
  }, [selectedCountry]);

  useEffect(() => {
    onChange?.({ country: selectedCountry, city: selectedCity });
  }, [selectedCountry, selectedCity]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Autocomplete
        options={countries}
        value={selectedCountry}
        placeholder="Search your country..."
        onChange={(e, value) => {
          setSelectedCountry(value);
          setSelectedCity("");
        }}
        renderInput={(params) => <TextField {...params} />}
      />

      <Autocomplete
        options={cities}
        value={selectedCity}
        onChange={(e, value) => setSelectedCity(value)}
        loading={loadingCities}
        disabled={!selectedCountry}
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
                "& fieldset": { borderColor: "#000" },
                "&:hover fieldset": { borderColor: "#000" },
                "&.Mui-focused fieldset": {
                  borderColor: "#000",
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
