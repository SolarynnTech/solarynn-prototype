import React from "react";
import { useRouter } from "next/router";
import { House, Inbox, User } from "lucide-react";

const NavigationBar = () => {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 bg-white z-10 max-w-[440px] w-full -mx-6 px-6 py-4 flex items-center justify-around border-t border-gray-200">
      <div
        className={`${ router.pathname.includes('home') ? "text-green-800" : ""} flex flex-col items-center justify-center text-xs cursor-pointer hover:text-green-800`}
        onClick={() => router.push("/home")}
      >
        <House className="mb-2" />
        Home
      </div>
      <div
        className={`${ router.pathname.includes('projects') ? "text-green-800" : ""} flex flex-col items-center justify-center text-xs cursor-pointer hover:text-green-800`}
        onClick={() => router.push("/projects/new")}
      >
        <Inbox className="mb-2" />
        Project
      </div>
      <div
        className={`${ router.pathname.includes('profile') ? "text-green-800" : ""} flex flex-col items-center justify-center text-xs cursor-pointer hover:text-green-800`}
        onClick={() => router.push("/profile")}
      >
        <User className="mb-2" />
        Profile
      </div>
    </nav>
  );
};

export default NavigationBar;
