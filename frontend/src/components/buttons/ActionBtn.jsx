import React from "react";
import clsx from "clsx";

const ActionBtn = ({
  title,
  type = "button",
  onClick,
  disabled = false,
  classes = "",
  icon = null,
}) => {
  return (
    <button
      onClick={(event) => {
        onClick?.(event);
      }}
      type={type}
      disabled={disabled}
      className={clsx(
        "rounded-[24px] px-4 py-1.5 text-sm font-semibold text-center inline-flex items-center whitespace-nowrap transition-colors duration-200",
        disabled
          ? "text-gray-400 border border-gray-600"
          : "text-indigo-500 bg-white hover:bg-gray-100 border-none cursor-pointer",
        classes
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </button>
  );
};

export default ActionBtn;
