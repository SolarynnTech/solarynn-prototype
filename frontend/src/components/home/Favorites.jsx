import React from "react";
import ActionBtn from "../buttons/ActionBtn";
import PlaceholderBox from "../PlaceholderBox";
import UserPreview from "@/components/UserPreview";
import useUserStore from "@/stores/useUserStore";
import useProfilesStore from "@/stores/useProfilesStore";
import { useRouter } from "next/router";

const Favorites = () => {
  const { user } = useUserStore();
  const { profiles } = useProfilesStore();
  const [bookedProfiles, setBookedProfiles] = React.useState([]);
  const router = useRouter();

  React.useEffect(() => {
    if (!profiles?.length || !user?.id) return;
    if (user?.booked_profiles) {
      const bookmarked = user?.booked_profiles.map((id) => {
        return profiles.find((profile) => profile.id === id);
      });
      setBookedProfiles(bookmarked);
    }
  }, [user?.id, profiles]);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Favorite Profiles</h3>

        <div className="flex items-center">
          {bookedProfiles?.length > 2 && (
            <ActionBtn
              title={"See All"}
              onClick={() => {
                router.push("/listing/" + user.id + "/recently_viewed");
              }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar custom-scrollbar -mx-6 px-6">
        {bookedProfiles?.length > 0 ? (
          bookedProfiles?.map((profile, index) => (
            <UserPreview
              key={index}
              link={"/profile/" + profile?.id}
              name={profile?.name || profile?.email}
              img_url={profile?.profile_img}
              height={300}
              width={200}
            />
          ))
        ) : (
          <>
            <PlaceholderBox height={300} width={200} />
            <PlaceholderBox height={300} width={200} />
            <PlaceholderBox height={300} width={200} />
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
