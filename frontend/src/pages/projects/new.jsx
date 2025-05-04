import React from "react";
import RootNavigation from "@/components/Nav/Nav";
import NavigationBar from "@/components/profile/NavigationBar";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import ProjectImage from "@/components/projects/ProjectImage";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";
import ProjectDetails from "@/components/projects/ProjectDetails";
import TemplateCreatedBy from "@/components/projects/TemplateCreatedBy";
import AdditionalDocs from "@/components/projects/AdditionalDocs";
import IdealUser from "@/components/projects/IdealUser";

const NewProfilePage = () => {
  return (
    <div>
      <RootNavigation title="Template" backBtn={true} />

      <div className="pt-4 pb-8">
        <ProjectImage />

        <PrimaryBtn title="Make Template Private" classes="w-full block mb-4" />
        <SecondaryBtn title="Delete Template" classes="w-full block mb-12" />

        <ProjectDetails />

        <TemplateCreatedBy/>
        <AdditionalDocs/>
        <AdditionalDocs/>
        <IdealUser/>

        <NavigationBar />
      </div>
    </div>
  );
};

export default NewProfilePage;
