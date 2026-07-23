import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const allowedDevOrigins =
  process.env.NEXT_ALLOWED_DEV_ORIGINS
    ?.split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

const nextConfig: NextConfig = {
  ...(isDevelopment &&
    allowedDevOrigins &&
    allowedDevOrigins.length > 0 && {
      allowedDevOrigins,
    }),
};

export default nextConfig;