/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend-go:8002/api/:path*',
      },
    ];
  },
}
module.exports = nextConfig
