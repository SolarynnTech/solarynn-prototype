import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Loader } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { Alert } from "@mui/material";
import Stack from "@mui/material/Stack";

import useUserStore from "@/stores/useUserStore";
import { REQUEST_STATUSES, REQUEST_STATUSES_VERBS } from "@/models/request";

import RootNavigation from "@/components/Nav/Nav";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";

export default function Notifications() {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    const _data = requests.map((e) => ({
      ...e,
      group: e.target_type === "groups" ? groupsMap[e.target_id] : {},
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
    if (!request.group.title) return "";
    const targetName = request.target_type.charAt(0).toUpperCase() + request.target_type.slice(1).slice(0, -1);
    return `for ${targetName} - ${request.group.title}`;
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

  return (
    <div className="pt-8">
      <RootNavigation title="Notifications" backBtn />

      <div className="pt-12">
        {loading && (
          <div className="flex justify-center items-center h-[75vh]">
            <Loader className="animate-spin text-indigo-500" />
            <p className="ml-2">Loading...</p>
          </div>
        )}

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
                  <p>
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
                  </p>
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
