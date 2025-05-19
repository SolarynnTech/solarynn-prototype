import React, { useState } from 'react';
import clsx from 'clsx';

const LabeledInput = ({
                        label,
                        type = "text",
                        name,
                        required = false,
                        value,
                        onChange,
                        disabled = false,
                        placeholder = "",
                      }) => {
  const [isFocused, setIsFocused] = useState(false);

  const floatLabel = isFocused || value;

  return (
    <div className="relative mb-4 pt-4">
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        required={required}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={clsx(
          "w-full border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-indigo-500",
          "placeholder-transparent"
        )}
        placeholder={label}
      />
      <label
        htmlFor={name}
        className={clsx(
          "absolute left-3 transition-all duration-200 pointer-events-none bg-white px-1",
          floatLabel ? "top-2 text-xs text-gray-600" : "top-[30px] text-md text-gray-500"
        )}
      >
        {label}
      </label>
    </div>
  );
};

export default LabeledInput;