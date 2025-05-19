import { useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import useUserStore from "@/stores/useUserStore";

export default function NotificationsChats() {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("conversationsPushNotifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          console.log("[Push] Change received!", payload);
          try {
            const { data: message, error } = await supabase
              .from("messages")
              .select(
                `
                  *,
                  user:users(id, name, email, profile_img)
                `
              )
              .eq("id", payload.new?.id)
              .maybeSingle();

            showNotification(message);

            if (error) throw error;
          } catch (error) {
            console.error(error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const showNotification = (message) => {
    if (!message.user) return;
    if (message.user.id === user.id) return;

    if (Notification.permission === "granted") {
      new Notification(`New message from ${message.user?.name || message.user?.email}`, {
        icon: message.user.profile_img,
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup(); // Unsubscribe on unmount
    };
  }, [user]);

  return null;
}
