import React, { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Alert } from "@mui/material";

import useUserStore from "@/stores/useUserStore";
import { REQUEST_STATUSES } from "@/models/request";

import SecondaryBtn from "@/components/buttons/SecondaryBtn";

const SendRequest = ({ assignerId, groupId }) => {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();

  const [requestStatus, setRequestStatus] = useState(null);
  const [requestError, setRequestError] = useState(null);

  const sendRequest = async () => {
    setRequestStatus(REQUEST_STATUSES.PENDING);
    setRequestError(null);

    const isRequestAlreadySent = await supabase
      .from("requests")
      .select("*")
      .eq("requester_id", user.id)
      .eq("assigner_id", assignerId)
      .eq("target_id", groupId)
      .eq("target_type", "groups");

    if (isRequestAlreadySent.data.length > 0) {
      setRequestStatus("failed");
      setRequestError("Request already sent");
      cleanRequestMsg();
      return;
    }

    const { error } = await supabase.from("requests").insert({
      requester_id: user.id,
      assigner_id: assignerId,
      status: REQUEST_STATUSES.PENDING,
      target_id: groupId,
      target_type: "groups",
    });

    if (error) {
      setRequestStatus("failed");
      setRequestError(error.message);
    } else {
      setRequestStatus("success");
    }

    cleanRequestMsg();
  };

  const cleanRequestMsg = () => {
    setTimeout(() => {
      setRequestStatus(null);
      setRequestError(null);
    }, 3000);
  };

  return (
    <>
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
      <SecondaryBtn title="Send A Request" classes="w-full block" onClick={sendRequest} />
    </>
  );
};

export default SendRequest;
