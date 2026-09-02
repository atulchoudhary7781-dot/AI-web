/**
 * Supabase Authentication Helpers
 * 
 * Integration layer between Supabase Auth and NEXUS AI
 */

import { createSupabaseAdminClient } from './supabase'

export interface SupabaseUser {
  id: string
  email: string
  name?: string | null
  avatar?: string | null
  email_verified: boolean
  created_at: string
}

export interface AuthResult {
  success: boolean
  user?: SupabaseUser
  error?: string
  session?: {
    access_token: string
    refresh_token: string
    expires_at: number
    user: SupabaseUser
  }
}

/**
 * Sign up a new user with Supabase Auth + create profile in our DB
 */
export async function signUpWithEmail(
  email: string, 
  password: string, 
  name?: string
): Promise<AuthResult> {
  try {
    const supabase = createSupabaseAdminClient()
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    // User created successfully
    return {
      success: true,
      user: data.user as unknown as SupabaseUser,
      session: data.session ? {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: data.session.user as unknown as SupabaseUser
      } : undefined
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Sign in with email/password using Supabase Auth
 */
export async function signInWithEmail(
  email: string, 
  password: string
): Promise<AuthResult> {
  try {
    const supabase = createSupabaseAdminClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return {
      success: true,
      user: data.user as unknown as SupabaseUser,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: data.user as unknown as SupabaseUser
      }
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Verify JWT token from Supabase
 */
export async function verifyToken(token: string): Promise<AuthResult> {
  try {
    const supabase = createSupabaseAdminClient()
    
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return { success: false, error: 'Invalid or expired token' }
    }
    
    return {
      success: true,
      user: user as unknown as SupabaseUser
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return { success: false, error: 'Token verification failed' }
  }
}

/**
 * Send password reset email via Supabase
 */
export async function sendPasswordResetEmail(email: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = createSupabaseAdminClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return { success: false, error: 'Failed to send reset email' }
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  token: string, 
  newPassword: string
): Promise<AuthResult> {
  try {
    const supabase = createSupabaseAdminClient()
    
    // First verify the token
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(token)
    
    if (verifyError || !user) {
      return { success: false, error: 'Invalid or expired token' }
    }
    
    // Update password using admin client
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id, 
      { password: newPassword }
    )
    
    if (updateError) {
      return { success: false, error: updateError.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Password update error:', error)
    return { success: false, error: 'Failed to update password' }
  }
}
