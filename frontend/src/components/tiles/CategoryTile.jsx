import React from "react";
import { ChevronRight } from "lucide-react";

const CategoryTile = ({
  title,
  img_url,
  bg_color = "#B4B4B4",
  isSelected = false,
  onClick,
  isAvailable = true,
  isEmpty = false,
  disabled = false,
  level = "main",
}) => {
  return (
    <div
      className={` 
         flex items-center pr-24 rounded-xl py-3 pl-3 relative min-h-14 ease-in transition-transform overflow-hidden bg-white border border-gray-300
        ${isSelected ? "border-indigo-500 bg-indigo-100" : ""} 
        ${disabled ? "opacity-60" : "group hover:border-indigo-500 hover:text-indigo-500 cursor-pointer"} 
        ${!isAvailable ? "!hidden !bg-gray-400 !cursor-default text-gray-700" : ""}
        `}
      onClick={onClick}
    >
      <h4 className="relative z-[2] font-medium">{title}</h4>

      <ChevronRight className="absolute top-1/2 -mt-3 right-2 text-gray-300 group-hover:text-indigo-500" />

      {!isAvailable && (
        <div className="absolute bottom-2 left-2 bg-gray-500 z-[2] text-white px-2 py-0.5 rounded-xl text-xs">
          Coming soon...
        </div>
      )}
    </div>
  );
};

export default CategoryTile;
