import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <div className="app-container" style={{ maxWidth: "393px", margin: "0 auto", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp; 