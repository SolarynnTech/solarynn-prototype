import React, { useEffect, useState, useRef } from "react";
import { Bookmark } from "lucide-react";
import useQuestionnaireStore from "../../stores/useQuestionnaireStore";
import useUserStore from "@/stores/useUserStore";
import useProfilesStore from "@/stores/useProfilesStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";


const DetailsPanel = ({ id, profile, isMyProfile }) => {
  const { forms } = useQuestionnaireStore();
  const supabase = useSupabaseClient();
  const { user, setUser } = useUserStore();
  const { ALL_FIELDS, setProfiles } = useProfilesStore();

  const containerRef = useRef(null);

  const [answersWithTitles, setAnswersWithTitles] = useState({});
  const [sectionTitles, setSectionTitles] = useState([]);
  const [currentFormPage, setCurrentFormPage] = useState(0);

  const handleSwipe = (direction) => {
    if (direction === "left" && currentFormPage < sectionTitles.length - 1) {
      setCurrentFormPage((prev) => prev + 1);
    } else if (direction === "right" && currentFormPage > 0) {
      setCurrentFormPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouch = {
      startX: 0,
      endX: 0,
      onTouchStart(e) {
        this.startX = e.touches[0].clientX;
      },
      onTouchMove(e) {
        this.endX = e.touches[0].clientX;
      },
      onTouchEnd() {
        const diff = this.startX - this.endX;
        if (Math.abs(diff) > 50) {
          handleSwipe(diff > 0 ? "left" : "right");
        }
      },
    };

    el.addEventListener("touchstart", handleTouch.onTouchStart.bind(handleTouch));
    el.addEventListener("touchmove", handleTouch.onTouchMove.bind(handleTouch));
    el.addEventListener("touchend", handleTouch.onTouchEnd.bind(handleTouch));

    return () => {
      el.removeEventListener("touchstart", handleTouch.onTouchStart);
      el.removeEventListener("touchmove", handleTouch.onTouchMove);
      el.removeEventListener("touchend", handleTouch.onTouchEnd);
    };
  }, [currentFormPage]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentFormPage]);

  async function convertAnswersWithTitles(rawAnswers) {
    const { data: sectionsData, error: sectionsError } = await supabase
      .from("sections")
      .select("id, title");

    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("id, question");

    if (sectionsError || questionsError) {
      console.error("Failed to fetch titles", sectionsError || questionsError);
      return {};
    }

    const sectionMap = Object.fromEntries(sectionsData.map((s) => [s.id, s.title]));
    const questionMap = Object.fromEntries(questionsData.map((q) => [q.id, q.question]));

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
    if (profile?.questionnaire_answers) {
      convertAnswersWithTitles(profile.questionnaire_answers).then((result) => {
        setAnswersWithTitles(result);
        setSectionTitles(Object.keys(result));
      });
    }
  }, [profile?.questionnaire_answers, profile?.id, id]);

  const toogleBookmark = async () => {
    const updatedList = user.booked_profiles?.includes(profile.id)
      ? user.booked_profiles.filter((p) => p !== profile.id)
      : [...(user.booked_profiles || []), profile.id];

    const { data, error } = await supabase
      .from("users")
      .update({ booked_profiles: updatedList })
      .eq("id", user.id);

    setUser((prev) => ({ ...prev, booked_profiles: updatedList }));
    setProfiles((prev) =>
      prev.map((p) => (p.id === user.id ? { ...p, booked_profiles: updatedList } : p))
    );
  };

  return (
    <div className="mb-12" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold mb-0">Profile Details</h3>
        {!isMyProfile && (
          <Bookmark
            fill={user.booked_profiles?.includes(profile.id) ? "#166534" : "transparent"}
            onClick={toogleBookmark}
            size={24}
            className={`${
              user.booked_profiles?.includes(profile.id)
                ? "text-green-800"
                : "text-gray-600"
            } cursor-pointer mr-3`}
          />
        )}
      </div>

      <div>
        {sectionTitles.length > 0 && answersWithTitles[sectionTitles[currentFormPage]] && (
          <div key={sectionTitles[currentFormPage]} className="mb-6">
            <h4 className="font-semibold text-md mb-2">
              {sectionTitles[currentFormPage]}
            </h4>
            <div className="pl-4 space-y-1">
              {Object.entries(answersWithTitles[sectionTitles[currentFormPage]]).map(
                ([questionTitle, value]) => (
                  <p key={questionTitle} className={"mb-3"}>
                    <b>{questionTitle}:</b>
                    <br />
                    <span className="text-gray-700">
                      {Array.isArray(value) ? value.join(", ") : value}
                    </span>
                  </p>
                )
              )}
            </div>
          </div>
        )}

        {profile && ALL_FIELDS.filter((field) => profile[field.key]).map((field) => (
          <p key={field.key} className={"mb-2"}>
            <b>{field.name}:</b>{" "}
            <span className="text-gray-600">{profile[field.key]}</span>
          </p>
        ))}

      </div>

      {sectionTitles.length > 1 && (
        <div className="flex items-center justify-between mb-4 overflow-x-auto gap-2 pb-4 -mx-6 px-8">
          {sectionTitles.map((_, index) => (
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