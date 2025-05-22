import { useRouter } from "next/router";
import classNames from "classnames";

import useUserProfile from "@/hooks/useUserProfile";
import useAllProfiles from "@/hooks/useAllProfiles";
import useAllProjects from "@/hooks/useAllProjects.js";

import styles from "./DefaultLayout.module.css";

const DefaultLayout = ({ children }) => {
  const router = useRouter();
  useUserProfile();
  useAllProfiles();
  useAllProjects();

  return (
    <main
      className={classNames(
        "app-container",
        styles.AppContainer
      )}
    >
      {children}
    </main>
  );
};

export default DefaultLayout;
