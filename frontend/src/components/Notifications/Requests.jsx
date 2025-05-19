import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Bell } from "lucide-react";
import { useRouter } from "next/router";
import useUserStore from "@/stores/useUserStore";

export default function NotificationsRequests() {
  const supabase = useSupabaseClient();
  const { user } = useUserStore();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [projectAlertCount, setProjectAlertCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .or(
          [
            `and(status.eq.pending,assigner_id.eq.${user.id},read.eq.false)`,
            `and(status.neq.pending,requester_id.eq.${user.id},read.eq.false)`,
          ].join(",")
        );

      if (error) {
        console.error("Error fetching unread count:", error);
      } else {
        setUnreadCount(count);
      }

      const { count: alertCount, error: alertErr } = await supabase
        .from('new_project_alerts')
        .select('project_id', { head: true, count: 'exact' })
        .eq('user_id', user.id);
      if (alertErr) {
        console.error('Error fetching project alerts count:', alertErr);
      } else {
        setProjectAlertCount(alertCount || 0);
      }
    };

    fetchUnreadCount();
  }, [user, supabase]);

  const total = unreadCount + projectAlertCount;

  return (
    <div onClick={() => router.push("/notifications")}>
      <div className="relative">
        <Bell className="cursor-pointer hover:text-indigo-500"/>
        {total > 0 && (
          <span className="
            absolute -top-1 -right-1
            bg-red-500 text-white text-xs
            rounded-full w-4 h-4
            flex items-center justify-center
          ">
            {total}
          </span>
        )}
      </div>
    </div>
  );
}
