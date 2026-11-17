import type { NextConfig } from "next";

// FORCE REBUILD - v1.0.3 - Sun Sep 6 14:06 UTC 2026
const nextConfig: NextConfig = {
  /* ==================== PERFORMANCE OPTIMIZATION ==================== */
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Turbopack configuration (Next.js 16 default - faster builds)
  turbopack: {},

  // Keep heavy file parsers out of the serverless bundle graph
  serverExternalPackages: ['unpdf', 'xlsx', 'jszip'],
  
  // ==================== BUNDLE OPTIMIZATION ====================
  
  // Experimental features
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-*',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
    // Enable server actions for better performance
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
  
  // ==================== IMAGE OPTIMIZATION ====================
  
  images: {
    // Modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Allow these image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
    ],
    // Image cache settings
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // ==================== SECURITY CONFIGURATION ====================
  
  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // Profile & Settings pages - no cache (always show fresh content)
      {
        source: '/profile',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/settings',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // API routes - no cache
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },

  // Redirect HTTP to HTTPS
  async redirects() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-ai.vercel.app'
    
    return [
      ...(process.env.NODE_ENV === 'production' ? [{
        source: '/:path*',
        has: [{ type: 'header' as const, key: 'x-forwarded-proto', value: 'http' }],
        permanent: true,
        destination: `${baseUrl}/:path*`,
      }] : []),
    ]
  },

  // ==================== WEBPACK CONFIGURATION ====================
  
  webpack: (config, { dev, isServer }) => {
    // Optimize bundles
    if (!dev && !isServer) {
      // Split vendor chunks for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 20,
            },
            lib: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'lib',
              chunks: 'all',
              priority: 10,
            },
            common: {
              minChunks: 2,
              name: 'common',
              chunks: 'all',
              priority: 5,
            },
          },
        },
      }
    }

    return config
  },
}

export default nextConfig
