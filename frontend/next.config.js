/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
  },
  env: {
    NEXT_PUBLIC_FUSION_RELAY_URL: process.env.NEXT_PUBLIC_FUSION_RELAY_URL,
    NEXT_PUBLIC_FUSION_NOSTR_PUBLIC_KEY: process.env.NEXT_PUBLIC_FUSION_NOSTR_PUBLIC_KEY,
    NEXT_PUBLIC_NEUROFUSION_BACKEND_URL: process.env.NEXT_PUBLIC_NEUROFUSION_BACKEND_URL,
    NEXT_PUBLIC_ANALYSIS_SERVER_URL: process.env.NEXT_PUBLIC_ANALYSIS_SERVER_URL,
    NEXT_PUBLIC_APP_INSIGHTS_KEY: process.env.NEXT_PUBLIC_APP_INSIGHTS_KEY,
  },
};
