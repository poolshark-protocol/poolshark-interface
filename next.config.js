/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  middleware: ['src/middleware.ts'],
}

module.exports = nextConfig
