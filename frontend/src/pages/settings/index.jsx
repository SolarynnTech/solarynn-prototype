
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";

export default function Settings() {
  const router = useRouter();

  const logOut = () => {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div>
      <RootNavigation title="Mailbox" backBtn={true} />

      <div className="pt-12">

        <SecondaryBtn onClick={logOut} title={"Logout"} />

      </div>

    </div>
  );
}