import React, { useEffect, useState } from "react";
import RootNavigation from "@/components/Nav/Nav";
import { useRouter } from "next/router";
import {
  Box, Button,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore.js";
import ImageDropZone from "@/components/ImageDropZone.jsx";
import PrimaryBtn from "@/components/buttons/PrimaryBtn.jsx";

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

  const [title, setTitle] = useState("");
  const [localFile, setLocalFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [answers, setAnswers] = useState({});

  const handleFileChange = (file) => {
    setLocalFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFieldChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleCreateProject = async () => {
    let img_url = null;

    if (localFile) {
      setUploading(true);
      const ext = localFile.name.split(".").pop();
      const name = `${crypto.randomUUID()}.${ext}`;
      const path = `private/${id}/${name}`;

      const { error: upErr } = await supabase
        .storage
        .from("project-images")
        .upload(path, localFile, { cacheControl: "3600", upsert: false });
      if (upErr) {
        console.error("Upload failed", upErr);
        setError("Image upload failed");
        setUploading(false);
        return;
      }

      const { data, error: urlErr } = supabase
        .storage
        .from("project-images")
        .getPublicUrl(path);
      if (urlErr) {
        console.error("URL error", urlErr);
        setError("Could not fetch image URL");
        setUploading(false);
        return;
      }
      img_url = data.publicUrl;
      setUploading(false);
    }

    const { error: createErr } = await supabase
      .from("projects")
      .insert({
        title,
        owner: user.id,
        category: id,
        img_url,
        description: answers
      });
    if (createErr) {
      console.error("Insert failed", createErr);
      setError(createErr.message);
    } else {
      console.log("Project created!");
    }
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
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
    })();
  }, [id, supabase]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;

  const fields = [
    { id: "title", question: "Project Title", value: title },
    { id: "img",   question: "Cover Image",   },
    ...questions.map((q, i) => ({
      id: q.id,
      question: q.question,
      suffix: q.suffix,
      value: answers[q.id] || ""
    }))
  ];

  return (
    <div>
      <RootNavigation title="New Project" backBtn />
      <Typography variant="h5" gutterBottom>{sectionTitle}</Typography>
      <Paper sx={{ p: 4, mb: 4 }}>
        {fields.map((f, i) => (
          <Box key={f.id} mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {i+1}. {f.question}
            </Typography>
            {f.id === "img" ? (
              <ImageDropZone
                onFile={handleFileChange}
                uploading={uploading}
                previewUrl={previewUrl}
              />
            ) : (
              <TextField
                fullWidth variant="standard"
                value={f.id === "title" ? title : f.value}
                onChange={e =>
                  f.id === "title"
                    ? setTitle(e.target.value)
                    : handleFieldChange(f.id, e.target.value)
                }
                sx={textFieldStyles}
                InputProps={{ endAdornment: f.suffix || null }}
              />
            )}
          </Box>
        ))}
      </Paper>
      <PrimaryBtn onClick={handleCreateProject} title={"Create Project"} classes="w-full block"  disabled={uploading}/>
    </div>
  );
};
export default NewProjectPage;