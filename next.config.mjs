/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'www.hollywoodreporter.com',
      'media.wired.com',
      'i0.wp.com',
      'shared.fastly.steamstatic.com'
    ]
  },
}

export default nextConfig
