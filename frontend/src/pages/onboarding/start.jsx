import React from "react";
import PrimaryBtn from "../../components/buttons/PrimaryBtn";
import { useRouter } from "next/router";

const OnboardingStartPage = () => {
  const router = useRouter();

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
          router.push("/onboarding/select-categories");
        }}
        title="Continue"
        classes="w-full block"
      />
    </div>
  );
};

export default OnboardingStartPage;
