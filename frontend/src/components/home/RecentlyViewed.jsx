import React from "react";
import ActionBtn from "../buttons/ActionBtn";
import PlaceholderBox from "../PlaceholderBox";
import useUserStore from "@/stores/useUserStore";
import UserPreview from "@/components/UserPreview";
import useProfilesStore from "@/stores/useProfilesStore";
import { useRouter } from "next/router";

const RecentlyViewed = () => {

  const {user } = useUserStore();
  const {profiles} = useProfilesStore();
  const [recentlyViewed, setRecentlyViewed] = React.useState([]);
  const router = useRouter();

  React.useEffect(() => {
    if(!profiles?.length || !user?.id) return;
    if (user?.recently_viewed) {
      const viewedProfiles = user.recently_viewed.map((id) => {
        return profiles.find((profile) => profile.id === id);
      });
      setRecentlyViewed(viewedProfiles);
    }
  }, [user?.id, profiles]);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Recently Viewed</h3>

        <div className="flex items-center">
          {recentlyViewed?.length > 2 && (
            <ActionBtn
              title={"See All"}
              onClick={() => {
                router.push("/listing/" + user.id + "/recently_viewed");
              }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar -mx-6 px-6">

        {recentlyViewed?.length > 0 ? (
          recentlyViewed?.map((profile, index) => (
            <UserPreview
              key={index}
              link={"/profile/" + profile.id}
              name={profile.name || profile.official_name || profile.agency_name}
              img_url={profile.profile_img}
              height={150} width={150}
            />
          ))
        ) : (
          <>
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
