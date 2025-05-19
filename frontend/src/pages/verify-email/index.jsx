import React from "react";

export default function VerifyEmailPage() {
  return (
    <div>
      <div className="px-6 text-center">
        <img src={"https://fyyvtuovzbvsldghtbhd.supabase.co/storage/v1/object/public/system/solaryn.png"} className={"justify-self-start self-start w-32 block mx-auto mb-24"} alt={"Solaryn"} />

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