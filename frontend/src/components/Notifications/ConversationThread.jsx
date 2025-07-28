import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { formatDistanceToNow } from "date-fns";
import ChatNavigation from "@/components/Nav/ChatNavigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUserStore from "@/stores/useUserStore";
import { Send, X } from "lucide-react";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function ConversationThread() {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const router = useRouter();
  const { conversationId } = router.query;
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [openMessage, setOpenMessage] = useState(null);
  const open = Boolean(anchorEl);

  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedByOther, setBlockedByOther] = useState(false);

  const handleMenuOpen = (event, messageId) => {
    setAnchorEl(event.currentTarget);
    setOpenMessageId(messageId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenMessageId(null);
  };

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();
    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup(); // Unsubscribe on unmount or when conversationId changes
    };
  }, [user, conversationId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("New message received!", payload);
          setMessages((prev) => [...prev, payload.new]);
          markMessageAsRead(payload.new.id);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("Message updated!", payload);
          setMessages((prev) => prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg)));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("Message deleted!", payload);
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [loading, messages]);

  const fetchMessages = async () => {
    try {
      if (!user) return;
      // Fetch conversation details and other user
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .select(
          `
          id,
          participants:conversation_participants(
            user:users(
              id,
              name,
              email,
              profile_img,
              blocked_users
            )
          )
        `
        )
        .eq("id", conversationId)
        .single();
      if (convError) throw convError;

      const otherParticipant = conversation.participants.find((p) => p.user.id !== user?.id);
      setOtherUser(otherParticipant?.user);
      setBlockedByMe(
        Array.isArray(user.blocked_users) &&
        user.blocked_users.includes(otherParticipant.user.id)
      );
      setBlockedByOther(
        Array.isArray(otherParticipant.user.blocked_users) &&
        otherParticipant.user.blocked_users.includes(user.id)
      );

      // Fetch messages
      const { data: messages, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (msgError) throw msgError;

      setMessages(messages);

      // Mark all messages as read
      const unreadMessages = messages.filter((msg) => !msg.is_read && msg.sender_id !== user?.id);

      if (unreadMessages.length > 0) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .in(
            "id",
            unreadMessages.map((msg) => msg.id)
          );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      if (!user) return;
      await supabase.from("messages").update({ is_read: true }).eq("id", messageId).neq("sender_id", user.id);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (editingMessage) {
        await handleEditMessage(editingMessage.id, newMessage.trim());
      } else {
        const { error } = await supabase.from("messages").insert([
          {
            conversation_id: conversationId,
            content: newMessage.trim(),
            sender_id: user?.id,
            is_read: false,
          },
        ]);

        if (error) throw error;
      }
      setNewMessage("");
      setEditingMessage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ content: newContent })
        .eq("id", messageId)
        .eq("sender_id", user.id);

      if (error) throw error;
      setEditingMessage(null);
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const { error } = await supabase.from("messages").delete().eq("id", messageId).eq("sender_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto pt-20 pb-20 relative">

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col w-fit max-w-[75%] rounded-lg p-3 pr-6 relative ${message.sender_id === otherUser?.id ? "mr-auto" : "ml-auto"} ${
                  message.sender_id === otherUser?.id ? "bg-indigo-100 text-gray-900" : "bg-indigo-600 text-white"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-end space-x-2 mt-1.5">
                  <i className={`text-xs ${message.sender_id === otherUser?.id ? "text-gray-500" : "text-indigo-200"}`}>
                    {new Date() - new Date(message.created_at) < 3600000
                      ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
                      : moment(message.created_at).format("LT DD/MM/YYYY")}
                  </i>
                  {message.sender_id !== otherUser?.id && (
                    <i className="text-xs text-indigo-200">{message.is_read ? "✓✓" : "✓"}</i>
                  )}
                </div>

                {message.sender_id === user?.id && (
                  <div className="absolute z-10 right-0 top-0">
                    <IconButton
                      size="small"
                      aria-label="more"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setOpenMessage(message);
                      }}
                    >
                      <MoreVertIcon className={"text-white"} fontSize="small"/>
                    </IconButton>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef}/>
          </div>
        )}

        <Menu
          id="message-options-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => {
            setAnchorEl(null);
            setOpenMessage(null);
          }}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem
            onClick={() => {
              setEditingMessage(openMessage);
              setNewMessage(openMessage?.content || "");
              setAnchorEl(null);
              setOpenMessage(null);
            }}
          >
            <EditIcon fontSize="small" className="mr-2"/>
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDeleteMessage(openMessage?.id);
              setAnchorEl(null);
              setOpenMessage(null);
            }}
          >
            <DeleteIcon fontSize="small" className="mr-2"/>
            Delete
          </MenuItem>
        </Menu>
      </div>


      <form
        onSubmit={handleSendMessage}
        className="fixed flex-col bg-indigo-50 bottom-0 z-10 max-w-[680px] w-full -mx-6 px-6 py-4 flex items-center justify-around border-t border-gray-200"
      >
        {(blockedByOther || blockedByMe) && (
          <div className="mb-4">
            {blockedByOther && (
              <div className="px-4 py-2 bg-red-100 text-red-600 text-center">
                This user has blocked you. You cannot send messages.
              </div>
            )}
            {blockedByMe && (
              <div className="px-4 py-2 bg-gray-100 text-red-600 text-center">
                You have blocked this user. Unblock to resume messaging.
              </div>
            )}
          </div>
        )}
        <div className="w-full flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              disabled={blockedByMe || blockedByOther}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
              className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              style={{ paddingRight: "2.5rem" }}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Smile size={20}/>
            </button>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-12 right-0">
                <EmojiPicker onEmojiClick={onEmojiClick} width={310}/>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || blockedByMe || blockedByOther}
            className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className={"mr-0.5"}/>
            Send
          </button>
          {editingMessage && (
            <button
              type="button"
              onClick={() => {
                setEditingMessage(null);
                setNewMessage("");
              }}

              className="px-3 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2"
            >
              <X/>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
