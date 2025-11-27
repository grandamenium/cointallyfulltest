/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization configuration
  images: {
    domains: ['localhost'],
    // Allow external image domains if needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Webpack configuration for Web3 dependencies
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },

  // Optimize production builds
  compress: true,

  // Enable React strict mode for better error checking
  reactStrictMode: true,

  // Configure trailing slashes
  trailingSlash: false,
}

module.exports = nextConfig
