// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // We are using only the App Router for API routes.
    experimental: {
        appDir: true
    },
    // Enable statically typed routes (even if we don't render pages now,
    // this keeps the project future-proof if you add any app/ UI later).
    typedRoutes: true,
    // Disallow non-prefixed env exposure; we will keep everything server-only
    // and intentionally avoid NEXT_PUBLIC_* for this backend repo.
    // If you later introduce public envs, use the NEXT_PUBLIC_ prefix explicitly.
    env: {},
    // Ensure we can deploy cleanly on Vercel.
    eslint: {
        ignoreDuringBuilds: true
    },
    typescript: {
        ignoreBuildErrors: false
    }
};

export default nextConfig;