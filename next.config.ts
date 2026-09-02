import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Media in this phase is pasted URLs rather than uploads, so every host
    // that content editors may link to has to be allowed explicitly.
    // `images.domains` is deprecated in Next 16 — use remotePatterns.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
    ],
  },
};

export default nextConfig;
