import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/router";

import useUserStore from "@/stores/useUserStore";

export default function NotificationsChats() {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("conversationsUnread")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("Change received!", payload);
          fetchUnreadCount(); // Refresh unreadCount when a new message arrives
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchUnreadCount = async () => {
    const { data: userConversations, error: userConvError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user?.id);

    if (userConvError) throw userConvError;

    const conversationIds = userConversations.map((conv) => conv.conversation_id);

    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    if (error) {
      console.error("Error fetching unread count:", error);
    } else {
      setUnreadCount(count);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup(); // Unsubscribe on unmount
    };
  }, [user]);

  return (
    <div
      className={`${router.pathname.includes("chats") ? "text-indigo-500" : ""} flex flex-col items-center justify-center text-xs cursor-pointer hover:text-indigo-500`}
      onClick={() => router.push("/chats")}
    >
      <div className="relative">
        <MessageSquare className="mb-2" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>
      Chats
    </div>
  );
}
