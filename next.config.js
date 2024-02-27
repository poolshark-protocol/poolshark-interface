/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'poolshark-token-lists.s3.amazonaws.com',
      port: '',
      pathname: '**',
    },
  ],
}

module.exports = nextConfig
