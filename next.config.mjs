/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      // Ajoutez votre domaine de production si nécessaire
      {
        protocol: 'https',
        hostname: 'votre-domaine-strapi.com',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig
