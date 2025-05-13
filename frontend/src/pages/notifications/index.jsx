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

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
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
        .order("updated_at", { ascending: false });

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

    fetchRequests();
  }, [loading, user]);

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

  return (
    <div>
      <RootNavigation title="Notifications" backBtn={true} />

      <div className="pt-12">
        {loading && (
          <div className="flex justify-center items-center h-[75vh]">
            <Loader className="animate-spin text-green-800" />
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
                <Alert key={request.id} variant="outlined" severity={requestSeverity(request)}>
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
                      </>
                    )}

                    {request.assigner.id === user.id && request.status !== REQUEST_STATUSES.PENDING && (
                      <>
                        {userDisplayName(request.assigner)} {REQUEST_STATUSES_VERBS[request.status]}{" "}
                        {userDisplayName(request.requester)}'s request {requestTarget(request)}
                      </>
                    )}
                  </p>
                  <p>Request Updated Date: {moment(request.updated_at).format("DD/MM/YYYY LT")}</p>
                </Alert>
              ))}
            </Stack>
          </>
        )}
      </div>
    </div>
  );
}
