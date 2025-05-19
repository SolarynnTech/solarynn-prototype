
import React from 'react';

const LabeledInput = ({ label, type = "input", name, required = false, value, onChange, placeholder = value }) => {

  return (
    <div className="flex flex-col mb-6">
      <label htmlFor={name} className="text-md font-bold mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="border text-black bg-white border-black
        rounded-lg p-3 focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}

export default LabeledInput;