import React from "react";
import ActionBtn from "../buttons/ActionBtn";
import Badge from "../Badge";
import PlaceholderBox from "../PlaceholderBox";
import SecondaryBtn from "../buttons/SecondaryBtn";

const UniverseSection = () => {
  const categories = [
    { label: "Family", count: "50" },
    { label: "Friends", count: "50" },
    { label: "Staff", count: "222" },
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Universe</h3>

        <div className="flex items-center">
          <ActionBtn
            title={"See All"}
            onClick={() => {
              // Handle click event
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {categories.map((category) => (
          <Badge
            text={category.label + " " + category.count}
            textColor="gray-800"
            bgColor="gray-100"
          />
        ))}
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar -mx-6 px-6">
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
      </div>

      <SecondaryBtn title="Add" classes="w-full block" />
    </div>
  );

  // <div className="images-container">
  //   <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/61b7cc732e7b43d0c33c655fd44cc19001806d26?placeholderIfAbsent=true" alt="Universe 1" />
  //   <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/5d6495a0ea9f7778a6e4551df9a2f53a4d4e4caa?placeholderIfAbsent=true" alt="Universe 2" />
  //   <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/9aecf03a166d823b345dec1a206a59a7d478f7cc?placeholderIfAbsent=true" alt="Universe 3" />
  // </div>
};

export default UniverseSection;
