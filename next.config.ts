import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ==================== PERFORMANCE OPTIMIZATION ==================== */
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Turbopack configuration (Next.js 16 default - faster builds)
  turbopack: {},
  
  // Enable SWC minification for smaller bundles
  swcMinify: true,
  
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
      bodySizeLimit: '2mb',
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
  
  // Force Node.js runtime for middleware (fixes Edge runtime issues)
  middleware: {
    runtime: 'nodejs',
  },
  
  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer Policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          // Cache control for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
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

  // Redirect www to non-www and HTTP to HTTPS
  async redirects() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-ai.vercel.app'
    
    return [
      ...(process.env.NODE_ENV === 'production' ? [{
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
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

    // Support SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

export default nextConfig
