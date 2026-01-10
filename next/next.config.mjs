// import createMDX from '@next/mdx'
// import remarkFrontmatter from 'remark-frontmatter'
// import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
// import remarkGfm from 'remark-gfm';

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
  // Include mdx in page extensions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx']
};

// const withMDX = createMDX({
//   options: {
//     remarkPlugins: [
//       remarkGfm,
//       remarkFrontmatter,
//       [remarkMdxFrontmatter, { name: "frontmatter" }],
//     ],
//     // rehypePlugins: [rehypeSlug],
//   }
// })

// Merge MDX config with Next.js config
export default nextConfig
