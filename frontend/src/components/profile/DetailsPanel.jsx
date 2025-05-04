import React, { useEffect, useState } from "react";
import ActionBtn from "../buttons/ActionBtn";
import QuestionnaireForm from "../forms/QuestionnaireForm";
import useQuestionnaireStore from "../../stores/useQuestionnaireStore";
import { Bookmark } from "lucide-react";
import useUserStore from "@/stores/useUserStore";
import useProfilesStore from "@/stores/useProfilesStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const DetailsPanel = ({profile, id}) => {
  const { forms } = useQuestionnaireStore();

  const [currentFormPage, setCurrentFormPage] = useState(0);
  const [totalFormPages, setTotalFormPages] = useState(0);
  const [part, setPart] = useState(0);
  const [page, setPage] = useState(0);
  const [readOnly, setReadOnly] = useState(true);

  const supabase = useSupabaseClient();

  const { user, setUser } = useUserStore();
  const { ALL_FIELDS} = useProfilesStore();

  const yourProfile = user?.id === profile?.id || !id;

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

  const toogleBookmark = async () => {
    if(user.booked_profiles?.includes(profile.id)) {
      const { data, error } = await supabase
        .from("users")
        .update({booked_profiles: user.booked_profiles.filter((p) => p !== profile.id)})
        .eq("id", user.id);

      setUser((prevUser) => ({
        ...prevUser,
        booked_profiles: prevUser.booked_profiles.filter((p) => p !== profile.id),
      }));

      console.log("User unbookmarked profile", data);
      console.log("User unbookmarked profile error", error);

    } else {
      const { data, error } = await supabase
        .from("users")
        .update({booked_profiles: user?.booked_profiles ? [...user?.booked_profiles, profile.id] : [profile.id]})
        .eq("id", user.id);

      setUser((prevUser) => ({
        ...prevUser,
        booked_profiles: prevUser?.booked_profiles ? [...prevUser?.booked_profiles, profile.id] : [profile.id],
      }));

      console.log("User bookmarked profile", data);
      console.log("User bookmarked profile error", error);
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Profile Details</h3>

        <div className="flex items-center">
          {!yourProfile ? (
            <Bookmark fill={`${user.booked_profiles?.includes(profile.id) ? "#166534" : "transparent"}`} onClick={toogleBookmark} size={24} className={`${user.booked_profiles?.includes(profile.id) ? "text-green-800" : "text-gray-600"} cursor-pointer mr-3 `} />
          ) : (
          <ActionBtn
            title={readOnly ? "Edit" : "Done"}
            onClick={() => setReadOnly(!readOnly)}
          />
          )}
        </div>
      </div>

      <div>
        {yourProfile ? (
          <QuestionnaireForm
            sections={forms[part - 1]?.pages[page - 1].sections}
            readOnly={readOnly}
          />
        ) : (
          <>
            {ALL_FIELDS.filter((field) => profile[field.key]).map((field) => (
              <p key={field.key} className={"mb-2"}>
                <b>{field.name}:</b> <span className="text-gray-600">{profile[field.key]}</span>
              </p>
            ))}
          </>
        )}
      </div>

      {yourProfile && (
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
      )}
    </div>
  );
};

export default DetailsPanel;
