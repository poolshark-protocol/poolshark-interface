/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["poolshark-token-lists.s3.amazonaws.com"],
  },
};

module.exports = nextConfig;
