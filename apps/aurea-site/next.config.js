/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kaizen/codex-agentic'],
  env: {
    AGENT_ID: 'AUREA',
    AGENT_DOMAIN: 'aurea.gic',
  },
}

module.exports = nextConfig
