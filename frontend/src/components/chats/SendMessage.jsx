import React, { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import useUserStore from "@/stores/useUserStore";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";

export default function ChatsSendMessage({ id }) {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!user || !id) return;
    setLoading(true);

    try {
      // First, check if a conversation already exists between these users
      const { data: existingConversations, error: convError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (convError) throw convError;

      const conversationIds = existingConversations.map((conv) => conv.conversation_id);

      // Get all participants for these conversations
      const { data: participants, error: partError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", conversationIds);

      if (partError) throw partError;

      // Find conversation where both users are participants
      const existingConversation = participants.find(
        (p) => p.user_id === id && conversationIds.includes(p.conversation_id)
      );

      if (existingConversation) {
        // If conversation exists, redirect to it
        router.push(`/chats/${existingConversation.conversation_id}`);
      } else {
        // If no conversation exists, create a new one
        const { data: newConversation, error: newConvError } = await supabase
          .from("conversations")
          .insert([{}])
          .select()
          .single();

        if (newConvError) throw newConvError;

        // Add both users as participants
        const { error: participantsError } = await supabase.from("conversation_participants").insert([
          { conversation_id: newConversation.id, user_id: user.id },
          { conversation_id: newConversation.id, user_id: id },
        ]);

        if (participantsError) throw participantsError;

        // Redirect to the new conversation
        router.push(`/chats/${newConversation.id}`);
      }
    } catch (error) {
      console.error("Error handling send message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SecondaryBtn
      title={loading ? "Loading..." : "Send a Message"}
      classes="w-full block mb-12"
      onClick={handleSendMessage}
      disabled={loading}
    />
  );
}
