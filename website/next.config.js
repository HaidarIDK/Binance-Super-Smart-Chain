/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    appDir: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Binance-Super-Smart-Chain' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/Binance-Super-Smart-Chain' : ''
}

module.exports = nextConfig
