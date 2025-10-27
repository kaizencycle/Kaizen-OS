/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'https://api.kaizen.os',
    NEXT_PUBLIC_PORTAL_ORIGIN: process.env.NEXT_PUBLIC_PORTAL_ORIGIN || 'https://kaizen.os',
    NEXT_PUBLIC_ENABLE_SOLARA: process.env.NEXT_PUBLIC_ENABLE_SOLARA || 'true',
    NEXT_PUBLIC_ENABLE_ZENITH: process.env.NEXT_PUBLIC_ENABLE_ZENITH || 'true',
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'kaizen.os',
  },
}

export default nextConfig