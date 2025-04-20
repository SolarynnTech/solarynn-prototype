import React from "react";
import clsx from "clsx";

const PrimaryBtn = ({
  title,
  type = "button",
  onClick,
  disabled = false,
  classes = "",
}) => {
  return (
    <button
      onClick={(event) => {
        onClick?.(event);
      }}
      type={type}
      disabled={disabled}
      className={clsx(
        "rounded-[24px]  px-6 py-3 text-[16px] font-semibold text-center leading-[1.3]",
        disabled
          ? "text-gray-400 border border-gray-600"
          : "text-gray-100 bg-green-800 hover:bg-green-900 border-none cursor-pointer",
        classes
      )}
    >
      {title}
    </button>
  );
};

export default PrimaryBtn;
