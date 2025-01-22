/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to support API routes and middleware
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;