import React from "react";

const CategoryTile = ({
  title,
  img_url,
  bg_color = "#B4B4B4",
  isSelected = false,
  onClick,
  isEmpty = false,
  disabled = false,
  level = "main",
}) => {
  return (
    <div
      className={` 
        ${isSelected ? "shadow-[0_0_0_2px_#166534]" : ""} 
        ${disabled ? "opacity-60" : "hover:scale-105 cursor-pointer"} 
        ${isEmpty ? "items-center" : "items-start"} 
        flex pr-24 rounded-lg py-3 pl-3 relative h-24 ease-in transition-transform overflow-hidden`}
      onClick={onClick}
      style={{ backgroundColor: bg_color }}
    >
      <h5 className="relative z-[2]">{title}</h5>

      <div className="flex justify-end items-end absolute z-[1] bottom-0 right-0 w-20 h-20">
        <img className={`max-h-full ${!img_url ? "opacity-30" : ""}`} src={img_url || "/images/categories/empty.png"} alt={title} />
      </div>
    </div>
  );
};

export default CategoryTile;
