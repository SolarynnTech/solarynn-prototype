import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import moment from "moment";
import Link from "next/link";
import { Alert } from "@mui/material";
import Stack from "@mui/material/Stack";

import useUserStore from "@/stores/useUserStore";
import { REQUEST_STATUSES, REQUEST_STATUSES_VERBS } from "@/models/request";

import RootNavigation from "@/components/Nav/Nav";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";
import { LoaderItem } from "@/components/Loader.jsx";

export default function Notifications() {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [projectAlerts, setProjectAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProjectAlerts = async () => {
      setAlertsLoading(true);

      const { data, error } = await supabase
        .from('new_project_alerts')
        .select('project_id, title, updated_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading project alerts:', error);
        setAlertsLoading(false);
        return;
      }

      setProjectAlerts(
        data.map(r => ({
          project_id: r.project_id,
          title:      r.title,
          updated_at: r.updated_at,
        }))
      );

      if (data.length > 0) {
        const ids = data.map(a => a.project_id);
        const now = new Date().toISOString();

        const { error: updErr } = await supabase
          .from('project_alerts')
          .update({ last_viewed_at: now })
          .eq('user_id', user.id)
          .in('project_id', ids);

        if (updErr) {
          console.error('Error bumping last_viewed_at:', updErr);
        }
      }

      setAlertsLoading(false);
    };

    fetchProjectAlerts();
  }, [user]);


  useEffect(() => {
    if (!user) return;
    const fetchMarkAllAsRead = async () => {
      const { error } = await supabase
        .from("requests")
        .update({ read: true })
        .or(
          [
            `and(status.eq.pending,assigner_id.eq.${user.id},read.eq.false)`,
            `and(status.neq.pending,requester_id.eq.${user.id},read.eq.false)`,
          ].join(",")
        );

      if (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    fetchMarkAllAsRead();
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);

    const { data: requests, error } = await supabase
      .from("requests")
      .select(
        `
          *,
          requester:requester_id (id, name, email),
          assigner:assigner_id (id, name, email)
      `
      )
      .or(`requester_id.eq.${user.id},assigner_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    const groupIds = [...new Set(requests.filter((e) => e.target_type === "groups").map((e) => e.target_id))];
    const { data: groups } = await supabase.from("groups").select("id, title").in("id", groupIds);
    const groupsMap = Object.fromEntries((groups || []).map((e) => [e.id, e]));
    const projectIds = [...new Set(requests.filter((e) => e.target_type === "project_request").map((e) => e.target_id))];
    const { data: projects } = await supabase.from("projects").select("id, title").in("id", projectIds);
    const projectsMap = Object.fromEntries((projects || []).map((e) => [e.id, e]));

    const _data = requests.map((e) => ({
      ...e,
      group: e.target_type === "groups" ? groupsMap[e.target_id] : {},
      project: e.target_type === "projects" ? projectsMap[e.target_id] : {},
    }));

    if (error) {
      setError("Error fetching requests");
      console.error("Error fetching requests:", error);
    } else {
      setRequests(_data);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    fetchRequests();
  }, [user]);

  const userDisplayName = (person) =>
    person.id === user.id ? (
      "You"
    ) : (
      <Link href={`/profile/${person.id}`} className="text-blue-500 hover:underline">
        {person.name || person.email}
      </Link>
    );

  const requestSeverity = (request) => {
    switch (request.status) {
      case "pending":
        return "info";
      case "accepted":
        return "success";
      case "rejected":
        return "error";
      default:
        return "info";
    }
  };

  const requestTarget = (request) => {
    const title = request.group?.title || request.project?.title;
    if (!title) return "";
    const targetName = request.target_type.charAt(0).toUpperCase() + request.target_type.slice(1).slice(0, -1);
    return `for ${targetName} - ${title}`;
  };

  const handleAction = async (request, action) => {
    setLoading(true);

    const approve = async () => {
      const { data: newRequest, error } = await supabase
        .from("requests")
        .insert({
          requester_id: request.requester_id,
          assigner_id: request.assigner_id,
          target_id: request.target_id,
          target_type: request.target_type,
          status: action,
        })
        .select("*")
        .maybeSingle();
      if (error) {
        console.error("Error processing request:", error);
      } else {
        if(request.target_type === "project_request") {
          const { data: projectParticipants, error: projectError } = await supabase
            .from("projects")
            .select("participants")
            .eq("id", request.target_id);

          console.log("Project participants:", projectParticipants);

          if(!projectError) {
            const participants = projectParticipants[0].participants || [];
            const newParticipants = [...new Set([...participants, request.requester_id])];

            const { error: updateProjectError } = await supabase
              .from("projects")
              .update({ participants: newParticipants })
              .eq("id", request.target_id);

            if (updateProjectError) {
              console.error("Error updating project participants:", updateProjectError);
            }
          }

          if (projectError) {
            console.error("Error updating project status:", projectError);
          }
        }
      }
      return newRequest;
    };

    const updateCurrentRequest = async (newRequest) => {
      const { error } = await supabase
        .from("requests")
        .update({ action_request_id: newRequest.id })
        .eq("id", request.id);

      if (error) {
        console.error("Error updating current request:", error);
      }
    };

    const newRequest = await approve();
    if (newRequest) {
      await updateCurrentRequest(newRequest);
    }

    setLoading(false);
    fetchRequests();
  };

  if (loading || alertsLoading)
    return (
    <LoaderItem/>
  );

  return (
    <div className="pt-8">
      <RootNavigation title="Notifications" backBtn/>

      <div className="pt-12">

        {projectAlerts.length > 0 && (
          <Stack spacing={1} mb={4}>
            {projectAlerts.map(pa => (
              <Alert key={pa.project_id} severity="info">
                Project <a href={`/projects/${pa.project_id}`} className={"text-black font-semibold underline cursor-pointer"}>{pa.title}</a> was updated at{" "}
                {moment(pa.updated_at).format("DD/MM/YYYY HH:mm")}
              </Alert>
            ))}
          </Stack>)
        }

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {requests.length === 0 && (
              <div className="flex justify-center items-center h-[75vh]">
                <p className="ml-2">There are no notifications yet.</p>
              </div>
            )}
            <Stack sx={{ width: "100%" }} spacing={1}>
              {requests.map((request) => (
                <Alert key={request.id} severity={requestSeverity(request)}>
                  <div>
                    {request.requester.id === user.id && request.status === REQUEST_STATUSES.PENDING && (
                      <>
                        {userDisplayName(request.requester)} {REQUEST_STATUSES_VERBS[request.status]} a request to{" "}
                        {userDisplayName(request.assigner)} {requestTarget(request)}
                      </>
                    )}

                    {request.requester.id === user.id && request.status !== REQUEST_STATUSES.PENDING && (
                      <>
                        {userDisplayName(request.assigner)} {REQUEST_STATUSES_VERBS[request.status]} your request{" "}
                        {requestTarget(request)}
                      </>
                    )}

                    {request.assigner.id === user.id && request.status === REQUEST_STATUSES.PENDING && (
                      <>
                        {userDisplayName(request.requester)} {REQUEST_STATUSES_VERBS[request.status]} a request to{" "}
                        {userDisplayName(request.assigner)} {requestTarget(request)}
                        {!request.action_request_id && (
                          <div className="flex gap-2 mt-1 mb-1">
                            <SecondaryBtn
                              classes="!py-1 text-sm"
                              title="Approve"
                              onClick={() => handleAction(request, REQUEST_STATUSES.ACCEPTED)}
                            />
                            <SecondaryBtn
                              classes="!py-1 text-sm"
                              title="Reject"
                              onClick={() => handleAction(request, REQUEST_STATUSES.REJECTED)}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {request.assigner.id === user.id && request.status !== REQUEST_STATUSES.PENDING && (
                      <>
                        {userDisplayName(request.assigner)} {REQUEST_STATUSES_VERBS[request.status]}{" "}
                        {userDisplayName(request.requester)}'s request {requestTarget(request)}
                      </>
                    )}
                  </div>
                  <p>Request Date: {moment(request.created_at).format("DD/MM/YYYY LT")}</p>
                </Alert>
              ))}
            </Stack>
          </>
        )}
      </div>
    </div>
  );
}
