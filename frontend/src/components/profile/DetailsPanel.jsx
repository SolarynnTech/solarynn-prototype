import React, { useEffect, useState } from "react";
import ActionBtn from "../buttons/ActionBtn";
import QuestionnaireForm from "../forms/QuestionnaireForm";
import useQuestionnaireStore from "../../stores/useQuestionnaireStore";
import { Bookmark } from "lucide-react";

const DetailsPanel = () => {
  const { forms } = useQuestionnaireStore();

  const [currentFormPage, setCurrentFormPage] = useState(0);
  const [totalFormPages, setTotalFormPages] = useState(0);
  const [part, setPart] = useState(0);
  const [page, setPage] = useState(0);
  const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    const totalPages = forms.reduce((acc, form) => acc + form.pages.length, 0);
    setTotalFormPages(totalPages);
  }, [forms]);

  useEffect(() => {
    let cumulativePageCount = 0;

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const pagesInForm = form.pages.length;

      if (currentFormPage < cumulativePageCount + pagesInForm) {
        const localPage = currentFormPage - cumulativePageCount;

        setPart(i + 1);
        setPage(localPage + 1);
        break;
      }

      cumulativePageCount += pagesInForm;
    }
  }, [currentFormPage, forms]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Profile Details</h3>

        <div className="flex items-center">
          <Bookmark size={24} className="mr-3 text-gray-600" />
          <ActionBtn
            title={readOnly ? "Edit" : "Done"}
            onClick={() => setReadOnly(!readOnly)}
          />
        </div>
      </div>

      <div>
        <QuestionnaireForm
          sections={forms[part - 1]?.pages[page - 1].sections}
          readOnly={readOnly}
        />
      </div>

      <div className="flex items-center justify-between mb-4 overflow-x-auto gap-2 pb-4 -mx-6 px-8">
        {[...Array(totalFormPages)].map((_, index) => (
          <span
            key={index}
            className={`${
              currentFormPage === index ? "bg-green-800" : "bg-gray-300"
            } min-w-8 shrink-0 grow h-1 cursor-pointer rounded-full block`}
            onClick={() => setCurrentFormPage(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default DetailsPanel;
