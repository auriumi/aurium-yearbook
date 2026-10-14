import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  typescript: {
    // Keep stale development route types out of production builds.
    tsconfigPath: phase === PHASE_PRODUCTION_BUILD ? "tsconfig.build.json" : "tsconfig.json",
  },
  turbopack: {
    root: process.cwd(),
  },
});

export default nextConfig;
