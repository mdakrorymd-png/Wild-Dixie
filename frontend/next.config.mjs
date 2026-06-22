/** @type {import('next').NextConfig} */
const BACKEND = process.env.BACKEND_ORIGIN ?? "http://localhost:8000";

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "a0.muscache.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Same-origin proxy so the phone (or a tunnel) never needs to reach the
  // backend directly — the Next server forwards /api and /ical to it.
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${BACKEND}/api/v1/:path*` },
      { source: "/ical/:path*", destination: `${BACKEND}/ical/:path*` },
    ];
  },
};

export default nextConfig;
