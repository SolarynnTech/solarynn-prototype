import React, { useEffect, useState } from "react";
import RootNavigation from "@/components/Nav/Nav";
import { useRouter } from "next/router";
import {
  Box,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Loader } from "lucide-react";
import PrimaryBtn from "@/components/buttons/PrimaryBtn.jsx";

const textFieldStyles = {
  '& .MuiInput-underline:before': {
    borderBottom: '1px solid #000',
  },
  '& .MuiInput-underline:after': {
    borderBottom: '1px solid #000',
  },
};

const NewProjectPage = () => {
  const { id } = useRouter().query;
  const supabase = useSupabaseClient();
  const [questions, setQuestions]       = useState([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const [title, setTitle]   = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const [answers, setAnswers] = useState({});

  const handleFieldChange = (fieldId, value) => {
    if (fieldId === "title") {
      setTitle(value);
    } else if (fieldId === "img") {
      setImgUrl(value);
    } else {
      setAnswers(prev => ({ ...prev, [fieldId]: value }));
    }
  };

  const getSectionTitleAndQuestions = async () => {
    setLoading(true);
    setError(null);

    const { data: cat, error: catErr } = await supabase
      .from("project_categories")
      .select("title")
      .eq("id", id)
      .maybeSingle();
    if (catErr || !cat) {
      setError(catErr?.message || "Category not found");
      setLoading(false);
      return;
    }
    setSectionTitle(cat.title);

    const { data: qs, error: qsErr } = await supabase
      .from("project_questions")
      .select("*")
      .eq("category", id);
    if (qsErr || !qs) {
      setError(qsErr?.message || "Failed to fetch questions");
      setLoading(false);
      return;
    }
    setQuestions(qs);
    setLoading(false);
  };

  useEffect(() => {
    if (id) getSectionTitleAndQuestions();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[75vh]">
        <Loader className="animate-spin text-green-800" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[75vh] space-y-4">
        <Typography variant="body1" align="center">
          Sorry, we’re experiencing trouble loading questions.<br/>
          Please try reloading the page.
        </Typography>
        <PrimaryBtn onClick={() => window.location.reload()} title={"Reload"}>
          Reload
        </PrimaryBtn>
      </div>
    );
  }
  const fields = [
    { id: "title", question: "Project Title", value: title },
    { id: "img",   question: "Image URL",     value: imgUrl },
    ...questions.map(q => ({
      id: q.id,
      question: q.question,
      suffix: q.suffix,
      value: answers[q.id] || ""
    }))
  ];

  return (
    <div>
      <RootNavigation title="New Project" backBtn />
      {sectionTitle && (
        <Typography
          variant="h5"
          gutterBottom
          className="!font-bold !text-xl !mb-4 !mt-2"
        >
          {sectionTitle}
        </Typography>
      )}
      <Paper sx={{ p: 4, mb: 4 }} elevation={2} className="mt-4 !bg-[#F5F5F5]">
        {fields.map((f, i) => (
          <Box key={f.id} mb={3}>
            <Typography
              variant="subtitle1"
              gutterBottom
              className="!text-sm !font-semibold !mb-3"
            >
              {i + 1}. {f.question}
            </Typography>
            <TextField
              fullWidth
              variant="standard"
              focused
              color="black"
              sx={textFieldStyles}
              type="text"
              value={f.value}
              onChange={e => handleFieldChange(f.id, e.target.value)}
              InputProps={{ endAdornment: f.suffix || null }}
            />
          </Box>
        ))}
      </Paper>
    </div>
  );
};

export default NewProfilePage;
