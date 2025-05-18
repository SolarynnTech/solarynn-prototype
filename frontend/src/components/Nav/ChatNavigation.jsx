import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/router";

import UserPreview from "@/components/UserPreview";

const ChatNavigation = ({ user, backBtn = false }) => {
  const router = useRouter();

  const onBackButtonClick = () => {
    window.history.back();
  };

  return (
    <nav className="fixed top-0 bg-chat-normal z-10 max-w-[440px] w-full -mx-6 px-8 py-2 flex items-center gap-3">
      {backBtn && (
        <button
          type="button"
          className="absolute left-0 top-1.5 outline-0 bg-transparent border-0 p-1.5 hover:text-indigo-500"
          onClick={onBackButtonClick}
        >
          <ChevronLeft />
        </button>
      )}

      <>
        {user?.profile_img && (
          <UserPreview key={user.id} link={"/profile/" + user.id} img_url={user.profile_img} height={32} width={32} />
        )}
        <h2
          className="text-center cursor-pointer hover:text-indigo-500"
          onClick={() => router.push("/profile/" + user.id)}
        >
          {user?.name || user?.email || "Chat"}
        </h2>
      </>
    </nav>
  );
};

export default ChatNavigation;
