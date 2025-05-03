
import useUserProfile from "@/hooks/useUserProfile";

const DefaultLayout = ({children}) => {
  const {loading} = useUserProfile();

  // if (loading) {
  //   return (
  //     <></>
  //   )
  // }

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