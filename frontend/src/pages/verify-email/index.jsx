import React from "react";
import RootNavigation from "@/components/Nav/Nav";

export default function VerifyEmailPage() {
  return (
    <div>
      <RootNavigation title="Email Verification" />

      <div className="pt-12 px-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Check your inbox</h2>
        <p className="text-gray-600">
          We've sent you a verification link. Please confirm your email to complete your sign-up process.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Once confirmed, you will be processed to your profile setup.
        </p>
      </div>
    </div>
  );
}