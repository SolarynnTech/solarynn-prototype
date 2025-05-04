
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";

export default function Mail() {
  const router = useRouter();

  return (
    <div>
      <RootNavigation title="Mailbox" backBtn={true} />

      <div className="pt-12">

        <div className="flex justify-center items-center h-[75vh]">
          <p className="ml-2">Mailbox is not available yet.</p>
        </div>

      </div>

    </div>
  );
}