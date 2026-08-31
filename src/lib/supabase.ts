/**
 * Supabase Client Configuration
 * 
 * PostgreSQL database via Supabase for NEXUS AI
 * - Server-side: Service role key (admin access)
 * - Client-side: Anon key (restricted by RLS)
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Server-side Supabase client (for API routes, server components)
export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for admin operations
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Client-side Supabase browser client (for client components)
export function createSupabaseBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.DATABASE_URL
  )
}

// Export singleton for server-side usage
export const supabaseAdmin = typeof window === 'undefined' ? createSupabaseAdminClient() : null

export default createSupabaseBrowserClient
