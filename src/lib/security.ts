/**
 * NEXUS AI Security Utilities
 * ===========================
 * Comprehensive input validation, sanitization, and security helpers
 */

// ==================== TYPES ====================

interface ValidationResult {
  valid: boolean
  value: any
  errors?: string[]
  sanitized?: boolean
}

interface SanitizeOptions {
  maxLength?: number
  allowHTML?: boolean
  allowSpecialChars?: boolean
  trim?: boolean
  lowercase?: boolean
  uppercase?: boolean
}

// ==================== CONSTANTS ====================

// Maximum lengths for different input types
const MAX_LENGTHS = {
  name: 100,
  email: 254, // RFC 5321 max length
  password: 128,
  message: 10000,
  searchQuery: 500,
  filename: 255,
  token: 512,
  id: 36, // UUID length
  url: 2048,
  phone: 20,
  bio: 500,
  title: 200,
  description: 2000,
}

// Allowed characters patterns
const PATTERNS = {
  // Basic text (letters, numbers, spaces, basic punctuation)
  text: /^[a-zA-Z0-9\s\-_.!?,'"@#$%&*()+=\[\]{}|\\:;<>,\/~`]+$/,
  
  // Name (letters, spaces, hyphens, apostrophes)
  name: /^[a-zA-Z\s\-'.]+$/,
  
  // Email (RFC 5322 compliant basic pattern)
  email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  
  // Password (at least 4 chars, any printable ASCII)
  password: /^[\x20-\x7E]{4,}$/,
  
  // Alphanumeric only
  alphanumeric: /^[a-zA-Z0-9]+$/,
  
  // UUID v4
  uuid: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
  
  // URL (basic pattern)
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  
  // Phone number (international format)
  phone: /^\+?[1-9]\d{6,14}$/,
  
  // Filename (with extension)
  filename: /^[a-zA-Z0-9_\-.\s]+$/,
}

// Dangerous patterns to detect
const DANGEROUS_PATTERNS = [
  // SQL Injection
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/gi,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
  /(--|#|\/\*)/g,
  /(\bWHERE\b.*\bOR\b.*\bTRUE\b)/gi,
  
  // XSS
  /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi,
  /(javascript\s*:)/gi,
  /(on\w+\s*=)/gi,
  /(expression\s*\()/gi,
  /(vbscript\s*:)/gi,
  /(<iframe[\s\S]*?>)/gi,
  /(<object[\s\S]*?>)/gi,
  /(<embed[\s\S]*?>)/gi,
  
  // Path traversal
  /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/)/gi,
  
  // Command injection
  /[;&|`$(){}]/g,
]

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  const sanitized = sanitizeString(email, { 
    maxLength: MAX_LENGTHS.email, 
    trim: true, 
    lowercase: true 
  })
  
  if (!sanitized) {
    return { valid: false, value: null, errors: ['Email is required'] }
  }
  
  if (!PATTERNS.email.test(sanitized)) {
    return { valid: false, value: sanitized, errors: ['Invalid email format'] }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 4) {
    return { valid: false, value: null, errors: ['Password must be at least 4 characters'] }
  }
  
  if (password.length > MAX_LENGTHS.password) {
    return { valid: false, value: null, errors: [`Password must be less than ${MAX_LENGTHS.password} characters`] }
  }
  
  if (!PATTERNS.password.test(password)) {
    return { valid: false, value: null, errors: ['Password contains invalid characters'] }
  }
  
  // Check for common weak passwords
  const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome']
  if (weakPasswords.includes(password.toLowerCase())) {
    return { valid: false, value: null, errors: ['Please choose a stronger password'] }
  }
  
  return { valid: true, value: password }
}

/**
 * Validate name field
 */
export function validateName(name: string): ValidationResult {
  const sanitized = sanitizeString(name, { 
    maxLength: MAX_LENGTHS.name, 
    trim: true 
  })
  
  if (!sanitized) {
    return { valid: false, value: null, errors: ['Name is required'] }
  }
  
  if (!PATTERNS.name.test(sanitized)) {
    return { valid: false, value: sanitized, errors: ['Name contains invalid characters'] }
  }
  
  if (sanitized.length < 2) {
    return { valid: false, value: sanitized, errors: ['Name must be at least 2 characters'] }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validate message/chat content
 */
export function validateMessage(message: string): ValidationResult {
  const sanitized = sanitizeString(message, { 
    maxLength: MAX_LENGTHS.message, 
    trim: true 
  })
  
  if (!sanitized) {
    return { valid: false, value: null, errors: ['Message is required'] }
  }
  
  // Check for dangerous content
  const dangerCheck = checkForDangerousContent(message)
  if (dangerCheck.dangerous) {
    return { 
      valid: false, 
      value: sanitized, 
      errors: ['Message contains potentially harmful content'],
      sanitized: true 
    }
  }
  
  return { valid: true, value: sanitized, sanitized: true }
}

/**
 * Validate UUID/token
 */
export function validateToken(token: string): ValidationResult {
  const sanitized = sanitizeString(token, { 
    maxLength: MAX_LENGTHS.token, 
    trim: true 
  })
  
  if (!sanitized) {
    return { valid: false, value: null, errors: ['Token is required'] }
  }
  
  if (!PATTERNS.uuid.test(sanitized)) {
    return { valid: false, value: sanitized, errors: ['Invalid token format'] }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validate URL
 */
export function validateURL(url: string): ValidationResult {
  const sanitized = sanitizeString(url, { 
    maxLength: MAX_LENGTHS.url, 
    trim: true 
  })
  
  if (!sanitized) {
    return { valid: false, value: null, errors: ['URL is required'] }
  }
  
  if (!PATTERNS.url.test(sanitized)) {
    return { valid: false, value: sanitized, errors: ['Invalid URL format'] }
  }
  
  // Check for allowed protocols
  try {
    const parsedUrl = new URL(sanitized)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { valid: false, value: sanitized, errors: ['Only HTTP/HTTPS URLs are allowed'] }
    }
  } catch {
    return { valid: false, value: sanitized, errors: ['Invalid URL'] }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validate filename
 */
export function validateFilename(filename: string): ValidationResult {
  const sanitized = sanitizeString(filename, { 
    maxLength: MAX_LENGTHS.filename, 
    trim: true 
  })
  
  if (!sanitized) {
    return { valid: false, value: null, errors: ['Filename is required'] }
  }
  
  if (!PATTERNS.filename.test(sanitized)) {
    return { valid: false, value: sanitized, errors: ['Filename contains invalid characters'] }
  }
  
  // Check for path traversal
  if (sanitized.includes('..') || sanitized.includes('/') || sanitized.includes('\\')) {
    return { valid: false, value: sanitized, errors: ['Invalid filename'] }
  }
  
  // Block dangerous extensions
  const blockedExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.asp', '.jsp']
  const ext = sanitized.toLowerCase().substring(sanitized.lastIndexOf('.'))
  if (blockedExtensions.includes(ext)) {
    return { valid: false, value: sanitized, errors: ['File type not allowed'] }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string): ValidationResult {
  const sanitized = sanitizeString(query, { 
    maxLength: MAX_LENGTHS.searchQuery, 
    trim: true 
  })
  
  if (!sanitized) {
    return { valid: false, value: null, errors: ['Search query is required'] }
  }
  
  // Search queries can have more flexibility but still no dangerous content
  const dangerCheck = checkForDangerousContent(query)
  if (dangerCheck) {
    return { 
      valid: false, 
      value: sanitized, 
      errors: ['Query contains invalid characters'],
      sanitized: true 
    }
  }
  
  return { valid: true, value: sanitized, sanitized: true }
}

// ==================== SANITIZATION FUNCTIONS ====================

/**
 * Sanitize string input
 */
export function sanitizeString(input: string | undefined | null, options: SanitizeOptions = {}): string | null {
  if (input === undefined || input === null) return null
  
  let result = String(input)
  
  // Trim whitespace
  if (options.trim !== false) {
    result = result.trim()
  }
  
  // Apply max length
  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength)
  }
  
  // Remove HTML tags unless explicitly allowed
  if (!options.allowHTML) {
    result = removeHTML(result)
  }
  
  // Remove or escape special characters
  if (!options.allowSpecialChars) {
    result = escapeSpecialChars(result)
  }
  
  // Case conversion
  if (options.lowercase) {
    result = result.toLowerCase()
  }
  if (options.uppercase) {
    result = result.toUpperCase()
  }
  
  // Nullify empty strings
  if (result.length === 0) return null
  
  return result
}

/**
 * Remove HTML tags from string
 */
export function removeHTML(input: string): string {
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

/**
 * Escape special characters for safe output
 */
export function escapeSpecialChars(input: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '\\/',
  }
  
  return input.replace(/[&<>"'/]/g, char => escapeMap[char])
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T, 
  options: SanitizeOptions = {}
): Partial<T> {
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, options)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, any>, options)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item, options) : item
      )
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized as Partial<T>
}

// ==================== SECURITY CHECK FUNCTIONS ====================

/**
 * Check for dangerous content (SQL injection, XSS, etc.)
 */
export function checkForDangerousContent(input: string): boolean {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      return true
    }
  }
  return false
}

/**
 * Check if request appears to be from a bot
 */
export function isBotRequest(userAgent: string | null): boolean {
  if (!userAgent) return true
  
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /go-http/i,
    /java\//i,
    /apache-httpclient/i,
    /scan/i,
    /harvest/i,
  ]
  
  // Exclude legitimate bots
  const legitimateBots = [/googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i]
  
  const isBot = botPatterns.some(pattern => pattern.test(userAgent))
  const isLegitimateBot = legitimateBots.some(pattern => pattern.test(userAgent))
  
  return isBot && !isLegitimateBot
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  
  return Array.from(values).map(v => chars[v % chars.length]).join('')
}

/**
 * Hash password (placeholder - use bcrypt in production)
 */
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or argon2
  // import { hash } from 'bcrypt'
  // return hash(password, 12)
  
  // Simple hash for now (NOT SECURE FOR PRODUCTION!)
  const encoder = new TextEncoder()
  const data = encoder.encode(password + process.env.PASSWORD_SALT || 'nexus-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hash
}

// ==================== RATE LIMITING HELPERS ====================

/**
 * Create rate limiter configuration
 */
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (request: Request) => string // Custom key generator
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

/**
 * Create a simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */
export class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>()
  private config: RateLimitConfig
  
  constructor(config: RateLimitConfig) {
    this.config = config
  }
  
  check(key: string): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
    const now = Date.now()
    const record = this.store.get(key)
    
    if (!record || now > record.resetTime) {
      // New window
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      })
      
      this.cleanup()
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      }
    }
    
    if (record.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      }
    }
    
    record.count++
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime
    }
  }
  
  private cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  auth: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 5 }),       // 5/min for auth
  chat: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 20 }),      // 20/min for chat
  tools: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 15 }),     // 15/min for tools
  upload: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 10 }),     // 10/min for uploads
  general: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 100 }),   // 100/min default
}

// ==================== CSRF PROTECTION ====================

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return generateSecureToken(32)
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false
  
  // Use timing-safe comparison
  if (token.length !== sessionToken.length) return false
  
  const tokenBytes = new TextEncoder().encode(token)
  const sessionBytes = new TextEncoder().encode(sessionToken)
  
  let result = 0
  for (let i = 0; i < tokenBytes.length; i++) {
    result |= tokenBytes[i] ^ sessionBytes[i]
  }
  
  return result === 0
}

// ==================== EXPORT DEFAULT ====================

export default {
  validateEmail,
  validatePassword,
  validateName,
  validateMessage,
  validateToken,
  validateURL,
  validateFilename,
  validateSearchQuery,
  sanitizeString,
  sanitizeObject,
  removeHTML,
  escapeSpecialChars,
  checkForDangerousContent,
  isBotRequest,
  generateSecureToken,
  hashPassword,
  verifyPassword,
  generateCSRFToken,
  validateCSRFToken,
  rateLimiters,
}
