/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nbg1.your-objectstorage.com",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
