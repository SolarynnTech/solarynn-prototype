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
          Ready to set yourself up for success?
        </h3>

        <p className="mb-4">Begin by building your profile. On the next screens, you'll choose your user categories and complete our onboarding questions.</p>
        <p className="mb-4">This vital step is central to our platform, so please provide your most accurate responses. Your input affects how others discover you and your potential fit for projects. This will take just a few minutes.</p>
        <p className="mb-4">Thanks!</p>
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
