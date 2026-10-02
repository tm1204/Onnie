import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets verification builds/servers use their own folder so they never disturb a running `npm run dev`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  experimental: {
    // Audio clips are uploaded through a server action.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
