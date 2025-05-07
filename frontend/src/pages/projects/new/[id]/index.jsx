import React, { useEffect, useState } from "react";
import RootNavigation from "@/components/Nav/Nav";
import { useRouter } from "next/router";
import {
  Box, Button, CircularProgress,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Loader } from "lucide-react";
import PrimaryBtn from "@/components/buttons/PrimaryBtn.jsx";
import useUserStore from "@/stores/useUserStore.js";

const textFieldStyles = {
  "& .MuiInput-underline:before": {
    borderBottom: "1px solid #000",
  },
  "& .MuiInput-underline:after": {
    borderBottom: "1px solid #000",
  },
};

const NewProjectPage = () => {
  const { id } = useRouter().query;
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const [questions, setQuestions] = useState([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading]       = useState(false);
  const [title, setTitle] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const [answers, setAnswers] = useState({});

  const handleCreateProject = async () => {
    console.log(user.role, 'user.role')
    const { error: createErr } = await supabase
      .from("projects")
      .insert({
        title,
        owner: user.id,
        category: id,
        img_url: imgUrl,
        description: answers
      })
    console.log("answers", answers);
  };


  const handleFileChange = async (e) => {
    // const file = e.target.files?.[0];
    // if (!file) return;
    //
    // setUploading(true);
    // const fileExt = file.name.split(".").pop();
    // const fileName = `${crypto.randomUUID()}.${fileExt}`;
    // const filePath = `${id}/${fileName}`;
    //
    // const { error: uploadError } = await supabase
    //   .storage
    //   .from("project-images")
    //   .upload(filePath, file, {
    //     cacheControl: "3600",
    //     upsert: false,
    //   });
    //
    // if (uploadError) {
    //   console.error("Upload failed:", uploadError);
    //   setError("Image upload failed");
    //   setUploading(false);
    //   return;
    // }
    //
    // const { publicURL, error: urlError } = supabase
    //   .storage
    //   .from("project-images")
    //   .getPublicUrl(filePath);
    //
    // if (urlError) {
    //   console.error("Public URL error:", urlError);
    //   setError("Could not fetch image URL");
    // } else {
    //   setImgUrl(publicURL);
    // }
    // setUploading(false);
  };


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
        <Loader className="animate-spin text-green-800"/>
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
    { id: "img", question: "Image URL", value: imgUrl },
    ...questions.map(q => ({
      id: q.id,
      question: q.question,
      suffix: q.suffix,
      value: answers[q.id] || ""
    }))
  ];

  return (
    <div>
      <RootNavigation title="New Project" backBtn/>
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
            <Typography variant="subtitle1" gutterBottom className="!text-sm !font-semibold !mb-3">
              {i + 1}. {f.question}
            </Typography>

            {f.id === "img" ? (
              <Box>
                <input
                  id="img-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="img-upload">
                  <Button variant="outlined" component="span" disabled={uploading}>
                    {uploading ? <CircularProgress size={20} /> : "Choose Image"}
                  </Button>
                </label>
                {imgUrl && (
                  <Box mt={2}>
                    <img src={imgUrl} alt="Cover preview" style={{ maxWidth: "100%", height: 200, objectFit: "cover" }} />
                  </Box>
                )}
              </Box>
            ) : (
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
            )}
          </Box>
        ))}
      </Paper>
      <PrimaryBtn onClick={handleCreateProject} title={"Create Project"} classes="w-full block"/>
    </div>
  );
};

export default NewProjectPage;
