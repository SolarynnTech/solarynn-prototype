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
        "rounded-[24px] px-6 py-2 text-sm font-semibold text-center inline-flex items-center whitespace-nowrap",
        disabled
          ? "text-gray-400 border border-gray-600"
          : "text-green-800 bg-gray-100 hover:bg-gray-200 border-none cursor-pointer shadow-[0_1px_1px_rgba(0,0,0,0.15)]",
        classes
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </button>
  );
};

export default ActionBtn;
