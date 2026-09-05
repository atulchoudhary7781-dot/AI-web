'use client'

import { useState, useEffect } from 'react'
import { Clock, Crown, AlertTriangle, Zap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatLimitProps {
  onUpgradeClick?: () => void
  compact?: boolean
}

export default function ChatLimitDisplay({ onUpgradeClick, compact = false }: ChatLimitProps) {
  const [chatCountToday, setChatCountToday] = useState(0)
  const [maxChats, setMaxChats] = useState(10)
  const [resetTime, setResetTime] = useState('')
  const [currentPlan, setCurrentPlan] = useState<'free' | 'normal' | 'pro'>('free')
  const [isNearLimit, setIsNearLimit] = useState(false)

  // Calculate reset time
  const calculateResetTime = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      // Load subscription
      const savedSub = localStorage.getItem('nexus_subscription')
      if (savedSub) {
        try {
          const sub = JSON.parse(savedSub)
          setCurrentPlan(sub.plan || 'free')
          if (sub.plan === 'pro' || sub.plan === 'normal') {
            setMaxChats(Infinity)
            return
          }
        } catch (e) {
          console.error('Error parsing subscription:', e)
        }
      }

      // Load chat count for today
      const savedChats = localStorage.getItem('nexus_chat_count_today')
      const savedDate = localStorage.getItem('nexus_chat_date')
      
      const today = new Date().toDateString()
      
      if (savedDate === today && savedChats) {
        const count = parseInt(savedChats, 10)
        setChatCountToday(count)
        setIsNearLimit(count >= 7) // Warning when 70% used
      } else {
        setChatCountToday(0)
        localStorage.setItem('nexus_chat_count_today', '0')
        localStorage.setItem('nexus_chat_date', today)
      }

      setMaxChats(10) // Free plan default
    }

    loadData()

    // Update every minute
    const interval = setInterval(() => {
      setResetTime(calculateResetTime())
      loadData() // Refresh chat count
    }, 60000)

    setResetTime(calculateResetTime())

    return () => clearInterval(interval)
  }, [])

  // Don't show anything for paid users
  if (currentPlan === 'normal' || currentPlan === 'pro') {
    return null
  }

  // Compact version (for inline display)
  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
        isNearLimit 
          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
          : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
      }`}>
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span>{chatCountToday}/{maxChats}</span>
        <span className="text-gray-500">|</span>
        <span className="text-cyan-400">{resetTime}</span>
      </div>
    )
  }

  // Full version
  const percentage = (chatCountToday / maxChats) * 100

  return (
    <div className={`rounded-xl p-4 transition-all duration-300 ${
      percentage >= 90 
        ? 'bg-red-500/20 border border-red-500/30' 
        : isNearLimit 
          ? 'bg-yellow-500/15 border border-yellow-500/25'
          : 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {percentage >= 90 ? (
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
          ) : isNearLimit ? (
            <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
          ) : (
            <Zap className="w-5 h-5 text-cyan-400" />
          )}
          
          <div>
            <p className={`text-sm font-medium ${
              percentage >= 90 
                ? 'text-red-300' 
                : isNearLimit 
                  ? 'text-yellow-300'
                  : 'text-white'
            }`}>
              {percentage >= 90 
                ? '⚠️ Daily Limit Almost Reached!' 
                : isNearLimit 
                  ? '📊 Free Plan Usage'
                  : '💬 Chats Remaining Today'
              }
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {chatCountToday} of {maxChats} chats used • Resets in{' '}
              <span className="text-cyan-400 font-mono">{resetTime}</span>
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="locked"
          disabled={true}
          className="text-xs"
        >
          <Lock className="w-3 h-3 mr-1" />
          Coming Soon
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            percentage >= 90 
              ? 'bg-red-500' 
              : isNearLimit 
                ? 'bg-yellow-500' 
                : 'bg-gradient-to-r from-cyan-500 to-violet-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {percentage >= 90 && (
        <p className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Subscription feature coming soon! Free plan: 10 chats/day
        </p>
      )}
    </div>
  )
}

// Utility functions (exported for use in other components)
export const incrementChatCount = () => {
  const today = new Date().toDateString()
  const savedDate = localStorage.getItem('nexus_chat_date')
  
  if (savedDate !== today) {
    localStorage.setItem('nexus_chat_count_today', '1')
    localStorage.setItem('nexus_chat_date', today)
    return true
  }

  const currentCount = parseInt(localStorage.getItem('nexus_chat_count_today') || '0', 10)
  
  if (currentCount >= 10) {
    return false // Limit reached
  }

  localStorage.setItem('nexus_chat_count_today', String(currentCount + 1))
  return true
}

export const canChat = (): boolean => {
  const savedSub = localStorage.getItem('nexus_subscription')
  if (savedSub) {
    try {
      const sub = JSON.parse(savedSub)
      if (sub.plan === 'pro' || sub.plan === 'normal') {
        return true
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  const today = new Date().toDateString()
  const savedDate = localStorage.getItem('nexus_chat_date')
  const savedChats = localStorage.getItem('nexus_chat_count_today')

  if (savedDate !== today) return true

  const count = parseInt(savedChats || '0', 10)
  return count < 10
}
