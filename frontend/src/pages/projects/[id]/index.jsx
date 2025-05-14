import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import RootNavigation from "@/components/Nav/Nav";
import NavigationBar from "@/components/profile/NavigationBar";
import useUserStore from "@/stores/useUserStore.js";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Box, Typography, Dialog, Button, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Loader } from "lucide-react";
import ImageDropZone from "@/components/ImageDropZone.jsx";
import ActionBtn from "@/components/buttons/ActionBtn.jsx";
import CloseIcon from "@mui/icons-material/Close";

const ProjectPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUserStore();
  const [favoriteProjects, setFavoriteProjects] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const supabase = useSupabaseClient();
  const [project, setProject] = useState(null);
  const [answersBySection, setAnswersBySection] = useState({});
  const [sectionTitles, setSectionTitles] = useState([]);
  const [currentFormPage, setCurrentFormPage] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImages, setUploading] = useState(false);
  const [editingImages, setEditingImages] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);


  const handleDeleteClick = () => setDeleteDialogOpen(true);

  const handleConfirmDelete = async () => {
    const { error } = await supabase
      .from("projects")
      .update({ is_hidden: true })
      .eq("id", id);

    if (error) {
      console.error("Failed to delete/archive:", error);
      return;
    }

    setDeleteSuccess(true);
    setTimeout(() => router.push("/projects"), 2000);
  };



  const handleToggleFav = async () => {
    const newFavs = isFav
      ? favoriteProjects.filter(pid => pid !== id)
      : [...favoriteProjects, id];

    const { error } = await supabase
      .from("users")
      .update({ favorite_projects: newFavs })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Could not update favorites:", error);
      return;
    }

    setFavoriteProjects(newFavs);
    setIsFav(!isFav);
  };

  const loadProject = async () => {
    const { data: proj, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("Error fetching project:", error);
      return;
    }
    setProject(proj);
    setImageUrls(proj.images || []);
    const { data: favProgect, error: favProjError } = await supabase
      .from("users")
      .select("favorite_projects")
      .eq("id", user.id)
      .single();

    if (favProjError) {
      console.error("Error fetching project:", favProjError);
      return;
    }

    const favs = favProgect.favorite_projects || [];
    setFavoriteProjects(favs);
    setIsFav(favs.includes(id));
  };

  const handleUploadImage = async (file) => {
    setUploading(true);

    const ext = file.name.split(".").pop();
    const name = `${crypto.randomUUID()}.${ext}`;
    const path = `private/${id}/${name}`;
    const { error: upErr } = await supabase
      .storage
      .from("project-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) {
      console.error("Upload failed:", upErr);
      setUploading(false);
      return;
    }

    const { data: urlData, error: urlErr } = supabase
      .storage
      .from("project-images")
      .getPublicUrl(path);
    if (urlErr || !urlData?.publicUrl) {
      console.error("URL error:", urlErr);
      setUploading(false);
      return;
    }
    const publicUrl = urlData.publicUrl;

    const newUrls = [...imageUrls, publicUrl];
    setImageUrls(newUrls);

    const { error: dbErr } = await supabase
      .from("projects")
      .update({ images: newUrls })
      .eq("id", id);
    if (dbErr) console.error("Couldn’t save image URLs:", dbErr);

    setUploading(false);
  };

  const handleDeleteImage = async (index, url) => {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split("/public/project-images/");
      if (parts.length < 2) {
        console.error("Couldn't extract storage path from URL:", url);
        return;
      }
      const path = decodeURIComponent(parts[1]);
      const { error: delErr } = await supabase
        .storage
        .from("project-images")
        .remove([path]);

      if (delErr) {
        console.error("Delete failed:", delErr);
        return;
      }

      const newUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newUrls);

      const { error: dbErr } = await supabase
        .from("projects")
        .update({ images: newUrls })
        .eq("id", id);

      if (dbErr) console.error("Couldn’t save image URLs:", dbErr);
    } catch (e) {
      console.error("Error in handleDeleteImage:", e);
    }
  };

  const loadProjectDescription = async (answersMap) => {
    const qIds = Object.keys(answersMap);
    if (qIds.length === 0) {
      setAnswersBySection({});
      setSectionTitles([]);
      return;
    }

    const { data: questions, error: qErr } = await supabase
      .from("project_questions")
      .select("id, question")
      .in("id", qIds);
    if (qErr) return console.error(qErr);

    const mid = Math.ceil(questions.length / 2);
    const firstChunk = questions.slice(0, mid);
    const secondChunk = questions.slice(mid);

    const buckets = {
      "Part 1": {},
      "Part 2": {},
    };

    firstChunk.forEach(q => {
      buckets["Part 1"][q.question] = answersMap[q.id];
    });
    secondChunk.forEach(q => {
      buckets["Part 2"][q.question] = answersMap[q.id];
    });

    setAnswersBySection(buckets);
    setSectionTitles(["Part 1", "Part 2"]);
  };

  useEffect(() => {
    if (id && user?.id) loadProject();
  }, [id, user?.id]);

  useEffect(() => {
    if (project?.title) {
      loadProjectDescription(project.description);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="flex justify-center items-center h-[75vh]">
        <Loader className="animate-spin text-green-800"/>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className={"mb-10"}>
      <RootNavigation title={project.title} backBtn/>

      <div className="pt-4 pb-6">
        <div className={"relative"}>
          <img
            src={project.img_url}
            alt="Preview"
            className="mt-2 rounded-md w-full h-auto max-h-[400px] object-contain"
          />
          <IconButton
            onClick={handleToggleFav}
            sx={{
              position: "absolute",
              zIndex: 10,
              top: 16,
              right: 16,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              bgcolor: "rgba(255,255,255, 1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }
            }}
          >
            {isFav
              ? <FavoriteIcon color="success"  sx={{ fontSize: 28 }} />
              : <FavoriteBorderIcon color="success" sx={{ fontSize: 28 }}  />}
          </IconButton>
          {user.id === project.owner && (
            <IconButton
              onClick={handleDeleteClick}
              sx={{
                position: "absolute",
                zIndex: 10,
                top: 74,
                right: 16,
                bgcolor: "white",
                color: "error.main",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }
              }}
            >
              <DeleteIcon sx={{ fontSize: 28 }} />
            </IconButton>
          )}
        </div>
        <NavigationBar/>
      </div>
      <div className="mb-6">
        <h4 className="font-semibold text-lg mb-4">
          Project Description:
        </h4>

        {project.project_description ? (
          <p>{project.project_description}</p>
        ) : (
          <p className="text-gray-400 text-center !text-sm">
            {user.id === project.owner
              ? "You haven’t added a project description yet."
              : "There is no description available for this project."
            }
          </p>
        )}
      </div>
      <h4 className="font-semibold text-lg mb-2">
        Details:
      </h4>
      <div className="p-3 bg-gray-100 rounded-lg shadow-md mb-4 border border-gray-300">
        {sectionTitles.length > 0 &&
          answersBySection[sectionTitles[currentFormPage]] && (
            <div key={sectionTitles[currentFormPage]} className="mb-6">
              <div>
                {Object.entries(
                  answersBySection[sectionTitles[currentFormPage]]
                ).map(([questionTitle, value]) => (
                  <div
                    key={questionTitle}
                    className="mb-4 pb-4 border-b border-gray-300 last:border-0 last:mb-0 last:pb-0"
                  >
                    <p className="mb-2">
                      <b>{questionTitle}:</b>
                    </p>
                    <span className="text-gray-700">
                      {Array.isArray(value) ? value.join(", ") : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

      </div>
      {sectionTitles.length > 0 && (
        <div className="flex items-center justify-between mb-4 overflow-x-auto gap-2 pb-4 -mx-6 px-8">
          {sectionTitles.map((_, idx) => (
            <span
              key={idx}
              className={`${
                currentFormPage === idx ? "bg-green-800" : "bg-gray-300"
              } min-w-8 shrink-0 grow h-1 cursor-pointer rounded-full`}
              onClick={() => setCurrentFormPage(idx)}
            />
          ))}
        </div>
      )}

      <Box mb={4}>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-lg mb-1">Photos:</h4>
          {user.id === project.owner && (
            <ActionBtn
              title={editingImages ? "Done Editing" : "Edit Images"}
              onClick={() => setEditingImages(!editingImages)}
            />
          )}
        </div>

        {editingImages && user.id === project.owner && (
          <>
            <Box mb={2}>
              {uploadingImages ? (
                <p>Uploading…</p>
              ) : imageUrls.length < 10 ? (
                <ImageDropZone
                  onFile={handleUploadImage}
                  uploading={uploadingImages}
                  previewUrl={null}
                />
              ) : null}
            </Box>
            <Box className="flex justify-end mb-2">
              <Typography variant="caption" className="text-gray-600">
                {imageUrls.length} / 10 images
              </Typography>
            </Box>
          </>
        )}

        {imageUrls.length === 0 ? (
          <Box className="mt-4 text-center text-gray-400">
            <Typography variant="body2" className={"!text-sm"}>
              {user.id === project.owner
                ? "You haven’t added any photos yet."
                : "There are no additional photos for this project."
              }
            </Typography>
          </Box>
        ) : (
          <Box className="overflow-x-auto hide-scrollbar -mx-6 px-6 mt-4">
            <Box className="flex gap-4 flex-nowrap relative">
              {imageUrls.map((url, idx) => (
                <Box key={url} className="relative flex-shrink-0">
                  <img
                    src={url}
                    alt="Project asset"
                    className={`w-44 h-60 object-cover rounded ${
                      !editingImages ? "cursor-pointer" : ""
                    }`}
                    onClick={() => {
                      if (!editingImages) {
                        setViewerUrl(url);
                        setViewerOpen(true);
                      }
                    }}
                  />
                  {editingImages && user.id === project.owner && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteImage(idx, url)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 32,
                        height: 32,
                        p: 0,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,1)",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.8)" },
                      }}
                    >
                      <DeleteIcon fontSize="small" sx={{ color: "black" }}/>
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: "transparent", boxShadow: "none" }
        }}
      >
        <IconButton
          onClick={() => setViewerOpen(false)}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <CloseIcon/>
        </IconButton>
        <Box
          component="img"
          src={viewerUrl}
          sx={{
            width: "100%",
            height: "100vh",
            objectFit: "contain",
            bgcolor: "rgba(0,0,0,0.9)",
          }}
        />
      </Dialog>

      <Dialog
        PaperProps={{
          sx: {
            width: { xs: '90%', sm: 400 },
          }
        }}
        open={deleteDialogOpen}
        onClose={() => deleteSuccess ? null : setDeleteDialogOpen(false)}
      >
        <DialogTitle className={"!font-semibold !text-xl"}>
          {deleteSuccess ? "" : "Are you sure?"}
        </DialogTitle>

        <DialogContent>
          {deleteSuccess ? (
            <Typography color="success.main" className={"!font-semibold !text-lg text-center"}>
              Your project was successfully deleted.
            </Typography>
          ) : (
            <Typography>
              This will archive (hide) your project. You won’t be able to see it afterward.
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          {!deleteSuccess && (
            <>
              <ActionBtn
                title={"Cancel"}
                onClick={() => setDeleteDialogOpen(false)}
              />
              <ActionBtn
                title={"Yes, delete"}
                onClick={handleConfirmDelete}
                classes={"bg-red-600 hover:bg-red-700 text-white"}
              />
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectPage;
