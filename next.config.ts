/* import type { NextConfig } from "next";

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

export default nextConfig; */
import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

// Permitir acceso desde diferentes orígenes en desarrollo
const allowedDevOrigins = isDevelopment
  ? [
      "localhost",
      "127.0.0.1",
      "192.168.0.143", // Tu IP local para desarrollo remoto
      ...(process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",").map(o => o.trim()) || []),
    ]
  : [];

const nextConfig: NextConfig = {
  ...(isDevelopment && allowedDevOrigins.length > 0 && {
    allowedDevOrigins,
  }),

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "muebleriasahorramas.com.mx",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "muebleriasahorramas.com.mx",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
