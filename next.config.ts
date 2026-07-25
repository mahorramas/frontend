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

  // ⬇️ AGREGA ESTA CONFIGURACIÓN DE IMÁGENES ⬇️
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "://muebleriasahorramas.com.mx",
        port: "",
        pathname: "/uploads/**",
      },
      // Esto te permite seguir probando de forma local en tu computadora
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
