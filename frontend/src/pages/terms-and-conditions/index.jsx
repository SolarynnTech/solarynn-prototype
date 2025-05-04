import React from 'react';
import { useRouter } from 'next/router';
import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import SecondaryBtn from "@/components/buttons/SecondaryBtn";

const TermsAndConditionsPage = () => {
  const router = useRouter();

  return (
    <div>
      <RootNavigation title={"Solaryyn"} />

      <div className="content pt-12">
        <div className="logo-container mb-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6aa16236d7d2303d78c21642039e4cccc56b6ef3?placeholderIfAbsent=true"
            alt="Solaryyn Logo"
          />
        </div>

        <div className="px-2">
          <h4 className="mb-2">
            1. Acceptance of Terms
          </h4>
          <p className="mb-4">
            By accessing or using Solaryyn, you acknowledge that you have read,
            understood, and agree to be bound by these Terms and Conditions.
          </p>

          <h4 className="mb-2">
            2. Beta Version
          </h4>
          <p className="mb-4">
            You understand that Solaryyn is currently in beta testing phase. The
            service may contain bugs, errors, or other issues that could affect
            functionality.
          </p>

          <h4 className="mb-2">
            3. User Responsibilities
          </h4>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your
            account information and for all activities that occur under your
            account.
          </p>

          <h4 className="mb-2">
            4. Privacy Policy
          </h4>
          <p className="mb-4">
            Your use of Solaryyn is also governed by our Privacy Policy, which
            can be found on our website.
          </p>

          <h4 className="mb-2">
            5. Limitation of Liability
          </h4>
          <p className="mb-4">
            Solaryyn shall not be liable for any direct, indirect, incidental,
            special, consequential or exemplary damages resulting from your use
            of the service.
          </p>
        </div>

        <PrimaryBtn onClick={() => {
          const token = localStorage.getItem('create-account-token');
            if (token) {
              router.push('/login');
            } else {
              router.push('/create-account');
            }
          }}
          title="I Accept"
          classes="w-full block mb-4"
        />

        <SecondaryBtn onClick={() => {
            router.back();
          }}
          title="Back"
          classes="w-full block"
        />

      </div>
    </div>
  );
};

export default TermsAndConditionsPage;