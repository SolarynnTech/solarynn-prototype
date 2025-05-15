import React from "react";

const ProjectDescription = ({ description, isOwner }) => (
  <div className="mb-6">
    <h4 className="font-semibold text-lg mb-4">
      Project Description:
    </h4>

    {description ? (
      <p>{description}</p>
    ) : (
      <p className="text-gray-400 text-center !text-sm">
        {isOwner
          ? "You haven’t added a project description yet."
          : "There is no description available for this project."
        }
      </p>
    )}
  </div>
);
export default ProjectDescription;