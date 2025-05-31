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
    <nav className="fixed top-0 bg-gray-50 border-b border-gray-200 z-20 max-w-[680px] w-full -mx-6 px-8 py-3 flex items-center gap-3">
      {backBtn && (
        <button
          type="button"
          className="absolute left-0 top-2 outline-0 bg-transparent border-0 p-1.5 hover:text-indigo-500"
          onClick={onBackButtonClick}
        >
          <ChevronLeft />
        </button>
      )}

      <div className={"grow flex items-center gap-2 justify-center"}>
        {user?.profile_img && (
          <UserPreview key={user.id} link={"/profile/" + user.id} img_url={user.profile_img} height={30} width={30} />
        )}
        <h3
          className="text-center cursor-pointer hover:text-indigo-500"
          onClick={() => router.push("/profile/" + user.id)}
        >
          {user?.name || user?.email || "Chat"}
        </h3>
      </div>
    </nav>
  );
};

export default ChatNavigation;
