
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
      className="app-container flex flex-col mx-auto !pt-6 !pb-12"
      style={{ maxWidth: "440px" }}
    >
      {children}
    </main>
  );
}

export default DefaultLayout;