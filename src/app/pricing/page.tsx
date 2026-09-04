'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Check, X, Zap, Crown, Building2, 
  ArrowRight, Star, Sparkles, Lock, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
// Safe i18n hook that handles SSR
function useSafeI18n() {
  try {
    const { useI18n } = require('@/lib/i18n')
    return useI18n()
  } catch {
    return {
      locale: 'en',
      setLocale: () => {},
      t: (key: string) => key,
      availableLocales: [],
    }
  }
}

// Pricing plans data
const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '/month',
    description: 'Perfect for getting started',
    icon: Sparkles,
    color: 'gray',
    features: [
      { text: '50 messages per day', included: true },
      { text: 'Basic AI responses', included: true },
      { text: 'Chat history (7 days)', included: true },
      { text: 'Community support', included: true },
      { text: 'Image analysis', included: false },
      { text: 'Voice input', included: false },
      { text: 'Priority support', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    period: '/month',
    description: 'For power users and professionals',
    icon: Crown,
    color: 'orange',
    locked: true,
    lockMessage: 'Coming Soon with Subscription',
    features: [
      { text: 'Unlimited messages', included: true },
      { text: 'Advanced AI (GPT-4)', included: true },
      { text: 'Unlimited chat history', included: true },
      { text: 'Email support', included: true },
      { text: 'Image analysis', included: true },
      { text: 'Voice input', included: true },
      { text: 'Priority support', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Coming Soon 🔒',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29,
    period: '/month',
    description: 'For teams and businesses',
    icon: Building2,
    color: 'amber',
    locked: true,
    lockMessage: 'Coming Soon with Subscription',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Custom AI models', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Full API access', included: true },
    ],
    cta: 'Coming Soon 🔒',
    popular: false,
  },
]

// FAQ data
const faqs = [
  {
    question: 'Can I switch plans later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.',
  },
  {
    question: 'Is there a free trial for Pro?',
    answer: 'Yes! Pro comes with a 7-day free trial. No credit card required to start.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. Cancel anytime with no questions asked. Your access continues until the end of billing period.',
  },
]

export default function PricingPage() {
  const { t } = useSafeI18n()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate yearly discount
  const getPrice = (basePrice: number) => {
    return billingPeriod === 'yearly' ? Math.floor(basePrice * 0.8) : basePrice
  }

  // Handle plan selection
  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId)
    
    if (planId === 'free') {
      // Redirect to signup/login
      window.location.href = '/signup?plan=free'
      return
    }

    if (planId === 'enterprise') {
      // Open contact form or email
      window.location.href = 'mailto:sales@nexusai.app?subject=Enterprise Plan Inquiry'
      return
    }

    setIsLoading(true)

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingPeriod,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-deep-black">
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 mb-6">
            <Star className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-medium text-neon-cyan">Simple, transparent pricing</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6">
            <span className="gradient-text-nexus">{t('pricing.title')}</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your needs. All plans include core NEXUS AI features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={cn(
              "text-sm font-medium transition-colors",
              billingPeriod === 'monthly' ? "text-foreground" : "text-muted-foreground"
            )}>
              Monthly
            </span>
            
            <button
              onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors duration-300",
                billingPeriod === 'yearly' ? "bg-neon-cyan" : "bg-white/20"
              )}
              aria-label="Toggle billing period"
            >
              <span
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-300",
                  billingPeriod === 'yearly' ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
            
            <span className={cn(
              "text-sm font-medium transition-colors flex items-center gap-2",
              billingPeriod === 'yearly' ? "text-foreground" : "text-muted-foreground"
            )}>
              Yearly
              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant={plan.locked ? 'locked' : (plan.popular ? 'neon' : 'glass')}
              className={cn(
                "relative p-8 transition-all duration-300",
                plan.locked ? "opacity-75 cursor-not-allowed" : "hover:scale-[1.02]",
                plan.popular && !plan.locked && "ring-2 ring-neon-cyan shadow-lg shadow-neon-cyan/20",
                plan.locked && "border-yellow-500/30 bg-gray-900/50"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && !plan.locked && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full text-xs font-bold text-black">
                    MOST POPULAR ⭐
                  </div>
                </div>
              )}

              {/* Locked Badge */}
              {plan.locked && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full text-xs font-bold text-black flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    COMING SOON
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={cn(
                  "inline-flex p-3 rounded-xl mb-4",
                  plan.color === 'orange' && "bg-neon-cyan/10",
                  plan.color === 'amber' && "bg-neon-purple/10",
                  plan.color === 'gray' && "bg-white/10"
                )}>
                  <plan.icon className={cn(
                    "w-8 h-8",
                    plan.color === 'orange' && "text-neon-cyan",
                    plan.color === 'amber' && "text-neon-purple",
                    plan.color === 'gray' && "text-muted-foreground"
                  )} />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">${getPrice(plan.price)}</span>
                  <span className="text-lg text-muted-foreground">{plan.period}</span>
                </div>
                
                {billingPeriod === 'yearly' && plan.price > 0 && (
                  <p className="text-sm text-green-400 mt-2">
                    Save ${plan.price * 2.4}/year
                  </p>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                    )}
                    <span className={cn(
                      "text-sm",
                      feature.included ? "text-foreground/80" : "text-muted-foreground/50"
                    )}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.locked ? (
                <div className="w-full">
                  <Button
                    variant="locked"
                    className="w-full cursor-not-allowed"
                    disabled={true}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Coming Soon with Subscription
                  </Button>
                  <p className="text-xs text-center text-yellow-400 mt-2 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    Subscription feature coming soon!
                  </p>
                </div>
              ) : (
                <Button
                  variant={plan.popular ? 'neon' : plan.id === 'enterprise' ? 'neonOutline' : 'outline'}
                  className="w-full"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <>
                      <LoadingSpinner />
                      Processing...
                    </>
                  ) : (
                    <>
                      {t(plan.cta.toLowerCase() as any)}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold font-display text-center mb-12 gradient-text-nexus">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center glass-strong rounded-3xl p-12">
          <Zap className="w-12 h-12 text-neon-cyan mx-auto mb-6" />
          <h2 className="text-3xl font-bold font-display text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of users already using NEXUS AI to supercharge their productivity.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="neon" size="lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Link href="#chat">
              <Button variant="ghost" size="lg">
                Try Demo First
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden transition-all duration-200 hover:border-white/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-medium text-foreground pr-4">{question}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.924 3 8.11l2.111-1.819z" />
    </svg>
  )
}
