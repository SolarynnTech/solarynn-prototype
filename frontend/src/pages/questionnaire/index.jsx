import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import useCategoriesStore from "@/stores/useCategoriesStore";
import QuestionnaireForm from "@/components/forms/QuestionnaireForm";
import useUserStore from "@/stores/useUserStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Loader } from "lucide-react";
import { LinearProgress, Box } from "@mui/material";
import useProfilesStore from "@/stores/useProfilesStore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SecondaryBtn from "@/components/buttons/SecondaryBtn.jsx";

const QuestionsPage = () => {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const { setProfiles } = useProfilesStore();
  const { role } = useCategoriesStore();
  const supabase = useSupabaseClient();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answersBySection, setAnswersBySection] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalPages = data.length;
  const currentPage = currentIndex + 1;
  const progressPct = (currentPage / totalPages) * 100;

  const handleAnswerChange = (sectionId, questionId, value, option = null) => {
    setAnswersBySection(prev => {
      const sec = prev[sectionId] || {};
      let newVal;
      if (option !== null) {
        const arr = Array.isArray(sec[questionId]) ? sec[questionId] : [];
        newVal = arr.includes(option) ? arr.filter(v => v !== option) : [...arr, option];
      } else {
        newVal = value;
      }
      return { ...prev, [sectionId]: { ...sec, [questionId]: newVal } };
    });
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = async () => {
    const { error: saveErr } = await supabase
      .from("users")
      .update({ questionnaire_answers: answersBySection })
      .eq("id", user.id);

    if (saveErr) {
      console.error("Failed saving answers:", saveErr);
      return;
    }

    setUser(prev => ({
      ...prev,
      questionnaire_answers: answersBySection,
    }));

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === user.id
          ? { ...p, questionnaire_answers: answersBySection }
          : p
      )
    );

    if (currentIndex < data.length - 1) {
      setCurrentIndex(idx => idx + 1);
    } else {
      await router.push(`/profile/${user.id}`);
    }

    window.scrollTo(0, 0);
  };

  const currentSection = data[currentIndex];
  const currentAnswers = answersBySection[currentSection?.id] || {};
  const allAnswered = currentSection?.questions?.every(q => {
    const val = currentAnswers[q.id];
    if (q.type === "multiselect") {
      return Array.isArray(val) && val.length > 0;
    }
    return val !== undefined && val !== null && String(val).trim() !== "";
  });

  const getSectionsAndQuestions = async () => {
    setLoading(true);
    setError(null);

    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("sectionIds")
      .eq("id", role.id)
      .maybeSingle();

    if (catErr || !cat) {
      setError(catErr?.message || "Category not found");
      setLoading(false);
      return;
    }

    const ids = cat.sectionIds;
    if (ids.length === 0) {
      setData([]);
      setLoading(false);
      return;
    }

    const { data: secs, error: secsErr } = await supabase
      .from("sections")
      .select("*")
      .in("id", ids);
    if (secsErr || !secs) {
      setError(secsErr?.message || "Failed to fetch sections");
      setLoading(false);
      return;
    }

    const { data: qs, error: qsErr } = await supabase
      .from("questions")
      .select("*")
      .in("sectionId", ids);
    if (qsErr || !qs) {
      setError(qsErr?.message || "Failed to fetch questions");
      setLoading(false);
      return;
    }

    const { data: answers, error: answersErr } = await supabase
      .from("users")
      .select("questionnaire_answers")
      .eq("id", user.id)
      .maybeSingle();

    if (answersErr) {
      setError(secsErr?.message || "Failed to fetch answrs");
      setLoading(false);
      return;
    } else {
      setAnswersBySection(answers?.questionnaire_answers || {});
    }

    const sortedSecs = [...secs].sort((a, b) => {
      if (a.title === "Key Information") return -1;
      if (b.title === "Key Information") return 1;
      return 0;
    });

    const result = sortedSecs.map((sec) => ({
      ...sec,
      questions: qs.filter((q) => q.sectionId === sec.id),
    }));

    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id && role?.id) {
      getSectionsAndQuestions();
    }
  }, [user?.id, role?.id]);

  if (loading || !data.length || !currentPage) {
    return (
      <div className="flex justify-center items-center h-[75vh]">
        <Loader className="animate-spin text-indigo-500"/>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[75vh]">
        <Loader className="animate-spin text-indigo-500"/>
        <p className="ml-2">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <RootNavigation title={`Onboard Questions - ${currentSection.title}` || "Onboard Questions"}/>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >

        <Box sx={{ flexGrow: 1, mx: 0, mt: -1.5 }}>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{
              height: 4,
              borderRadius: 0,
              marginLeft: "-24px",
              marginRight: "-24px",
              backgroundColor: "#F5F5F5",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#615FFF",
              },
            }}
          />
        </Box>

      </Box>
      <div className="content pt-6">

        <QuestionnaireForm
          section={currentSection}
          answers={answersBySection[currentSection?.id] || {}}
          onChange={(qid, val, opt) => handleAnswerChange(currentSection.id, qid, val, opt)}
        />


        <div
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[680px] bg-white border-t border-gray-200 p-4 z-20">
          <div className="flex gap-3">
            <SecondaryBtn
              onClick={handleBack}
              disabled={currentIndex === 0}
              title={<div className={"flex items-center justify-center gap-2"}><ArrowBackIcon/> Back </div>}
              classes={`
                flex-1
                    h-12
                  rounded-md
                ${currentIndex === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : ""}
              `}
            />

            <PrimaryBtn
              onClick={handleNext}
              title={currentIndex < data.length - 1 ? "Next" : "Finish"}
              disabled={!allAnswered}
              classes={`
                flex-1
                h-12
                rounded-md
                ${allAnswered
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"}
              `}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
