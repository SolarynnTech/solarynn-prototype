import React from "react";
import { Loader } from "lucide-react";

export const LoaderItem = () => (
  <div className="flex justify-center items-center h-[75vh]">
    <Loader className="animate-spin text-indigo-500"/>
    <p className="ml-2">Loading...</p>
  </div>
);