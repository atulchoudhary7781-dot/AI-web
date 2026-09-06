import { NextRequest } from 'next/server'
import { db } from './db'

/**
 * Verify admin access from request headers
 * Returns user object if admin, null otherwise
 */
export async function verifyAdmin(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email) return null
  
  const user = await db.user.findUnique({ where: { email } })
  if (!user || user.role !== 'admin') return null
  return user
}

/**
 * Get user from request headers (for authenticated routes)
 * Returns user object if found, null otherwise
 */
export async function getUserFromRequest(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email) return null
  
  const user = await db.user.findUnique({ where: { email } })
  return user
}

/**
 * Find or create user by email (helper for subscription/payment flows)
 */
export async function findOrCreateUser(email: string, extras?: Partial<{ name: string; avatar: string }>) {
  let user = await db.user.findUnique({
    where: { email }
  })

  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: extras?.name || email.split('@')[0],
        ...(extras?.avatar && { avatar: extras.avatar })
      }
    })
  }

  return user
}
