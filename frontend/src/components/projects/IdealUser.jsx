import React from "react";
import ActionBtn from "../buttons/ActionBtn";
import { CircleDollarSign } from "lucide-react";

const tiles = [
  {
    title: "Entertainment & Media",
    img_url: "/images/categories/main/public_figures.png",
    bg_color: "#F29797",
    budgetTotal: 500,
    budgetUsed: 300,
  },
  {
    title: "Fashion & Modeling",
    img_url: "/images/categories/main/fashion_brands.png",
    bg_color: "#AEF3B5",
    budgetTotal: 500,
    budgetUsed: 300,
  },
  {
    title: "Entertainment & Media",
    img_url: "/images/categories/main/media_publications.png",
    bg_color: "#B4D6E7",
    budgetTotal: 500,
    budgetUsed: 300,
  },
];

const Tile = ({
              title,
              img_url = "/images/categories/empty.png",
              bg_color = "#B4B4B4",
              isSelected = false,
              onClick,
              isEmpty = false,
              disabled = false,
              budgetTotal = 0,
              budgetUsed = 0,
              level = "main",
            }) => {
  return (
    <div
      className={` 
        ${isSelected ? "shadow-[0_0_0_2px_#166534]" : ""} 
        ${disabled ? "opacity-60" : "hover:scale-105 cursor-pointer"} 
        ${isEmpty ? "items-center" : "items-start"} 
         w-full mb-4 pr-24 rounded-lg py-3 pl-3 relative h-24 ease-in transition-transform overflow-hidden`}
      onClick={onClick}
      style={{ backgroundColor: bg_color }}
    >
      <h5 className="relative z-[2] mb-2">{title}</h5>

      <div className={"flex items-center mb-2 text-sm"}>
        <CircleDollarSign size={16} className={"mr-1"} />
        <span>Budget: ${budgetUsed} / ${budgetTotal}</span>
      </div>

      <div className={"relative h-2 w-full bg-gray-200 rounded-full"}>
        <div className={"absolute top-0 left-0 h-full bg-gray-950 rounded-full"} style={{ width: `${(budgetUsed / budgetTotal) * 100}%` }}></div>
      </div>

      <div className="flex justify-end items-end absolute z-[1] bottom-0 right-0 w-20 h-20">
        <img className={"max-h-full"} src={img_url} alt={title} />
      </div>
    </div>
  );
};

const IdealUser = () => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Who is your ideal user?</h3>

        <div className="flex items-center">
          <ActionBtn
            title={"See All"}
            onClick={() => {
              // Handle click event
            }}
          />
        </div>
      </div>

      <div className="mb-4">
        {tiles.map((tile, index) => (
          <Tile
            key={index}
            title={tile.title}
            img_url={tile.img_url}
            bg_color={tile.bg_color}
            budgetTotal={tile.budgetTotal}
            budgetUsed={tile.budgetUsed}
          />
        ))}

      </div>
    </div>
  );
};

export default IdealUser;
