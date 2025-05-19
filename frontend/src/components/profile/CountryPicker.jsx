import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress, Box, Typography, Avatar } from "@mui/material";

const CountryPicker = ({ value, onChange }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags");
        const data = await res.json();
        const mapped = data.map((c) => ({
          name: c.name.common,
          code: c.cca2,
          flag: c.flags.svg,
        }));
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(mapped);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (!countries.length || !value) return;

    const matched = countries.find(
      (c) => c.code.toLowerCase() === value.toLowerCase() || c.name.toLowerCase() === value.toLowerCase()
    );

    if (matched) {
      setSelected(matched);
    }
  }, [countries, value]);

  useEffect(() => {
    if (countries.length > 0) {
      setOpen(true);
    }
  }, [countries]);

  const handleChange = (_, newValue) => {
    setSelected(newValue);
    if (onChange) {
      onChange(newValue);
      setOpen(false);
    }
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={countries}
      getOptionLabel={(option) => option.name}
      loading={loading}
      value={selected}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          placeholder="Search your country..."
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
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
      renderOption={(props, option) => {
        const { key, ...rest } = props;

        return (
          <Box component="li" key={key} {...rest} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar src={option.flag} alt={option.name} sx={{ width: 24, height: 24 }} />
            <Typography>{option.name}</Typography>
          </Box>
        );
      }}
    />
  );
};

export default CountryPicker;
