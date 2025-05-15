import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import RootNavigation from "@/components/Nav/Nav";
import NavigationBar from "@/components/profile/NavigationBar";
import useUserStore from "@/stores/useUserStore.js";
import {
  Box,
  Typography,
} from "@mui/material";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import ConfirmDeleteProjectModal from "@/components/modals/ConfirmDeleteProjectModal.jsx";
import ImageViewerModal from "@/components/modals/ImageViewerModal.jsx";
import PhotosSection from "@/components/project/PhotosSection.jsx";
import ProjectDetails from "@/components/project/ProjectDetailsSection.jsx";
import ProjectVisibilitySection from "@/components/project/ProjectVisibilitySection.jsx";
import ProjectDescription from "@/components/project/DescriptionSection.jsx";
import ProjectImage from "@/components/project/ProjectImage.jsx";
import PrimaryBtn from "@/components/buttons/PrimaryBtn.jsx";
import { LoaderItem } from "@/components/Loader.jsx";

const ProjectPage = ({ accessDenied }) => {
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
  const [tipOpen, setTipOpen] = useState(false);
  const [editingVisibility, setEditingVisibility] = useState(false);
  const [visibilityValue, setVisibilityValue] = useState(project?.project_visibility);

  const saveVisibility = async () => {
    const { error } = await supabase
      .from("projects")
      .update({ project_visibility: visibilityValue })
      .eq("id", id);

    if (!error) {
      setProject(prev => ({ ...prev, project_visibility: visibilityValue }));
      setEditingVisibility(false);
    }
  };

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
    setVisibilityValue(proj.project_visibility);
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
  }, [project?.id]);

  if (!project || !user) return <LoaderItem/>;

  if (accessDenied) {
    return (
      <Box className="flex flex-col items-center justify-center h-[90vh] px-6">
        <Typography variant="body1" align="center">
          This project is private.<br/>
          You can ask the owner to grant you access or invite you to view this page.
        </Typography>
      </Box>
    );
  }

  return (
    <div className="mb-10">
      <RootNavigation title={project.title} backBtn/>
      <div className="pt-4 pb-6">
        <ProjectImage
          imgUrl={project.img_url}
          isFav={isFav}
          onToggleFav={handleToggleFav}
          onImageClick={() => {
            setViewerUrl(project.img_url);
            setViewerOpen(true);
          }}
        />
        <NavigationBar/>
      </div>

      <ProjectDescription
        description={project.project_description}
        isOwner={user.id === project.owner}
      />

      <ProjectVisibilitySection
        projectVisibility={project.project_visibility}
        isOwner={user.id === project.owner}
        editing={editingVisibility}
        visibilityValue={visibilityValue}
        tipOpen={tipOpen}
        onToggleTip={() => setTipOpen(prev => !prev)}
        onToggleEdit={() => setEditingVisibility(true)}
        onSave={saveVisibility}
        onCancel={() => {
          setVisibilityValue(project.project_visibility);
          setEditingVisibility(false);
        }}
        onChange={(e) => setVisibilityValue(e.target.value)}
      />

      <ProjectDetails
        answersBySection={answersBySection}
        sectionTitles={sectionTitles}
        currentFormPage={currentFormPage}
        onPageChange={setCurrentFormPage}
      />

      <PhotosSection
        imageUrls={imageUrls}
        uploadingImages={uploadingImages}
        editingImages={editingImages}
        onToggleEditing={() => setEditingImages(!editingImages)}
        onUploadImage={handleUploadImage}
        onDeleteImage={handleDeleteImage}
        onViewImage={url => {
          setViewerUrl(url);
          setViewerOpen(true);
        }}
        userId={user.id}
        ownerId={project.owner}
      />

      <ImageViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        src={viewerUrl}
      />

      {user.id === project.owner && (
        <PrimaryBtn
          title="Delete Project"
          onClick={() => setDeleteDialogOpen(true)}
          classes="bg-red-600 hover:bg-red-700 text-white w-full mb-2 transition duration-200"
        />
      )}

      <ConfirmDeleteProjectModal open={deleteDialogOpen}
                                 deleteSuccess={deleteSuccess}
                                 onClose={() => setDeleteDialogOpen(false)}
                                 onCancel={() => setDeleteDialogOpen(false)}
                                 onConfirm={handleConfirmDelete}/>
    </div>
  );
};

export const getServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user.id;
  const projectId = ctx.params?.id;
  if (!userId) {
    return {
      props: {
        accessDenied: true,
      },
    };
  }

  const { data: proj, error } = await supabase
    .from("projects")
    .select("owner, owner_requests, collaborator_users, project_visibility")
    .eq("id", projectId)
    .maybeSingle();

  if (error || !proj) {
    return { notFound: true };
  }

  const isOwner = proj.owner === userId;
  const isInvited = proj.owner_requests?.includes(userId);
  const isMember = proj.collaborator_users?.includes(userId);
  const isPrivate = proj.project_visibility === "private";

  if (isPrivate && !isOwner && !isInvited && !isMember) {
    return {
      props: {
        project: null,
        accessDenied: true,
      },
    };
  }

  return {
    props: {
      project: proj,
      accessDenied: false,
    },
  };
};

export default ProjectPage;
