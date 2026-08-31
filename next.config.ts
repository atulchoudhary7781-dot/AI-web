import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  
  // Force Node.js runtime for middleware (fixes Edge runtime issues)
  middleware: {
    runtime: 'nodejs',
  },
  
  // ==================== SECURITY CONFIGURATION ====================
  
  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy - restrict browser features
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'gyroscope=()',
              'accelerometer=()',
            ].join(', '),
          },
          // Content Security Policy (basic, enhanced in middleware)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://openrouter.ai",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://openrouter.ai https://api.openrouter.ai",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Hide server information
          {
            key: 'Server',
            value: '',
          },
          {
            key: 'X-Powered-By',
            value: '',
          },
        ],
      },
      // Specific headers for API routes
      {
        source: '/api/(.*)',
        headers: [
          // CORS headers for API
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours preflight cache
          },
          // Don't cache API responses by default
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
      // Strict security for auth routes
      {
        source: '/api/auth/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  // Redirect www to non-www and HTTP to HTTPS
  async redirects() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-ai.vercel.app'
    
    return [
      // Force HTTPS in production
      ...(process.env.NODE_ENV === 'production' ? [{
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        permanent: true,
        destination: `${baseUrl}/:path*`,
      }] : []),
    ]
  },

  // Image optimization with security
  images: {
    // Only allow these image domains
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
    // Limit image size
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
  },

  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
  
  // Experimental features for security
  experimental: {
    // Enable React strict mode for development warnings
    // reactStrictMode: true,
  },
}

export default nextConfig
