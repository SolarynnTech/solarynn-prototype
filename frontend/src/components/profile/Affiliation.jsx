import ActionBtn from "../buttons/ActionBtn";
import React from "react";
import SecondaryBtn from "../buttons/SecondaryBtn";
import PlaceholderBox from "../PlaceholderBox";

const Affiliation = ({ affiliation }) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Affiliation</h3>

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
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
      </div>

      <SecondaryBtn title="Add" classes="w-full block" />
    </div>
  );
};

export default Affiliation;
