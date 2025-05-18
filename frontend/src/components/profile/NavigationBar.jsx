import React from "react";
import { useRouter } from "next/router";
import { House, Inbox, User } from "lucide-react";
import useUserStore from "@/stores/useUserStore";
import NotificationsChats from "@/components/Notifications/Chats";

const NavigationBar = () => {
  const router = useRouter();

  const { user } = useUserStore();

  return (
    <nav className="fixed bottom-0 bg-white z-10 max-w-[440px] w-full -mx-6 px-6 py-4 flex items-center justify-around border-t border-gray-200">
      <div
        className={`${router.pathname.includes("home") ? "text-indigo-500" : ""} flex flex-col items-center justify-center text-xs cursor-pointer hover:text-indigo-500`}
        onClick={() => router.push("/home")}
      >
        <House className="mb-2" />
        Home
      </div>
      <div
        className={`${router.pathname.includes("projects") ? "text-indigo-500" : ""} flex flex-col items-center justify-center text-xs cursor-pointer hover:text-indigo-500`}
        onClick={() => router.push("/projects")}
      >
        <Inbox className="mb-2" />
        Projects
      </div>
      <NotificationsChats />
      <div
        className={`${router.pathname.includes("profile") ? "text-indigo-500" : ""} flex flex-col items-center justify-center text-xs cursor-pointer hover:text-indigo-500`}
        onClick={() => router.push("/profile/" + user.id)}
      >
        <User className="mb-2" />
        Profile
      </div>
    </nav>
  );
};

export default NavigationBar;
