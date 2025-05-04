
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function Settings() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const logOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div>
      <RootNavigation title="Settings" backBtn={true} />

      <div className="pt-12">

        <SecondaryBtn onClick={logOut} title={"Logout"} />

      </div>

    </div>
  );
}