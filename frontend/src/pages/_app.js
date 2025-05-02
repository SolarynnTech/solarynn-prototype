import "../styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { useState } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout';

function MyApp({ Component, pageProps }) {
  const [supabase] = useState(() => createPagesBrowserClient());

  const Layout = Component.layout || DefaultLayout;

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionContextProvider>
  );
}

export default MyApp;

// maxWidth: "440px" - it is for Iphone 16 pro max
