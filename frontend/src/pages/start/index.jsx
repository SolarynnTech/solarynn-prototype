import React from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const StartPage = () => {
  const router = useRouter();
  const supabase = useSupabaseClient();

  async function fetchData() {
    const { data, error } = await supabase
      .from("ad_agencies_data")
      .select("*");

    if (error) {
      console.error("Error fetching use case templates:", error);
    } else {
      console.log("Fetched data:", data);
    }
  }

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <RootNavigation title={"Solaryyn"} />

      <div className="content pt-12 ">
        <div className="mb-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6aa16236d7d2303d78c21642039e4cccc56b6ef3?placeholderIfAbsent=true"
            alt="Solaryyn Logo"
          />
        </div>

        <div className="text-center px-2">
          <p className="mb-4">
            You're accessing a test version designed for the image industry,
            open to all types of users. Before moving forward, please review and
            accept our terms and conditions.
          </p>
          <p className="mb-8">
            We’re excited to have you on board for this journey!
          </p>
          <p className="mb-4">
            Please review and accept our{" "}
            <a href="/terms-and-conditions">Terms and Conditions</a> to proceed.
            This is a beta version of Solaryn, open for testing and exploration.
            Click Accept to continue
          </p>
        </div>

        <PrimaryBtn
          onClick={() => {
            const token = localStorage.getItem("create-account-token");
            if (token) {
              router.push("/login");
            } else {
              router.push("/create-account");
            }
          }}
          title="I Accept"
          classes="w-full block"
        />
      </div>
    </div>
  );
};

export default StartPage;
