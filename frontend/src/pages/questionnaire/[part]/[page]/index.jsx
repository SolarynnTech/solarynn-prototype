import React from "react";
import { useRouter } from "next/router";
import RootNavigation from "../../../../components/Nav/Nav";
import PrimaryBtn from "../../../../components/buttons/PrimaryBtn";
import useQuestionnaireStore from "../../../../stores/useQuestionnaireStore";
import useCategoriesStore from "../../../../stores/useCategoriesStore";
import QuestionnaireForm from "../../../../components/forms/QuestionnaireForm";

const QuestionsPage = () => {
  const router = useRouter();
  const { part, page } = router.query;

  const { forms } = useQuestionnaireStore();
  const { mainCategory } = useCategoriesStore();

  const partsLength = forms.length || 0;
  const pagesLength = forms[part - 1]?.pages.length || 0;

  return (
    <div>
      <RootNavigation title={"Onboard Questions"} />

      <div className="content pt-12">
        <h3>{mainCategory?.title}</h3>
        <h3 className="mb-4">
          {forms[part - 1]?.name} Part {part}
        </h3>

        <QuestionnaireForm
          sections={forms[part - 1]?.pages[page - 1].sections}
          currentPage={page}
          totalPages={pagesLength}
        />

        <PrimaryBtn
          onClick={() => {
            if (page < pagesLength) {
              router.push(`/questionnaire/${part}/${parseInt(page) + 1}`);
            } else if (part < partsLength) {
              router.push(`/questionnaire/${parseInt(part) + 1}/1`);
            } else {
              router.push("/profile");
            }
          }}
          title="Next"
          classes="w-full block"
        />
      </div>
    </div>
  );
};

export default QuestionsPage;
