import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { formatDistanceToNow } from "date-fns";
import RootNavigation from "@/components/Nav/Nav";
import NavigationBar from "@/components/profile/NavigationBar";
import {useSessionContext, useSupabaseClient} from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";
import UserPreview from "@/components/UserPreview";

export default function Chats() {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { session, isLoading: sessionLoading } = useSessionContext();

  useEffect(() => {
    if (!user) return;

    fetchConversations();

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup(); // Unsubscribe on unmount
    };
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("Change received!", payload);
          fetchConversations(); // Refresh conversations when a new message arrives
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchConversations = async () => {
    try {
      if (!user) return;
      // First get all conversations where the current user is a participant
      const { data: userConversations, error: userConvError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user?.id);

      if (userConvError) throw userConvError;

      const conversationIds = userConversations.map((conv) => conv.conversation_id);

      const { data: messages, error: errorMessages } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      if (errorMessages) throw errorMessages;

      // Group by conversation_id and pick the latest message per conversation
      const latestMessagesMap = new Map();

      for (const msg of messages) {
        if (!latestMessagesMap.has(msg.conversation_id)) {
          latestMessagesMap.set(msg.conversation_id, msg);
        }
      }

      const latestMessages = [...latestMessagesMap.values()];

      // Then fetch the full conversation details for those conversations
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          created_at,
          participants:conversation_participants(
            user:users(
              id,
              name,
              email,
              profile_img
            )
          )
        `
        )
        .in("id", conversationIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match our UI needs
      const transformedConversations = conversations
        .map((conv) => {
          const otherParticipant = conv.participants.find((p) => p.user.id !== user?.id);

          return {
            conversation_id: conv.id,
            other_user: otherParticipant?.user,
            latest_message: latestMessages.find((e) => e.conversation_id === conv.id),
          };
        })
        .sort((a, b) => {
          const dateA = a.latest_message?.created_at ? new Date(a.latest_message.created_at) : 0;
          const dateB = b.latest_message?.created_at ? new Date(b.latest_message.created_at) : 0;
          return dateB - dateA; // newest first
        });

      const participantIds = transformedConversations.map((conv) => conv.other_user?.id).filter(Boolean);

      const orConditions = participantIds
        .map(
          (pid) =>
            `requester_id.eq.${user.id},assigner_id.eq.${pid},target_type.eq.chat_request` +
            `,requester_id.eq.${pid},assigner_id.eq.${user.id},target_type.eq.chat_request`
        )
        .join(",");

      const { data: requestsData, error: reqErr } = await supabase
        .from("requests")
        .select("requester_id, assigner_id, status")
        .or(orConditions);

      if (reqErr) throw reqErr;

      const rejectedIds = new Set();
      for (const req of requestsData) {
        if (req.status === "rejected") {
          const otherId = req.requester_id === user.id ? req.assigner_id : req.requester_id;
          rejectedIds.add(otherId);
        }
      }

      const filteredConversations = transformedConversations.filter(
        (conv) => !rejectedIds.has(conv.other_user?.id)
      );

      setConversations(filteredConversations);

    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversationId) => {
    router.push(`/chats/${conversationId}`);
  };

  return (
    <div className="pt-8">
      <RootNavigation title="Your Chats" backBtn />

      <div>
        {loading ? (
          <div className="flex justify-center items-center h-[75vh]">
            <p>Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex justify-center items-center h-[75vh]">
            <p className="text-gray-500">No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <div
                key={conversation.conversation_id}
                onClick={() => handleConversationClick(conversation.conversation_id)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {conversation.other_user?.profile_img ? (
                        <UserPreview
                          key={conversation.other_user.id}
                          link={"/profile/" + conversation.other_user.id}
                          img_url={conversation.other_user.profile_img}
                          height={48}
                          width={48}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                          {(conversation.other_user?.name || conversation.other_user?.email)?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    {conversation.latest_message &&
                      !conversation.latest_message.is_read &&
                      conversation.latest_message.sender_id !== user.id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full" />
                      )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.other_user?.name || conversation.other_user?.email || "Unknown User"}
                      </p>
                      {conversation.latest_message && (
                        <p className="text-xs text-gray-500">
                          {conversation.latest_message.is_read ? "✓✓" : "✓"}{" "}
                          {new Date() - new Date(conversation.latest_message.created_at) < 3600000
                            ? formatDistanceToNow(new Date(conversation.latest_message.created_at), { addSuffix: true })
                            : moment(conversation.latest_message.created_at).format("LT DD/MM/YYYY")}
                        </p>
                      )}
                    </div>
                    {conversation.latest_message && (
                      <p
                        className={`text-sm truncate ${
                          !conversation.latest_message.is_read && conversation.latest_message.sender_id !== user.id
                            ? "font-semibold text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {conversation.latest_message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {session && (
        <NavigationBar />
      )}
    </div>
  );
}
