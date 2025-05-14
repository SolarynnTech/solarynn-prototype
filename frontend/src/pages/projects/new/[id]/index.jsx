import React, { useEffect, useRef, useState } from "react";
import RootNavigation from "@/components/Nav/Nav";
import { useRouter } from "next/router";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore.js";
import ImageDropZone from "@/components/ImageDropZone.jsx";
import PrimaryBtn from "@/components/buttons/PrimaryBtn.jsx";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const textFieldStyles = {
  "& .MuiInput-underline:before": {
    borderBottom: "1px solid #000",
  },
  "& .MuiInput-underline:after": {
    borderBottom: "1px solid #000",
  }
};

const NewProjectPage = () => {
  const { id } = useRouter().query;
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [localFile, setLocalFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [created, setCreated] = useState(false);
  const [answers, setAnswers] = useState({});
  const allAnswered = questions.every(q => (answers[q.id] || "").trim() !== "");
  const [visibility, setVisibility] = useState("public");
  const createDisabled = uploading || !allAnswered || !localFile || !projectDescription.trim() || !visibility.trim() || !title.trim();
  const projectRef = useRef(null);

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

    const { data, error: createErr } = await supabase
      .from("projects")
      .insert({
        title,
        owner: user.id,
        category: id,
        img_url,
        description: answers,
        project_description: projectDescription,
        project_visibility: visibility
      })
      .select("id")
      .maybeSingle();
    if (createErr) {
      console.error("Insert failed", createErr);
      setError(createErr.message);
    } else {
      setCreated(true);
      projectRef.current = data.id;
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
    {
      id: "visibility", question: "Project Visibility", values: {
        private: "Private",
        public: "Public"
      }
    },
    {
      id: "description",
      question: "Project Description",
      suffix: <span className="text-sm text-gray-500">Max 2000 characters</span>,
    },
    { id: "img", question: "Cover Image", },
    ...questions.map((q, i) => ({
      id: q.id,
      question: q.question,
      suffix: q.suffix,
      value: answers[q.id] || ""
    }))
  ];

  return (
    <div>
      <RootNavigation title="New Project" backBtn/>
      <h4 className={"text-lg mb-4 mt-4 text-center"}>{sectionTitle}</h4>
      <Paper sx={{ p: 3, mb: 4 }} className={"!bg-[#F5F5F5]"}>
        {fields.map((f, i) => (
          <Box key={f.id} mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {i + 1}. {f.question}
            </Typography>

            {f.id === "visibility" ? (
              <TextField
                select
                variant="standard"
                fullWidth
                value={visibility}
                onChange={e => setVisibility(e.target.value)}
                SelectProps={{
                  IconComponent: ArrowDropDownIcon,
                  sx: { right: 0, position: "absolute" },
                }}
                sx={{
                  "& .MuiInput-underline:before": {
                    borderBottomColor: "#000",
                  },
                  "& .MuiInput-underline:hover:before": {
                    borderBottomColor: "#000",
                  },
                  "& .MuiInput-underline.Mui-focused:after": {
                    borderBottomColor: "#000",
                    borderBottomWidth: "2px",
                  },
                  "& .MuiSelect-select": {
                    pr: 4,
                  },
                }}
                Input={{
                  disableUnderline: false,
                  sx: {
                    "&:before": { borderBottomColor: "#000" },
                    "&:hover:before": {
                      borderBottomColor: "#000",
                    },
                    "&:after": {
                      borderBottomColor: "#000",
                      borderBottomWidth: 2,
                    },
                    pr: 4,
                  },
                }}
              >
                {Object.entries(f.values).map(([val, label]) => (
                  <MenuItem key={val} value={val} sx={{
                    "&.Mui-selected": {
                      backgroundColor: "rgba(0, 128, 0, 0.2)",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "rgba(0, 128, 0, 0.3)",
                    },
                  }}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            ) : f.id === "description" ? (
              <TextField
                id="projectDescription"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                htmlInput={{ maxLength: 2000 }}
                value={projectDescription}
                onChange={e =>
                  setProjectDescription(e.target.value)
                }
                helperText={`${projectDescription.length}/2000 characters`}
                formHelperText={{
                  sx: {
                    textAlign: "right",
                    fontSize: "0.75rem",
                    color: "#000",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#000" },
                    "&:hover fieldset": {
                      borderColor: "#000",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                      borderWidth: "2px",
                    },
                  },
                }}
              />
            ) : f.id === "img" ? (
              <ImageDropZone
                onFile={handleFileChange}
                uploading={uploading}
                previewUrl={previewUrl}
              />
            ) : (
              <TextField
                fullWidth
                variant="standard"
                value={
                  f.id === "title" ? title : f.value
                }
                onChange={e =>
                  f.id === "title"
                    ? setTitle(e.target.value)
                    : handleFieldChange(f.id, e.target.value)
                }
                sx={textFieldStyles}
                Input={{
                  endAdornment: f.suffix || null,
                }}
              />
            )}
          </Box>
        ))}
      </Paper>
      <PrimaryBtn onClick={handleCreateProject} title={"Create Project"} classes="w-full block"
                  disabled={createDisabled}/>
      <Dialog open={created} disableEscapeKeyDown>
        <DialogTitle className="text-center text-xl !font-semibold">Success!</DialogTitle>
        <DialogContent>
          <Typography className={"!text-lg"}>Your project was created successfully.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", px: 3, pb: 2 }}>
          <PrimaryBtn
            onClick={() => router.push(`/projects/${projectRef.current}`)}
            title="To the Projects Page"
            classes={"!py-2 !px-4 !text-sm"}

          />
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default NewProjectPage;