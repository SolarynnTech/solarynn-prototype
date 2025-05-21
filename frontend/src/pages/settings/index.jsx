import React, { useState } from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import classNames from "classnames";
import styles from "./Settings.module.css";
import { ChevronRight, Mail, Lock, LogOut, Trash2 } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function Settings() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [openModal, setOpenModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const logOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    setLoadingDelete(true);
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error("No user ID");

      const res = await fetch("/api/deleteUser", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();
      if (result.success) {
        alert("Account deleted");
        await logOut();
      } else {
        console.log(result);
        alert("Failed to delete account: " + result.error);
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("An error occurred");
    }
    setLoadingDelete(false);
  };

  const items = [
    {
      title: "Update/Change Email",
      icon: Mail,
      onClick: () => router.push("/settings/email"),
    },
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
    {
      title: "Delete Account",
      icon: Trash2,
      textColorClasses: "text-red-500",
      onClick: () => setOpenModal(true),
    },
    // {
    //   title: "Update/Change Phone Number",
    //   icon: Phone,
    //   onClick: () => router.push("/settings/phone"),
    // },
  ];

  return (
    <div className="pt-8">
      <RootNavigation title="Settings" backBtn={true} />

      <div className={styles.settingsContainer}>
        {items.map((item, index) => (
          <div
            key={index}
            className={classNames(
              "cursor-pointer hover:text-indigo-500",
              styles.settingsContainer__Item,
              item.textColorClasses
            )}
            onClick={item.onClick}
          >
            <div className={styles.settingsContainer__Item__Header}>
              <item.icon />
              <span className={styles.settingsContainer__Item__Header__Title}>{item.title}</span>
            </div>
            <ChevronRight />
          </div>
        ))}
      </div>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} disabled={loadingDelete}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" disabled={loadingDelete}>
            {loadingDelete ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
