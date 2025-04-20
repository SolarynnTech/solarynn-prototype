import React from "react";
import clsx from "clsx";

const SecondaryBtn = ({
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
      disabled={disabled}
      type={type}
      className={clsx(
        "rounded-[24px] bg-transparent px-6 py-3 text-[16px] font-semibold text-center leading-[1.3] border",
        disabled
          ? "text-gray-400 border border-gray-600"
          : "text-green-800 hover:bg-green-100 transition-colors border-green-800 hover:border-green-900 cursor-pointer",
        classes
      )}
    >
      {title}
    </button>
  );
};

export default SecondaryBtn;
