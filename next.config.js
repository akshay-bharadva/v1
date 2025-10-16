// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Add this section to ensure API routes are treated correctly during export
  // For sitemap.xml and feed.xml to be generated as static files.
  // This part is more relevant if your routes don't end with .xml or .json
  // For routes like /api/sitemap.xml, Next.js export usually handles it.
  // However, to be explicit or for custom paths:
  // exportPathMap: async function (
  //   defaultPathMap,
  //   { dev, dir, outDir, distDir, buildId }
  // ) {
  //   return {
  //     ...defaultPathMap,
  //     '/sitemap.xml': { page: '/api/sitemap.xml' },
  //     '/feed.xml': { page: '/api/feed.xml' },
  //   };
  // },
};

module.exports = nextConfig;
