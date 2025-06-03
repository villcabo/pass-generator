/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';
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