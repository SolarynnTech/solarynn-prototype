import ActionBtn from "../buttons/ActionBtn";
import React, {useEffect} from "react";
import SecondaryBtn from "../buttons/SecondaryBtn";
import PlaceholderBox from "../PlaceholderBox";
import UserPreview from "@/components/UserPreview";
import useProfilesStore from "@/stores/useProfilesStore";
import { useRouter } from "next/router";

const Group = ({ title, data, groupId, columnName, isMyProfile, profile }) => {

  const SIZE = groupId === "dddc641a-049a-454a-af31-1112fb6727be" ? {h: 300, w: 200} : {h: 150, w: 150};
  const {profiles} = useProfilesStore();
  const [dataToDisplay, setDataToDisplay] = React.useState([]);
  const router = useRouter();

  useEffect(() => {
    if(!profiles?.length || !data) return;

      const dataMapped = data.map((id) => {
        return profiles.find((profile) => profile.id === id);
      });
      setDataToDisplay(dataMapped);

  }, [data, profiles]);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">{title}</h3>

        {dataToDisplay && dataToDisplay?.length > 1 && (
          <div className="flex items-center">
            <ActionBtn
              title={"See All"}
              onClick={() => {
                router.push("/listing/" + profile.id + "/" + columnName);
              }}
            />
          </div>
        )}
      </div>

      {dataToDisplay && dataToDisplay?.length > 0 ? (
        dataToDisplay?.map((profile, index) => (
          <UserPreview
            key={index}
            link={"/profile/" + profile.id}
            name={profile.name || profile.official_name || profile.agency_name}
            img_url={profile.profile_img}
            height={SIZE.h} width={SIZE.w}
          />
        ))
      ) : (
        <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar -mx-6 px-6">
          <PlaceholderBox height={SIZE.h} width={SIZE.w} />
          <PlaceholderBox height={SIZE.h} width={SIZE.w} />
          <PlaceholderBox height={SIZE.h} width={SIZE.w} />
        </div>
      )}

      {isMyProfile ? (
        <SecondaryBtn title="Add" classes="w-full block" />
      ) : (
        <SecondaryBtn title="Send A Request" classes="w-full block" />
      )}
    </div>
  );
};

export default Group;
