/** @type {import('next').NextConfig} */
const isGithubPages = 'true';
const nextConfig = {
  output: 'export',
  basePath: isGithubPages ? '/pass-generator>' : '',
  assetPrefix: isGithubPages ? '/pass-generator/' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig