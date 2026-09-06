import Stripe from 'stripe'

// Singleton Stripe instance with lazy initialization
let _stripe: Stripe | null = null

/**
 * Get Stripe instance (lazy initialization)
 * Returns null if STRIPE_SECRET_KEY is not configured
 */
export function getStripe(): Stripe | null {
  if (_stripe) return _stripe
  
  if (!process.env.STRIPE_SECRET_KEY) return null
  
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-08-26.dahlia',
  })
  
  return _stripe
}

/**
 * Price IDs from Stripe Dashboard - Replace with your actual price IDs
 */
export const STRIPE_PRICES = {
  normal: process.env.STRIPE_PRICE_NORMAL || 'price_normal_id', // $10/month
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_id',         // $20/month
} as const

/**
 * Plan configuration for consistency across app
 */
export const PLAN_CONFIG = {
  free: { price: 0, features: ['10_chats_per_day', 'basic_ai_responses', 'community_support', '7_day_history'] },
  normal: { price: 10, features: ['unlimited_chats', 'advanced_ai_models', 'file_attachments', '30_day_history', 'data_export', 'priority_support'] },
  pro: { price: 20, features: ['unlimited_chats', 'gpt4_claude_access', 'image_generation', 'voice_conversations', 'api_access', 'custom_ai_training', 'priority_queue', 'dedicated_support', 'infinite_history'] },
} as const

export type PlanType = keyof typeof PLAN_CONFIG
