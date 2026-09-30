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
      {
        protocol: 'https',
        hostname: 'ai-grievance-backend-fro0.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ai-grievance-backend-fro0.onrender.com',
  },
  // Suppress styled-jsx warning in production
  compiler: {
    styledJsx: true,
  },
};

export default nextConfig;

