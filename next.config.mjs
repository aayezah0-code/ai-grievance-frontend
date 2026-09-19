/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },
  // Suppress styled-jsx warning in production
  compiler: {
    styledJsx: true,
  },
};

export default nextConfig;

