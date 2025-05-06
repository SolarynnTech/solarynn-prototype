import React from "react";
import ActionBtn from "../buttons/ActionBtn";
import PlaceholderBox from "../PlaceholderBox";
import {Info} from "lucide-react";
import SecondaryBtn from "../buttons/SecondaryBtn";
import {Tooltip} from "@mui/material";
import {useRouter} from "next/router";
import ProjectPreview from "@/components/projects/ProjectPreview";

const ProjectCategory = ({name, id, data}) => {

  const router = useRouter();

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center font-bold mb-0">
          {name}

          {/*<Tooltip title="Description">*/}
          {/*  <span className="ml-2 text-gray-500">*/}
          {/*    <Info size={18}/>*/}
          {/*  </span>*/}
          {/*</Tooltip>*/}
        </h3>

        <div className="flex items-center">
          <ActionBtn
            title={"See All"}
            onClick={() => {
              router.push(`/projects/category/${id}`);
            }}
          />
        </div>
      </div>

      <div className="flex items-center mb-4 gap-4 flex-nowrap overflow-x-auto scroll scrollbar hide-scrollbar -mx-6 px-6">
        {data && data.map((project) => (
          <ProjectPreview
            name={project.name}
            key={project.id}
            img_url={project.img_url}
            link={"/projects/" + project.id}
          />
        ))}

        {!data.length && (
          <>
            <PlaceholderBox height={150} width={150} />
            <PlaceholderBox height={150} width={150} />
            <PlaceholderBox height={150} width={150} />
          </>
        )}
      </div>

      <SecondaryBtn title="Create" classes="block w-full mb-4" onClick={() => router.push("/projects/new")}/>
    </div>
  );
};

export default ProjectCategory;
