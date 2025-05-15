import React from "react";
import { Loader } from "lucide-react";

export const LoaderItem = () => (
  <div className="flex justify-center items-center h-[75vh]">
    <Loader className="animate-spin text-green-800"/>
    <p className="ml-2">Loading...</p>
  </div>
);