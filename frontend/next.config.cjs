/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "www.solarynn.com",
          },
        ],
        destination: "https://solarynn.com",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;