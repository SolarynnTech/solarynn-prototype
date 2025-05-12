import React from "react";
import PrimaryBtn from "../../components/buttons/PrimaryBtn";
import { useRouter } from "next/router";
import useUserStore from "@/stores/useUserStore";

const OnboardingStartPage = () => {
  const router = useRouter();

  const {user} = useUserStore();

  React.useEffect(() => {
    if (user){
      if(user.role && !user.domain) {
        router.push("/onboarding/domain");
      } else if (user.role && user.domain && !user.subdivision) {
        router.push("/onboarding/sub-division");
      } else if(user.role && user.domain && user.subdivision && (!user.questionnaire_answers || !Object.keys(user.questionnaire_answers).length)) {
        router.push("/questionnaire");
      } else {
        router.push("/home");
      }
    }
  }, [user]);

  return (
    <div className="flex flex-col h-full justify-between grow">
      <div className="flex grow flex-col justify-center items-center px-2">
        <h3 className="text-center mb-4">
          Now, let’s start building your profile to set you up for success
        </h3>

        <ul className="list-disc text-left mb-4 pl-6">
          <li className="mb-3">
            This is a crucial step to ensure efficiency, measurable results, and
            steady progress throughout your project.
          </li>
          <li className="mb-3">
            Completing your profile will take approximately 5 minutes. Please
            answer all questions as accurately and thoroughly as possible
          </li>
        </ul>
      </div>

      <PrimaryBtn
        onClick={() => {
          router.push("/onboarding");
        }}
        title="Continue"
        classes="w-full block"
      />
    </div>
  );
};

export default OnboardingStartPage;
