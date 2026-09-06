import { NextResponse } from 'next/server'

/**
 * Validation utility functions for API routes
 * Centralizes common validation patterns
 */

/**
 * Validate required string field
 */
export function validateRequired(value: unknown, fieldName: string): { valid: boolean; error?: string; value?: string } {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` }
  }
  return { valid: true, value: value.trim() }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string; value?: string } {
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please provide a valid email address' }
  }
  
  return { valid: true, value: email.trim().toLowerCase() }
}

/**
 * Validate string length
 */
export function validateLength(value: string, fieldName: string, min: number, max: number): { valid: boolean; error?: string } {
  if (value.length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters long` }
  }
  if (value.length > max) {
    return { valid: false, error: `${fieldName} must be no more than ${max} characters long` }
  }
  return { valid: true }
}

/**
 * Common field length limits
 */
export const FIELD_LIMITS = {
  name: { min: 1, max: 100 },
  email: { min: 5, max: 254 },
  password: { min: 8, max: 128 },
  bio: { max: 500 },
  phone: { max: 20 },
  message: { min: 1, max: 10000 },
  searchQuery: { min: 1, max: 500 },
} as const

/**
 * Create standardized error response
 */
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Create standardized success response
 */
export function successResponse(data: unknown, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, ...data as object }, { status })
}

/**
 * Get user email from request headers with validation
 */
export function getEmailFromRequest(request: Request): { valid: boolean; error?: NextResponse; email?: string } {
  const email = request.headers.get('x-user-email')
  
  if (!email) {
    return { 
      valid: false, 
      error: errorResponse('Email required. Please login.', 401)
    }
  }
  
  return { valid: true, email }
}
