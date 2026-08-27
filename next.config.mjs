/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.footystats.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
