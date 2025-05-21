import { DatePicker } from "@mui/x-date-pickers";
import { useState } from "react";
import clsx from "clsx";
import TextField from "@mui/material/TextField";

const LabeledDatePicker = ({ label, value, onChange, message, required = false, disabled = false }) => {
  const [isFocused, setIsFocused] = useState(false);

  const floatLabel = isFocused || !!value;

  return (
    <div className="relative mb-4 pt-4">
      <DatePicker
        value={value}
        onChange={onChange}
        onOpen={() => setIsFocused(true)}
        onClose={() => setIsFocused(false)}
        sx={{ width: "100%" }}
        disabled={disabled}
        slots={{ textField: TextField }}
        slotProps={{
          textField: {
            required,
            variant: "standard",
            fullWidth: true,
            InputLabelProps: { shrink: false },
            inputProps: {
              className: "placeholder-transparent",
            },
            InputProps: {
              disableUnderline: true,
              className:
                "w-full border border-gray-300 rounded-lg p-2 bg-white text-black focus:outline-none focus:border-indigo-500",
            },
          },
        }}
      />
      <label
        className={clsx(
          "absolute left-3 transition-all duration-200 pointer-events-none bg-white px-1",
          floatLabel ? "top-2 text-xs text-gray-600" : "top-[30px] text-md text-gray-500"
        )}
      >
        {label}
      </label>
      {message && (
      <p className="pt-1 text-xs text-gray-500">{message}</p>
      )}
    </div>
  );
};

export default LabeledDatePicker;