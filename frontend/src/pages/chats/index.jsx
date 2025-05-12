
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";

export default function Chats() {
  const router = useRouter();

  return (
    <div>
      <RootNavigation title="Your Chats" backBtn={true} />

      <div className="pt-12">

        <div className="flex justify-center items-center h-[75vh]">
          <p className="ml-2">Chats are not available yet. We are working on it.</p>
        </div>

      </div>

    </div>
  );
}