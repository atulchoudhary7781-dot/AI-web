import { NextRequest, NextResponse } from 'next/server'

// Force Node.js runtime (Edge is deprecated for anonymous deployments)
export const runtime = 'nodejs'

// ==================== SECURITY CONFIGURATION ====================

// Rate limiting configuration
const RATE_LIMITS = {
  // General API rate limits (requests per minute)
  '/api/chat': { requests: 20, windowMs: 60 * 1000 },      // 20 req/min for chat
  '/api/auth': { requests: 5, windowMs: 60 * 1000 },       // 5 req/min for auth
  '/api/tools': { requests: 15, windowMs: 60 * 1000 },     // 15 req/min for tools
  '/api/admin': { requests: 30, windowMs: 60 * 1000 },     // 30 req/min for admin
  'default': { requests: 100, windowMs: 60 * 1000 },       // 100 req/min default
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Blocked IPs (in production, use a database)
const blockedIPs = new Set<string>()

// Suspicious patterns for basic SQL injection / XSS detection
const SUSPICIOUS_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)/gi,
  /(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)/gi,
  /(javascript\s*:)/gi,
  /(on\w+\s*=)/gi,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
  /(--|#|\/\*)/g,  // SQL comments
  /(\bEXEC\b|\bEXECUTE\b)/gi,
]

// Bot user agents to block (less aggressive - allow curl for testing)
const BLOCKED_USER_AGENTS = [
  'badbot', 'malicious-scrapers'
]

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/health',
  '/api/setup/admin',
]

// ==================== HELPER FUNCTIONS ====================

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  return 'unknown'
}

/**
 * Check if IP is blocked
 */
function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip)
}

/**
 * Block an IP address
 */
function blockIP(ip: string): void {
  blockedIPs.add(ip)
  console.warn(`🚫 Security: IP ${ip} has been blocked`)
  // Auto-unblock after 1 hour (in production, persist this)
  setTimeout(() => {
    blockedIPs.delete(ip)
    console.log(`🔓 Security: IP ${ip} has been unblocked`)
  }, 60 * 60 * 1000)
}

/**
 * Check rate limit for an IP
 */
function checkRateLimit(ip: string, pathname: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `${ip}:${pathname}`
  
  // Find matching rate limit config
  let config = RATE_LIMITS.default
  for (const [path, limitConfig] of Object.entries(RATE_LIMITS)) {
    if (path !== 'default' && pathname.startsWith(path)) {
      config = limitConfig
      break
    }
  }
  
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    const newRecord = {
      count: 1,
      resetTime: now + config.windowMs
    }
    rateLimitStore.set(key, newRecord)
    
    // Cleanup old entries periodically
    if (rateLimitStore.size > 10000) {
      cleanupRateLimitStore()
    }
    
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetTime: newRecord.resetTime
    }
  }
  
  if (record.count >= config.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime
    }
  }
  
  record.count++
  return {
    allowed: true,
    remaining: config.requests - record.count,
    resetTime: record.resetTime
  }
}

/**
 * Cleanup old rate limit entries
 */
function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Detect suspicious content in request body/query
 */
function detectSuspiciousContent(request: NextRequest): boolean {
  const url = request.url
  const userAgent = request.headers.get('user-agent') || ''
  
  // Check URL for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      return true
    }
  }
  
  // Check for blocked user agents
  const lowerUA = userAgent.toLowerCase()
  for (const blocked of BLOCKED_USER_AGENTS) {
    if (lowerUA.includes(blocked)) {
      // Allow legitimate bots (Googlebot, Bingbot, etc.)
      if (!lowerUA.includes('googlebot') && 
          !lowerUA.includes('bingbot') && 
          !lowerUA.includes('slurp')) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://openrouter.ai",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://openrouter.ai https://api.openrouter.ai",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', ')
  )
  
  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  // Remove server info
  response.headers.set('Server', '')
  response.headers.set('X-Powered-By', '')
  
  return response
}

/**
 * Log security events
 */
function logSecurityEvent(event: string, details: Record<string, any>): void {
  const timestamp = new Date().toISOString()
  console.log(`🔒 Security Event [${timestamp}]:`, event, details)
}

// ==================== MAIN MIDDLEWARE ====================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)
  const method = request.method
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') && !pathname.endsWith('.ts') && !pathname.endsWith('.tsx')
  ) {
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }
  
  // TEMPORARILY DISABLED: IP blocking for deployment testing
  // Check if IP is blocked
  // if (isIPBlocked(ip)) {
  //   logSecurityEvent('BLOCKED_IP_ATTEMPT', { ip, pathname, method })
  //   return new NextResponse(
  //     JSON.stringify({ error: 'Access denied' }),
  //     { status: 403, headers: { 'content-type': 'application/json' } }
  //   )
  // }
  
  // TEMPORARILY DISABLED: Suspicious content detection
  // Detect suspicious content (skip in development)
  // const isDevelopment = process.env.NODE_ENV === 'development'
  // 
  // if (!isDevelopment && detectSuspiciousContent(request)) {
  //   logSecurityEvent('SUSPICIOUS_REQUEST_DETECTED', { ip, pathname, method })
  //   
  //   // Only block after multiple suspicious attempts (not random!)
  //   // In production, implement proper scoring system
  //   if (false) { // Disabled - too aggressive for now
  //     blockIP(ip)
  //     return new NextResponse(
  //       JSON.stringify({ error: 'Suspicious request detected' }),
  //       { status: 403, headers: { 'content-type': 'application/json' } }
  //     )
  //   }
  // }
  
  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = checkRateLimit(ip, pathname)
    
    // Add rate limit headers
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(
      Object.values(RATE_LIMITS).find(c => pathname.startsWith(
        Object.keys(RATE_LIMITS).find(k => k !== 'default' && pathname.startsWith(k)) || ''
      ))?.requests || RATE_LIMITS.default.requests
    ))
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimitResult.resetTime / 1000)))
    
    if (!rateLimitResult.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, pathname, method })
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }),
        { 
          status: 429,
          headers: {
            'content-type': 'application/json',
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': response.headers.get('X-RateLimit-Limit') || undefined,
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': response.headers.get('X-RateLimit-Reset') || undefined,
          } as HeadersInit
        }
      )
    }
    
    return addSecurityHeaders(response)
  }
  
  // For non-API routes, just add security headers
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next (static files)
     * - api (handled separately above, but included for consistency)
     * - favicon.ico, public files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
