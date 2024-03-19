/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'poolshark-token-lists.s3.amazonaws.com',
        port: '',
      },
    ],
  }
}

module.exports = nextConfig
