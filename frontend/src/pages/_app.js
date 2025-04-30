import "../styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { useState } from 'react'

function MyApp({ Component, pageProps }) {
  const [supabase] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
    <main
      className="app-container flex flex-col mx-auto !pt-6 !pb-12"
      style={{ maxWidth: "440px" }}
    >
      <Component {...pageProps} />
    </main>
    </SessionContextProvider>
  );
}

export default MyApp;

// maxWidth: "440px" - it is for Iphone 16 pro max
