import React from "react";
import ActionBtn from "../buttons/ActionBtn";
import PlaceholderBox from "../PlaceholderBox";

const AlbumsSection = () => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Albums</h3>

        <div className="flex items-center">
          <ActionBtn
            title={"See All"}
            onClick={() => {
              // Handle click event
            }}
          />
        </div>
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar -mx-6 px-6">
        <PlaceholderBox height={300} width={200} />
        <PlaceholderBox height={300} width={200} />
        <PlaceholderBox height={300} width={200} />
        <PlaceholderBox height={300} width={200} />
      </div>
    </div>
  );
};

export default AlbumsSection;
