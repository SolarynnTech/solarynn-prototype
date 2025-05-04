
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";

export default function Notifications() {
  const router = useRouter();

  return (
    <div>
      <RootNavigation title="Notifications" backBtn={true} />

      <div className="pt-12">

        <div className="flex justify-center items-center h-[75vh]">
          <p className="ml-2">Notifications are not available yet.</p>
        </div>

      </div>

    </div>
  );
}