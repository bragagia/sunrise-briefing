/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.txt$/,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;
