import React from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import classNames from "classnames";
import styles from "./Settings.module.css";
import { ChevronRight, Mail, Phone, Lock, LogOut } from "lucide-react";

export default function Settings() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const logOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const items = [
    {
      title: "Update/Change Email",
      icon: Mail,
      onClick: () => router.push("/settings/email"),
    },
    // {
    //   title: "Update/Change Phone Number",
    //   icon: Phone,
    //   onClick: () => router.push("/settings/phone"),
    // },
    {
      title: "Update/Change Password",
      icon: Lock,
      onClick: () => router.push("/settings/password"),
    },
    {
      title: "Logout",
      icon: LogOut,
      onClick: logOut,
    },
  ];

  return (
    <div>
      <RootNavigation title="Settings" backBtn={true} />

      <div className={styles.settingsContainer}>
        {items.map((item, index) => (
          <div
            key={index}
            className={classNames("cursor-pointer hover:text-indigo-500", styles.settingsContainer__Item)}
            onClick={item.onClick}
          >
            <div className={styles.settingsContainer__Item__Header}>
              <item.icon />
              <span
                className={classNames(
                  "cursor-pointer hover:text-indigo-500",
                  styles.settingsContainer__Item__Header__Title
                )}
              >
                {item.title}
              </span>
            </div>
            <ChevronRight />
          </div>
        ))}
      </div>
    </div>
  );
}
