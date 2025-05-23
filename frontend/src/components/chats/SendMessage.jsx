import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import useUserStore from "@/stores/useUserStore";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";

export default function ChatsSendMessage({ id }) {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingReq, setLoadingReq] = useState(false);
  const [reqStatus, setReqStatus] = useState("none");

  useEffect(() => {
    if (!user?.id || !id) return;
    setLoadingReq(true);

    supabase
      .from("requests")
      .select("status")
      .or(
        `and(requester_id.eq.${user.id},assigner_id.eq.${id},target_type.eq.chat_request),` +
        `and(requester_id.eq.${id},assigner_id.eq.${user.id},target_type.eq.chat_request)`
      )
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching chat request status:", error);
        } else if (data?.status) {
          setReqStatus(data.status);
        }
      })
      .finally(() => setLoadingReq(false));
  }, [user, id]);

  const handleSendMessage = async () => {
    if (!user?.id || !id || loadingReq) return;
    setLoading(true);
    try {
      if (reqStatus === "none") {
        const { error } = await supabase
          .from("requests")
          .insert({
            requester_id: user.id,
            assigner_id:  id,
            target_type:  "chat_request",
            target_id:    id,
            status:       "pending"
          });
        if (error) throw error;
        setReqStatus("pending");

      } else if (reqStatus === "accepted") {
        const { data: convs } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", user.id);
        const convIds = convs.map(c => c.conversation_id);

        const { data: parts } = await supabase
          .from("conversation_participants")
          .select("conversation_id, user_id")
          .in("conversation_id", convIds);

        const existing = parts.find(
          p => p.user_id === id && convIds.includes(p.conversation_id)
        );

        let convId = existing
          ? existing.conversation_id
          : (await supabase
              .from("conversations")
              .insert({})
              .select("id")
              .single()
          ).data.id;

        if (!existing) {
          await supabase.from("conversation_participants").insert([
            { conversation_id: convId, user_id: user.id },
            { conversation_id: convId, user_id: id },
          ]);
        }

        router.push(`/chats/${convId}`);
      }
    } catch (err) {
      console.error("Error in handleSendMessage:", err);
    } finally {
      setLoading(false);
    }
  };

  let title;
  let disabled = loading || loadingReq;

  switch (reqStatus) {
    case "none":
      title = loading ? "Loading…" : "Request to Chat";
      break;
    case "pending":
      title = "Request Sent…";
      disabled = true;
      break;
    case "accepted":
      title = loading ? "Loading…" : "Go to Chat";
      disabled = loadingReq;
      break;
    case "rejected":
      title = "Request Rejected";
      disabled = true;
      break;
    default:
      title = "Send a Message";
  }

  return (
    <SecondaryBtn
      title={title}
      classes="w-full block mb-12"
      onClick={handleSendMessage}
      disabled={disabled}
    />
  );
}
