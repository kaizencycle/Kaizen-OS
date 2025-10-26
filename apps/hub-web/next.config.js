/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false,
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/oaa/:path*',
        destination: '/api/oaa/:path*',
      },
      {
        source: '/api/gic/:path*',
        destination: '/api/gic/:path*',
      },
      {
        source: '/api/proof/:path*',
        destination: '/api/proof/:path*',
      },
    ];
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack configuration if needed
    return config;
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;


