// pages/_app.jsx
import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout';
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const [supabase] = useState(() => createPagesBrowserClient());
  const Layout = Component.layout || DefaultLayout;

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <SessionContextProvider
        supabaseClient={supabase}
        initialSession={pageProps.initialSession}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionContextProvider>
    </>
  );
}

export default MyApp;