import React from "react";

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
        ${isSelected ? "shadow-[0_0_0_2px_#166534]" : ""} 
        ${disabled ? "opacity-60" : "hover:scale-105 cursor-pointer"} 
        ${!isAvailable ? "!hidden !bg-gray-400 !scale-100 !cursor-default text-gray-700" : ""} 
        ${isEmpty ? "items-center" : "items-start"} 
        flex pr-24 rounded-lg py-3 pl-3 relative h-24 ease-in transition-transform overflow-hidden`}
      onClick={onClick}
      style={{ backgroundColor: bg_color }}
    >
      <h5 className="relative z-[2]">{title}</h5>

      <div className="flex justify-end items-end absolute z-[1] bottom-0 right-0 w-20 h-20">
        <img className={`max-h-full ${!img_url ? "opacity-30" : ""}`} src={img_url || "/images/categories/empty.png"} alt={title} />
      </div>
      {!isAvailable && (
        <div className="absolute bottom-2 left-2 bg-gray-500 z-[2] text-white px-2 py-0.5 rounded-xl text-xs">
          Coming soon...
        </div>
      )}
    </div>
  );
};

export default CategoryTile;
