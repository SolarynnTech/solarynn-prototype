import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import RootNavigation from "@/components/Nav/Nav";
import NavigationBar from "@/components/profile/NavigationBar";
import useUserStore from "@/stores/useUserStore.js";
import useProjectStore from "@/stores/useProjectStore.js";
import {
  Alert,
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
import ProgressTracker from "@/components/project/ProgressTracker.jsx";
import MilestonesSection from "@/components/project/MilestonesSection.jsx";
import {REQUEST_STATUSES} from "@/models/request.js";
import ProjectParticipants from "@/components/project/ProjectParticipants.jsx";

const ProjectPage = ({ accessDenied, projectFromServer }) => {
  const router = useRouter();
  const { id } = router.query;
  const { user, setUser } = useUserStore();
  const { allProjects } = useProjectStore();
  const [favoriteProjects, setFavoriteProjects] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const supabase = useSupabaseClient();
  const [project, setProject] = useState(projectFromServer);
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
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [milestones, setMilestones] = useState([]);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const [requestStatus, setRequestStatus] = useState(null);
  const [requestError, setRequestError] = useState(null);

  console.log("projectFromServer", projectFromServer);

  const onCompletionPercentageChange = async (newValue) => {
    const { error } = await supabase
      .from("projects")
      .update({ completion_percentage: newValue })
      .eq("id", id);
    if (error) {
      console.error("Error updating completion percentage:", error);
      return;
    }
    setCompletionPercentage(newValue);
  };

  const onMilestonesSave = async (newValue) => {
    const { error } = await supabase
      .from("projects")
      .update({ milestones: newValue })
      .eq("id", id);
    if (error) {
      console.error("Error updating completion percentage:", error);
      return;
    }
    setMilestones(newValue);
  };

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

    setUser(prev => ({
      ...prev,
      favorite_projects: newFavs,
    }));

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
    setMilestones(proj.milestones || []);
    setVisibilityValue(proj.project_visibility);
    setCompletionPercentage(proj.completion_percentage || 0);
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

  useEffect(() => {
    if (!user?.id || !project?.id) return;

    const fetchAlertStatus = async () => {
      const { data, error } = await supabase
        .from("project_alerts")
        .select("enabled")
        .eq("user_id", user.id)
        .eq("project_id", project.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching alert status:", error);
        return;
      }

      setNotificationEnabled(data?.enabled === true);
    };

    fetchAlertStatus();
  }, [user?.id, project?.id, supabase]);

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

    let questionsToUse = questions;

    if (!questionsToUse || questionsToUse.length === 0) {
      const { data: questionsUniverse, error: qErr } = await supabase
        .from("universe_questions")
        .select("id, question")
        .in("id", qIds);
      if (qErr) return console.error(qErr);

      questionsToUse = questionsUniverse;
    }

    const mid = Math.ceil(questionsToUse.length / 2);
    const firstChunk = questionsToUse.slice(0, mid);
    const secondChunk = questionsToUse.slice(mid);

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

  const onToggleAlerts = async () => {
    let newStatus = true;

    const { data: existing, error: fetchError } = await supabase
      .from("project_alerts")
      .select("id, enabled")
      .eq("user_id", user.id)
      .eq("project_id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching alert status:", fetchError);
      return;
    }

    if (existing) {
      newStatus = !existing.enabled;
    }

    const { error: upsertError } = await supabase
      .from("project_alerts")
      .upsert({
        user_id: user.id,
        project_id: project.id,
        enabled: newStatus,
      }, { onConflict: ["user_id", "project_id"] });

    if (upsertError) {
      console.error("Error updating alert subscription:", upsertError);
      return;
    }

    setNotificationEnabled(newStatus);
  };

  const sendRequestToJoin = async () => {
    setRequestStatus(REQUEST_STATUSES.PENDING);
    setRequestError(null);

    const isRequestAlreadySent = await supabase
      .from("requests")
      .select("*")
      .eq("requester_id", user.id)
      .eq("assigner_id", project.owner)
      .eq("target_id", id)
      .eq("target_type", "project_request");

    if (isRequestAlreadySent.data.length > 0) {
      setRequestStatus("failed");
      setRequestError("Request already sent");
      cleanRequestMsg();
      return;
    }

    const { error } = await supabase.from("requests").insert({
      requester_id: user.id,
      assigner_id: project.owner,
      status: REQUEST_STATUSES.PENDING,
      target_id: id,
      target_type: "project_request",
    });

    if (error) {
      setRequestStatus("failed");
      setRequestError(error.message);
    } else {
      setRequestStatus("success");
    }

    cleanRequestMsg();
  }

  const cleanRequestMsg = () => {
    setTimeout(() => {
      setRequestStatus(null);
      setRequestError(null);
    }, 3000);
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
    <div className="mb-10 pt-8">
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
          alertsEnabled={notificationEnabled}
          onToggleAlerts={onToggleAlerts}
        />
        <NavigationBar/>
      </div>

      <div>
        {requestStatus === "pending" && (
          <Alert severity="info" className="mb-2">
            Request is being sent...
          </Alert>
        )}
        {requestStatus === "success" && (
          <Alert severity="success" className="mb-2">
            Request sent successfully
          </Alert>
        )}
        {requestStatus === "failed" && (
          <Alert severity="error" className="mb-2">
            {requestError}
          </Alert>
        )}
      </div>

      <PrimaryBtn title={"Request to Join"} classes={"w-full mb-6"} onClick={sendRequestToJoin}/>

      <ProgressTracker percentage={completionPercentage} isOwner={user.id === project.owner}
                       onSave={onCompletionPercentageChange}/>
      <ProjectDescription
        description={project.project_description}
        isOwner={user.id === project.owner}
        budget={project.budget}
      />

      <MilestonesSection isOwner={user.id === project.owner} onSave={onMilestonesSave} milestones={milestones}/>

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

      <ProjectParticipants projectId={id} participants={project.participants}/>

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
    .select("owner, owner_requests, collaborator_users, participants, project_visibility")
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
        projectFromServer: null,
        accessDenied: true,
      },
    };
  }

  return {
    props: {
      projectFromServer: proj,
      accessDenied: false,
    },
  };
};

export default ProjectPage;
