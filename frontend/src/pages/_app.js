import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <main
      className="app-container flex flex-col mx-auto !pt-6 !pb-12"
      style={{ maxWidth: "440px" }}
    >
      <Component {...pageProps} />
    </main>
  );
}

export default MyApp;

// maxWidth: "440px" - it is for Iphone 16 pro max
