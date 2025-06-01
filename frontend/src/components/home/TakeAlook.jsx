import React from "react";
import ActionBtn from "../buttons/ActionBtn";
import PlaceholderBox from "../PlaceholderBox";
import { Shuffle } from "lucide-react";

const TakeALook = () => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">You Should Have A Look</h3>

        <div className="flex items-center">
          <ActionBtn
            title={"Shuffle"}
            icon={<Shuffle size={16} />}
            onClick={() => {
              // Handle click event
            }}
          />
        </div>
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar custom-scrollbar -mx-6 px-6">
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
        <PlaceholderBox height={150} width={150} />
      </div>
    </div>
  );
};

export default TakeALook;
