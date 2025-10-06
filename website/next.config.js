/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Configure for bssc.live domain
  assetPrefix: '',
  basePath: ''
}

module.exports = nextConfig
