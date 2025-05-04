import React from "react";
import ActionBtn from "../buttons/ActionBtn";
import PlaceholderBox from "../PlaceholderBox";
import useUserStore from "@/stores/useUserStore";
import UserPreview from "@/components/UserPreview";

const RecentlyViewed = () => {

  const {user } = useUserStore();

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Recently Viewed</h3>

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

        {user?.recently_viewed?.length > 0 ? (
          user?.recently_viewed?.map((user, index) => (
            <UserPreview
              key={index}
              name={user.name}
              img_url={user.profile_img}
              onClick={() => {
                // Handle click event
              }}
            />
          ))
        ) : (
          <>
            <PlaceholderBox height={150} width={150} />
            <PlaceholderBox height={150} width={150} />
            <PlaceholderBox height={150} width={150} />
            <PlaceholderBox height={150} width={150} />
            <PlaceholderBox height={150} width={150} />
          </>
        )}

      </div>
    </div>
  );
};

export default RecentlyViewed;
