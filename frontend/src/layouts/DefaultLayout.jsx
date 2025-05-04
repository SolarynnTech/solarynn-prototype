
import useUserProfile from "@/hooks/useUserProfile";
import useAllProfiles from "@/hooks/useAllProfiles";

const DefaultLayout = ({children, }) => {
  useUserProfile();
  useAllProfiles();

  return (
    <main
      className="app-container"
      style={{ maxWidth: "440px" }}
    >
      {children}
    </main>
  );
}

export default DefaultLayout;