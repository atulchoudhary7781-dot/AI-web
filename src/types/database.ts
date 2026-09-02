/**
 * Supabase Database Types
 * 
 * Type definitions matching our Prisma schema for Supabase
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          email: string
          name: string | null
          password: string | null
          avatar: string | null
          bio: string | null
          phone: string | null
          location: string | null
          website: string | null
          role: 'user' | 'admin'
          emailVerified: boolean
          emailVerifiedAt: Date | null
          subscriptionPlan: 'free' | 'normal' | 'pro'
          subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'past_due'
          stripeCustomerId: string | null
          stripeSubscriptionId: string | null
          subscriptionStartDate: Date | null
          subscriptionEndDate: Date | null
          chatsToday: number
          lastChatResetDate: Date | null
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          password?: string | null
          avatar?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          website?: string | null
          role?: 'user' | 'admin'
          emailVerified?: boolean
          emailVerifiedAt?: Date | null
          subscriptionPlan?: 'free' | 'normal' | 'pro'
          subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'past_due'
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          subscriptionStartDate?: Date | null
          subscriptionEndDate?: Date | null
          chatsToday?: number
          lastChatResetDate?: Date | null
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          password?: string | null
          avatar?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          website?: string | null
          role?: 'user' | 'admin'
          emailVerified?: boolean
          emailVerifiedAt?: Date | null
          subscriptionPlan?: 'free' | 'normal' | 'pro'
          subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'past_due'
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          subscriptionStartDate?: Date | null
          subscriptionEndDate?: Date | null
          chatsToday?: number
          lastChatResetDate?: Date | null
          createdAt?: Date
          updatedAt?: Date
        }
      }
      Chat: {
        Row: {
          id: string
          userId: string
          title: string
          messages: Json
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          userId: string
          title: string
          messages?: Json
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          userId?: string
          title?: string
          messages?: Json
          createdAt?: Date
          updatedAt?: Date
        }
      }
      Subscription: {
        Row: {
          id: string
          userId: string
          plan: string
          status: string
          stripeSubscriptionId: string | null
          stripePriceId: string | null
          currentPeriodStart: Date
          currentPeriodEnd: Date
          cancelAtPeriodEnd: boolean
          amount: number
          currency: string
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          userId: string
          plan: string
          status: string
          stripeSubscriptionId?: string | null
          stripePriceId?: string | null
          currentPeriodStart: Date
          currentPeriodEnd: Date
          cancelAtPeriodEnd?: boolean
          amount: number
          currency?: string
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          userId?: string
          plan?: string
          status?: string
          stripeSubscriptionId?: string | null
          stripePriceId?: string | null
          currentPeriodStart?: Date
          currentPeriodEnd?: Date
          cancelAtPeriodEnd?: boolean
          amount?: number
          currency?: string
          createdAt?: Date
          updatedAt?: Date
        }
      }
      Payment: {
        Row: {
          id: string
          userId: string
          stripePaymentIntentId: string | null
          stripeCheckoutSessionId: string | null
          amount: number
          currency: string
          status: string
          paymentMethod: string | null
          description: string | null
          metadata: string | null
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          userId: string
          stripePaymentIntentId?: string | null
          stripeCheckoutSessionId?: string | null
          amount: number
          currency?: string
          status: string
          paymentMethod?: string | null
          description?: string | null
          metadata?: string | null
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          userId?: string
          stripePaymentIntentId?: string | null
          stripeCheckoutSessionId?: string | null
          amount?: number
          currency?: string
          status?: string
          paymentMethod?: string | null
          description?: string | null
          metadata?: string | null
          createdAt?: Date
          updatedAt?: Date
        }
      }
      EmailVerification: {
        Row: {
          id: string
          userId: string
          token: string
          email: string
          expiresAt: Date
          verifiedAt: Date | null
          createdAt: Date
        }
        Insert: {
          id?: string
          userId: string
          token: string
          email: string
          expiresAt: Date
          verifiedAt?: Date | null
          createdAt?: Date
        }
        Update: {
          id?: string
          userId?: string
          token?: string
          email?: string
          expiresAt?: Date
          verifiedAt?: Date | null
          createdAt?: Date
        }
      }
      PasswordReset: {
        Row: {
          id: string
          userId: string
          token: string
          expiresAt: Date
          usedAt: Date | null
          createdAt: Date
        }
        Insert: {
          id?: string
          userId: string
          token: string
          expiresAt: Date
          usedAt?: Date | null
          createdAt?: Date
        }
        Update: {
          id?: string
          userId?: string
          token?: string
          expiresAt?: Date
          usedAt?: Date | null
          createdAt?: Date
        }
      }
      AdminLog: {
        Row: {
          id: string
          adminId: string
          action: string
          targetId: string | null
          details: string | null
          ipAddress: string | null
          createdAt: Date
        }
        Insert: {
          id?: string
          adminId: string
          action: string
          targetId?: string | null
          details?: string | null
          ipAddress?: string | null
          createdAt?: Date
        }
        Update: {
          id?: string
          adminId?: string
          action?: string
          targetId?: string | null
          details?: string | null
          ipAddress?: string | null
          createdAt?: Date
        }
      }
      Post: {
        Row: {
          id: string
          title: string
          content: string | null
          published: boolean
          authorId: string
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          published?: boolean
          authorId: string
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          published?: boolean
          authorId?: string
          createdAt?: date
          updatedAt?: Date
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
