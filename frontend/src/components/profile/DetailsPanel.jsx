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

  const [answersWithTitles, setAnswersWithTitles] = useState({});

  async function convertAnswersWithTitles(rawAnswers) {

    // Step 1: Fetch all sections and questions
    const { data: sectionsData, error: sectionsError } = await supabase
      .from("sections")
      .select("id, title")

    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("id, question");

    if (sectionsError || questionsError) {
      console.error("Failed to fetch titles", sectionsError || questionsError);
      return {};
    }

    // Step 2: Build ID -> title maps
    const sectionMap = Object.fromEntries(
      sectionsData.map((s) => [s.id, s.title])
    );
    const questionMap = Object.fromEntries(
      questionsData.map((q) => [q.id, q.question])
    );

    // Step 3: Transform the object
    const transformed = {};

    for (const [sectionId, questions] of Object.entries(rawAnswers)) {
      const sectionTitle = sectionMap[sectionId] || sectionId;
      transformed[sectionTitle] = {};

      for (const [questionId, value] of Object.entries(questions)) {
        const questionTitle = questionMap[questionId] || questionId;
        transformed[sectionTitle][questionTitle] = value;
      }
    }

    return transformed;
  }

  useEffect(() => {
    if (user?.questionnaire_answers) {
      convertAnswersWithTitles(user.questionnaire_answers).then(setAnswersWithTitles);
    }
  }, [user?.questionnaire_answers]);

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
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Profile Details</h3>

        <div className="flex items-center">
          {!yourProfile && (
            <Bookmark fill={`${user.booked_profiles?.includes(profile.id) ? "#166534" : "transparent"}`} onClick={toogleBookmark} size={24} className={`${user.booked_profiles?.includes(profile.id) ? "text-green-800" : "text-gray-600"} cursor-pointer mr-3 `} />
          )}

          {/* <ActionBtn*/}
          {/*   title={readOnly ? "Edit" : "Done"}*/}
          {/*   onClick={() => setReadOnly(!readOnly)}*/}
          {/* />*/}

        </div>
      </div>

      <div>
        {yourProfile ? (
          <>
            {Object.entries(answersWithTitles).map(([sectionTitle, questions]) => (
              <div key={sectionTitle} className="mb-6">
                <h4 className="font-semibold text-md mb-2">{sectionTitle}</h4>

                <div className="pl-4 space-y-1">
                  {Object.entries(questions).map(([questionTitle, value]) => (
                    <p key={questionTitle} className={"mb-3"}>
                      <b>{questionTitle}:</b>{" "}<br/>
                      <span className="text-gray-700">{Array.isArray(value) ? value.join(", ") : value}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </>
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

      {/*{yourProfile && (*/}
      {/*<div className="flex items-center justify-between mb-4 overflow-x-auto gap-2 pb-4 -mx-6 px-8">*/}
      {/*  {[...Array(totalFormPages)].map((_, index) => (*/}
      {/*    <span*/}
      {/*      key={index}*/}
      {/*      className={`${*/}
      {/*        currentFormPage === index ? "bg-green-800" : "bg-gray-300"*/}
      {/*      } min-w-8 shrink-0 grow h-1 cursor-pointer rounded-full block`}*/}
      {/*      onClick={() => setCurrentFormPage(index)}*/}
      {/*    />*/}
      {/*  ))}*/}
      {/*</div>*/}
      {/*)}*/}
    </div>
  );
};

export default DetailsPanel;


// {
//   "3f3858fa-1589-4c3d-bbb0-9e7266d01291": {
//   "55f2838d-5211-44cb-b5b7-59ed67f87e89": [
//     "Social Media Ads (IG, TikTok, etc.)",
//     "Sponsored Content (Articles, Videos, Podcasts)"
//   ],
//     "e48afc67-3fd4-4263-b926-5067a55e9ead": "Very open — we regularly invest in partnerships"
// },
//   "47caa2d8-f71e-4590-91c2-3a01bf4a5179": {
//   "987edce0-37a7-4926-b6cc-8ee5bbedc978": "Yes, regional/local brands",
//     "ccc84f85-b33d-4c2f-8871-d35a5d348c6a": "Luxury / High Fashion",
//     "ddeaab3e-d1cc-4606-b43f-e9ebf7144102": [
//     "No – Not yet",
//     "Yes – Brand campaigns"
//   ]
// },
//   "fee4fd48-dd3d-4e92-871b-2c483e5224a9": {
//   "0d3fc7ba-3c2b-4a0a-94d0-53e41f747fe0": "Full in-house team",
//     "b7757c71-481f-429d-ad87-f9da77b6169d": "dededed",
//     "fdbcff42-8f05-486e-bfd2-fb181ef24537": [
//     "E-commerce",
//     "Luxury / Lifestyle"
//   ]
// }
// }