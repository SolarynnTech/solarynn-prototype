import React from "react";
import ActionBtn from "../buttons/ActionBtn";
import PlaceholderBox from "../PlaceholderBox";
import useUserStore from "@/stores/useUserStore";
import useProjectStore from "@/stores/useProjectStore";
import { useRouter } from "next/router";
import ProjectPreview from "@/components/projects/ProjectPreview.jsx";

const FavoriteProjects = () => {
  const { user } = useUserStore();
  const { allProjects } = useProjectStore();

  const [favoriteProjects, setFavoriteProjects] = React.useState([]);
  const router = useRouter();

  React.useEffect(() => {
    if (!allProjects?.length || !user?.id) return;
    if (user?.favorite_projects) {
      const bookmarked = user?.favorite_projects.map((id) => {
        return allProjects.find((project) => project.id === id);
      }).filter((p) => p);
      setFavoriteProjects(bookmarked);
    }
  }, [user?.id, allProjects]);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Favorite Projects</h3>

        <div className="flex items-center">
          {favoriteProjects?.length > 2 && (
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
        {favoriteProjects?.length > 0 ? (
          favoriteProjects?.map((proj, index) => (
            <ProjectPreview
              key={proj.id}
              link={`/projects/${proj.id}`}
              title={proj.title}
              img_url={proj.img_url}
              height={150}
              width={150}
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

export default FavoriteProjects;
