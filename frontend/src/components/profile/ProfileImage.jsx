import React from "react";
import { Star } from "lucide-react";

const ProfileImage = () => {
  return (
    <div className="mb-6 -mx-6 p-6 bg-gray-100">
      <div className="relative overflow-hidden rounded-md">
        <div className="absolute top-0 bottom-0 left-0 right-0 z-[1] shadow-[inset_0_-40px_40px_-20px_rgba(0,0,0,0.35)]"></div>
        <img src="/images/profile.png" alt="Profile" />

        <div className="flex items-center text-sm uppercase font-semibold text-green-800 bg-green-100 rounded-full px-4 py-1.5 absolute top-4 right-4">
          <Star size={20} color="#087B43" className="mr-2" />
          <div>Verified</div>
        </div>

        <div className="text-white font-bold text-xl absolute bottom-4 left-4">
          Denzel Ward
        </div>
      </div>
    </div>
  );
};

export default ProfileImage;
