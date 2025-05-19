import React from "react";
import { useRouter } from "next/router";
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from 'next/link';
import {Checkbox} from "@mui/material";

const StartPage = () => {
  const router = useRouter();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [tosAccepted, setTosAccepted] = React.useState(false);

  React.useEffect(() => {
    if(session) {
      router.push("/onboarding/start");
    }
  }, [session]);

  return (
    <div className="pt-8">
      <RootNavigation title={"Solaryyn"} />

      <div className="content pt-6">
        <div className="mb-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6aa16236d7d2303d78c21642039e4cccc56b6ef3?placeholderIfAbsent=true"
            alt="Solaryyn Logo"
          />
        </div>

        <div className="px-2">
          <h4 className="text-center mb-6">Welcome to the beta version of Solarynn!</h4>
          <p className="mb-4">
            In our world, we see projects (in its more common form: ideas) as the most important asset in human history and believe it should be simpler to develop, reach the right people, or connect with those who might be interested.
          </p>
          <p className="mb-4">
            No potential project or idea that could have changed your outcome (or someone else's) should end up in the graveyard of what could have been, simply for lack of a proper platform.
          </p>
          <p className="mb-4">Please allow us to introduce a beta version of our upcoming platform, dedicated to the image industry (Fashion – Modelling – Casting – Marketing – Advertising – Public Appearances…).</p>
          <p className="mb-4">As we build our first mobile application, more industries will be added. We look forward to helping facilitate processes that allow you to develop multiple projects dear to you.</p>
          <p className="mb-4">
            Please note this is a beta platform, intended only to help you get started and understand our platform. For more information, please review our <br/> <Link href="/terms-and-conditions">terms and conditions</Link>.
          </p>
          <p className="mb-8">Now, let’s get you started!</p>

          <div className="flex items-center mb-8">
            <Checkbox
              size={'small'}
              color="primary"
              disableRipple
              disableTouchRipple
              checked={tosAccepted}
              onChange={(e) => setTosAccepted(e.target.checked)}
            />
            <label htmlFor="tos-acceptance">
              I accept the <strong>Terms and Conditions</strong>
            </label>
          </div>
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
          disabled={sessionLoading || !tosAccepted}
          title="Continue"
          classes="w-full block"
        />
      </div>
    </div>
  );
};

export default StartPage;
