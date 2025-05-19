import React from "react";

const ProjectDescription = ({ description, isOwner, budget }) => (
    <div className="mb-6">

      <h4 className="font-semibold text-lg mb-4">
        Description:
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

      <div className="flex items-center justify-between mt-6">
        <h4 className="font-semibold text-lg">
          Budget:
        </h4>
        <p>{budget}$</p>
      </div>
    </div>
  )
;
export default ProjectDescription;