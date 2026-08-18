/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/types', '@repo/validators', '@repo/utils', '@repo/api'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
