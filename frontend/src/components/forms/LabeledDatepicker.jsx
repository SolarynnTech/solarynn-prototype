import { MobileDatePicker } from "@mui/x-date-pickers";
import { useState, useRef } from "react";
import clsx from "clsx";
import TextField from "@mui/material/TextField";

const LabeledDatePicker = ({
                             label,
                             value,
                             onChange,
                             message,
                             required = false,
                             disabled = false,
                           }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputWrapperRef = useRef(null);
  const floatLabel = isFocused || !!value;

  return (
    <div
      className="relative mb-4 pt-4"
      ref={inputWrapperRef}
      onClick={() => {
        if (!disabled) setIsFocused(true); // Just toggle label
      }}
    >
      <MobileDatePicker
        value={value}
        onChange={(val) => {
          console.log("onChange:", val);
          onChange(val);
        }}
        onClose={() => {
          console.log("Date picker closed");
          setIsFocused(false);
        }}
        onAccept={(val) => {
          console.log("Accepted:", val);
        }}
        disabled={disabled}
        slotProps={{
          textField: {
            required,
            variant: "standard",
            fullWidth: true,
            InputLabelProps: { shrink: false },
            onClick: (e) => {
              e.stopPropagation();
            },
            placeholder: " ",
            inputProps: {
              readOnly: true,
              style: { color: "black", cursor: "pointer" },
              className: "placeholder-transparent focus:placeholder-transparent",
            },
            InputProps: {
              disableUnderline: true,
              className:
                "w-full border border-gray-300 rounded-lg !p-2 bg-white text-black focus:outline-none focus:border-indigo-500 cursor-pointer", // 👈 Restore padding and border here
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