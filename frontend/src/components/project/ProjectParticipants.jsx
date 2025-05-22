import React from "react";
import ActionBtn from "../buttons/ActionBtn";
import PlaceholderBox from "../PlaceholderBox";
import UserPreview from "@/components/UserPreview";
import useProfilesStore from "@/stores/useProfilesStore";
import { useRouter } from "next/router";

const ProjectParticipants = ({projectId, participants}) => {
  const {profiles} = useProfilesStore();
  const [users, setUsers] = React.useState([]);
  const router = useRouter();

  React.useEffect(() => {
    if(!profiles?.length) return;
    if (participants?.length) {
      //set to users all profiles that are in participants
      const mappedParticipants = participants
        .map((id) => profiles.find((profile) => profile.id === id))
        .filter((p) => p);
      setUsers(mappedParticipants);
    }
  }, [projectId, participants, profiles]);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Project Participants</h3>

        <div className="flex items-center">
          {participants?.length > 2 && (
            <ActionBtn
              title={"See All"}
              onClick={() => {
                router.push("/listing/project/" + projectId + "/participants");
              }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar -mx-6 px-6">

        {users?.length > 0 ? (
          users?.map((profile, index) => (
            <UserPreview
              key={index}
              link={"/profile/" + profile?.id}
              name={profile.name || profile.email}
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

export default ProjectParticipants;
