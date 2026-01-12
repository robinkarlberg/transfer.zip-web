import createMDX from '@next/mdx'

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
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx']
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
