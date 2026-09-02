'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  MessageSquare, Users, TrendingUp, DollarSign,
  ArrowUpRight, Clock, Activity, Zap,
  BarChart3, Calendar
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

// Mock data for dashboard (will be replaced with real API data)
const mockStats = {
  totalChats: 1247,
  activeToday: 89,
  totalUsers: 342,
  revenue: 4829,
}

const recentActivity = [
  { id: 1, type: 'chat', user: 'John D.', action: 'Started new conversation', time: '2 min ago' },
  { id: 2, type: 'signup', user: 'Sarah M.', action: 'Created account', time: '5 min ago' },
  { id: 3, type: 'payment', user: 'Mike R.', action: 'Upgraded to Pro', time: '12 min ago' },
  { id: 4, type: 'chat', user: 'Emma L.', action: 'Asked about coding', time: '15 min ago' },
  { id: 5, type: 'login', user: 'Alex K.', action: 'Logged in', time: '20 min ago' },
]

// Weekly chat data for chart
const weeklyData = [
  { day: 'Mon', chats: 45 },
  { day: 'Tue', chats: 62 },
  { day: 'Wed', chats: 58 },
  { day: 'Thu', chats: 78 },
  { day: 'Fri', chats: 95 },
  { day: 'Sat', chats: 72 },
  { day: 'Sun', chats: 54 },
]

export default function DashboardPage() {
  const { t } = useSafeI18n()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')

  // Calculate max value for chart scaling
  const maxChats = Math.max(...weeklyData.map(d => d.chats))

  return (
    <div className="min-h-screen bg-deep-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display gradient-text-nexus">
              {t('dashboard.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening with NEXUS AI.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex bg-white/5 rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    selectedPeriod === period
                      ? "bg-neon-orange/20 text-neon-orange"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
            
            <Link href="/pricing">
              <Button variant="neon" size="sm">
                {t('pricing.upgrade')}
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Chats */}
          <Card variant="neon" glowColor="cyan" className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('dashboard.totalChats')}</p>
                <p className="text-3xl font-bold text-foreground">{mockStats.totalChats.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+12% this week</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neon-orange/10">
                <MessageSquare className="w-6 h-6 text-neon-orange" />
              </div>
            </div>
          </Card>

          {/* Active Today */}
          <Card variant="neon" glowColor="purple" className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('dashboard.activeToday')}</p>
                <p className="text-3xl font-bold text-foreground">{mockStats.activeToday}</p>
                <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+8% vs yesterday</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neon-amber/10">
                <Activity className="w-6 h-6 text-neon-amber" />
              </div>
            </div>
          </Card>

          {/* Total Users */}
          <Card variant="neon" glowColor="blue" className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('dashboard.totalUsers')}</p>
                <p className="text-3xl font-bold text-foreground">{mockStats.totalUsers}</p>
                <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+24 new today</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neon-orange/10">
                <Users className="w-6 h-6 text-neon-orange" />
              </div>
            </div>
          </Card>

          {/* Revenue */}
          <Card variant="neon" glowColor="green" className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('dashboard.revenue')}</p>
                <p className="text-3xl font-bold text-foreground">${mockStats.revenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+18% this month</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chat Volume Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground">Chat Volume</h3>
                <p className="text-sm text-muted-foreground">Conversations over time</p>
              </div>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            
            {/* Simple CSS Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48 px-2">
              {weeklyData.map((data, index) => (
                <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-500 hover:opacity-80",
                      index === weeklyData.length - 1 ? "bg-gradient-to-t from-neon-orange to-neon-orange" : "bg-white/20"
                    )}
                    style={{ height: `${(data.chats / maxChats) * 100}%` }}
                  >
                    <span className="sr-only">{data.chats} chats</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{data.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">Quick Actions</h3>
              <Zap className="w-5 h-5 text-neon-orange" />
            </div>
            
            <div className="space-y-3">
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Manage Settings
                </Button>
              </Link>
              
              <Link href="/pricing">
                <Button variant="neonOutline" className="w-full justify-start gap-2">
                  <CrownIcon className="w-4 h-4" />
                  View Plans
                </Button>
              </Link>
              
              <Button variant="ghost" className="w-full justify-start gap-2">
                <DownloadIcon className="w-4 h-4" />
                Export Data
              </Button>
              
              <Button variant="ghost" className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <RefreshIcon className="w-4 h-4" />
                Clear Cache
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">Latest actions on your platform</p>
              </div>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-orange to-neon-amber flex items-center justify-center text-xs font-bold text-white">
                          {activity.user.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{activity.user}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground/80">{activity.action}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{activity.time}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                        activity.type === 'payment' && "bg-green-500/20 text-green-400",
                        activity.type === 'signup' && "bg-blue-500/20 text-blue-400",
                        activity.type === 'chat' && "bg-purple-500/20 text-purple-400",
                        activity.type === 'login' && "bg-gray-500/20 text-gray-400"
                      )}>
                        {activity.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Icon components for quick actions
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.5 7L12 7l3.5 3L19 3M5 21h14M6 18v3M18 18v3M12 7v14" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}
