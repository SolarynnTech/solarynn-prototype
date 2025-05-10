import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import useCategoriesStore from "@/stores/useCategoriesStore";
import QuestionnaireForm from "@/components/forms/QuestionnaireForm";
import useUserStore from "@/stores/useUserStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Loader } from "lucide-react";
import { LinearProgress, Box, Typography } from "@mui/material";

const QuestionsPage = () => {
  const router = useRouter();
  const { user } = useUserStore();
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

  const handleNext = async () => {
    const { error: saveErr } = await supabase
      .from("users")
      .update({ questionnaire_answers: answersBySection })
      .eq("id", user.id);

    if (saveErr) {
      console.error("Failed saving answers:", saveErr);
      return;
    }

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
      .eq("id", user?.role)
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

    const result = secs.map((sec) => ({
      ...sec,
      questions: qs.filter((q) => q.sectionId === sec.id),
    }));

    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    if (user && user.role) {
      getSectionsAndQuestions();
    }
  }, [user?.role, user]);

  if (loading || !data.length || !currentPage) {
    return (
      <div className="flex justify-center items-center h-[75vh]">
        <Loader className="animate-spin text-green-800"/>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[75vh]">
        <Loader className="animate-spin text-green-800"/>
        <p className="ml-2">Loading user...</p>
      </div>
    );
  }

  return (
    <div>
      <RootNavigation title="Onboard Questions"/>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography variant="caption" className={"!text-base"}>0%</Typography>
        <Box sx={{ flexGrow: 1, mx: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: "#F5F5F5",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#166534",
              },
            }}
          />
        </Box>
        <Typography variant="caption" className={"!text-base"}>100%</Typography>
      </Box>
      <div className="content pt-6">

        <QuestionnaireForm
          section={currentSection}
          answers={answersBySection[currentSection?.id] || {}}
          onChange={(qid, val, opt) => handleAnswerChange(currentSection.id, qid, val, opt)}
        />

        <PrimaryBtn onClick={handleNext} title={currentIndex < data.length - 1 ? "Next" : "Finish"}
                 disabled={!allAnswered}   classes="w-full block"/>
      </div>
    </div>
  );
};

export default QuestionsPage;
