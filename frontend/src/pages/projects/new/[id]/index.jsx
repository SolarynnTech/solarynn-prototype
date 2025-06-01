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
  DialogActions
} from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore.js";
import ImageDropZone from "@/components/ImageDropZone.jsx";
import PrimaryBtn from "@/components/buttons/PrimaryBtn.jsx";
import VisibilitySelect from "@/components/forms/VisibilitySelect.jsx";
import { REQUEST_STATUSES } from "@/models/request.js";

const textFieldStyles = {
  "& .MuiInput-underline:before": {
    borderBottom: "1px solid #000",
  },
  "& .MuiInput-underline:after": {
    borderBottom: "1px solid #000",
  }
};

const NewProjectPage = () => {
  const { id, private: isPrivate, userId } = useRouter().query;
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
  const [paymentInfo, setPaymentInfo] = useState("");
  const [budget, setBudget] = useState("");
  const allAnswered = questions.every(q => (answers[q.id] || "").trim() !== "");
  const [visibility, setVisibility] = useState(isPrivate === "true" ? "private" : "public");
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
        project_visibility: visibility,
        payment_info: paymentInfo,
        budget
      })
      .select("id")
      .maybeSingle();
    if (createErr) {
      console.error("Insert failed", createErr);
      setError(createErr.message);
    } else {
      setCreated(true);
      projectRef.current = data.id;

      if (userId) {
        await sendRequestToJoin(data.id);
      }
    }
  };

  const sendRequestToJoin = async (prjId) => {
    const isRequestAlreadySent = await supabase
      .from("requests")
      .select("*")
      .eq("requester_id", user.id)
      .eq("assigner_id", userId)
      .eq("target_id", prjId)
      .eq("target_type", "project_request");

    if (isRequestAlreadySent.data.length > 0) {
      return;
    }

    const { error } = await supabase
      .from("requests")
      .insert({
        requester_id: user.id,
        assigner_id: userId,
        status: REQUEST_STATUSES.PENDING,
        target_id: prjId,
        target_type: "project_request",
      });
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch category title (from project_categories or universe_sub_categories)
        const { data: cat, error: catErr } = await supabase
          .from("project_categories")
          .select("title")
          .eq("id", id)
          .maybeSingle();

        let title = cat?.title || null;

        if (!title) {
          const { data: subCat, error: subCatErr } = await supabase
            .from("universe_sub_categories")
            .select("title")
            .eq("id", id)
            .maybeSingle();

          if (subCatErr) throw new Error(subCatErr.message);
          title = subCat?.title || null;
        }

        if (!title) throw new Error("Category not found");
        setSectionTitle(title);

        // Fetch questions (from project_questions or universe_questions)
        const { data: qs, error: qsErr } = await supabase
          .from("project_questions")
          .select("*")
          .eq("category", id);

        let projectQuestions = qs || null;

        if (!projectQuestions || !projectQuestions.length) {
          const { data: uqs, error: uqsErr } = await supabase
            .from("universe_questions")
            .select("*")
            .eq("universe_sub_category", id);

          console.log("uqs", uqs);

          if (uqsErr) throw new Error(uqsErr.message);
          projectQuestions = uqs || [];
        }

        if (!projectQuestions || !projectQuestions.length) {
          throw new Error("No questions found");
        }

        setQuestions(projectQuestions);
      } catch (err) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, supabase]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;

  const fields = [
    { id: "title", question: "Project Title", value: title },
    {
      id: "visibility", question: "Project Visibility", options: ["public", "private"],
    },
    {
      id: "description",
      question: "Project Description",
      suffix: <span className="text-sm text-gray-500">Max 2000 characters</span>,
    },
    // {
    //   id: "payment_info",
    //   question: "Payment Information",
    // },
    {
      id: "budget",
      question: "Define project budget",
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
    <div className="pt-8 mb-5">
      <RootNavigation title="New Project" backBtn/>
      <h4 className={"text-lg mb-4 mt-4 text-center"}>{sectionTitle}</h4>
      <Paper sx={{ p: 3, mb: 4 }} className={"!bg-[#F5F5F5]"}>
        {fields.map((f, i) => (
          <Box key={f.id} mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {i + 1}. {f.question}
            </Typography>

            {f.id === "visibility" ? (
              <VisibilitySelect
                value={visibility}
                onChange={e => setVisibility(e.target.value)}
                options={f.options}
                readOnly={isPrivate === "true"}
              />
            ) : f.id === "description" ? (
              <TextField
                id="projectDescription"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                slotProps={{
                  htmlInput: { maxLength: 2000 },
                  sx: {
                    textAlign: "right",
                    fontSize: "0.75rem",
                    color: "#000",
                  },
                }}
                value={projectDescription}
                onChange={e => setProjectDescription(e.target.value)}
                helperText={`${projectDescription.length}/2000 characters`}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#000" },
                    "&:hover fieldset": { borderColor: "#000" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                      borderWidth: "2px",
                    },
                  },
                }}
              />
            ) : f.id === "payment_info" ? (
              <TextField
                fullWidth
                variant="standard"
                placeholder="Paypal, Stripe, etc."
                value={paymentInfo || ""}
                onChange={e => setPaymentInfo(e.target.value)}
                sx={textFieldStyles}
              />
            ) : f.id === "budget" ? (
              <TextField
                fullWidth
                variant="standard"
                type="number"
                placeholder="0.00"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 4 }}>$</span>,
                }}
                value={budget || ""}
                onChange={e => setBudget(e.target.value)}
                sx={textFieldStyles}
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
                slotProps={{
                  input: { endAdornment: f.suffix || null },
                }}
              />
            )}
          </Box>
        ))}
      </Paper>
      <div
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[680px] bg-white border-t border-gray-200 p-4 z-20">
        <PrimaryBtn onClick={handleCreateProject} title={"Send"} classes="w-full block"
                    disabled={createDisabled}/>
      </div>
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