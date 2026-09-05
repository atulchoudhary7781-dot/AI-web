'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, DollarSign, MessageSquare, CreditCard,
  Shield, TrendingUp, UserCheck, Activity,
  Search, Filter, MoreVertical, Eye, Edit,
  Trash2, Crown, Mail, Calendar, RefreshCw,
  AlertCircle, CheckCircle, Clock, BarChart3,
  Settings, LogOut, ChevronLeft, Database
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// Types
interface AdminStats {
  users: {
    total: number
    newThisMonth: number
    newThisWeek: number
    activeToday: number
  }
  chats: {
    total: number
    thisMonth: number
  }
  subscriptions: {
    free: number
    normal: number
    pro: number
  }
  revenue: {
    totalRevenue: number
    totalPayments: number
    monthlyRevenue: number
    monthlyPayments: number
  }
  recentPayments: any[]
  recentUsers: any[]
}

interface UserData {
  id: string
  name: string | null
  email: string
  avatar: string | null
  role: string
  emailVerified: boolean
  subscriptionPlan: string
  subscriptionStatus: string
  chatsToday: number
  createdAt: string
  _count: {
    chats: number
    subscriptions: number
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  
  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'logs'>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null)

  // Get user from localStorage
  const getUser = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    }
    return null
  }

  const currentUser = getUser()

  // Fetch stats on mount
  useEffect(() => {
    // Check if user is admin (in real app, verify server-side)
    if (!currentUser) {
      router.push('/')
      return
    }
    
    fetchStats()
    fetchUsers()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(planFilter && { plan: planFilter })
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Refetch when filters change
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [searchQuery, planFilter, currentPage])

  // Handle user actions
  const handleUserAction = async (userId: string, action: string, data?: any) => {
    setUserActionLoading(userId)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ userId, action, ...data })
      })

      if (response.ok) {
        fetchUsers() // Refresh list
        fetchStats() // Refresh stats
      }
    } catch (error) {
      console.error('User action failed:', error)
    } finally {
      setUserActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })

      if (response.ok) {
        fetchUsers()
        fetchStats()
      }
    } catch (error) {
      console.error('Delete user failed:', error)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100) // Convert cents to dollars
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get plan badge color
  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30'
      case 'normal': return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="admin-page-container min-h-screen bg-[#0a0a0f] overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/30 scrollbar-track-transparent">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#12121a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/profile')}
                className="text-gray-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Profile
              </Button>
              
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-neon-purple" />
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              </div>
            </div>

            <Badge variant="outline" className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30">
              Administrator
            </Badge>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 bg-[#12121a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
              { id: 'users' as const, label: 'Users', icon: Users },
              { id: 'payments' as const, label: 'Payments', icon: CreditCard },
              { id: 'logs' as const, label: 'Activity Logs', icon: Database },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-neon-cyan text-neon-cyan'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <Card className="bg-[#12121a] border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Users</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.users.total.toLocaleString()}</p>
                      <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{stats.users.newThisMonth} this month
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-neon-cyan/10">
                      <Users className="w-6 h-6 text-neon-cyan" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Today */}
              <Card className="bg-[#12121a] border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Today</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.users.activeToday}</p>
                      <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        +{stats.users.newThisWeek} this week
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <UserCheck className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Chats */}
              <Card className="bg-[#12121a] border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Chats</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.chats.total.toLocaleString()}</p>
                      <p className="text-xs text-neon-cyan mt-2 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        +{stats.chats.thisMonth} this month
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-neon-cyan/10">
                      <MessageSquare className="w-6 h-6 text-neon-cyan" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card className="bg-[#12121a] border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-white mt-1">{formatCurrency(stats.revenue.monthlyRevenue)}</p>
                      <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {stats.revenue.monthlyPayments} payments
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-500/10">
                      <DollarSign className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Distribution & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscriptions Chart */}
              <Card className="bg-[#12121a] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-neon-cyan" />
                    Subscription Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { plan: 'Free', count: stats.subscriptions.free, color: 'bg-gray-500', percentage: (stats.subscriptions.free / stats.users.total * 100).toFixed(1) },
                      { plan: 'Normal ($10/mo)', count: stats.subscriptions.normal, color: 'bg-neon-cyan', percentage: (stats.subscriptions.normal / stats.users.total * 100).toFixed(1) },
                      { plan: 'Pro ($20/mo)', count: stats.subscriptions.pro, color: 'bg-neon-cyan', percentage: (stats.subscriptions.pro / stats.users.total * 100).toFixed(1) },
                    ].map((item) => (
                      <div key={item.plan} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{item.plan}</span>
                          <span className="text-gray-400">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.color} transition-all duration-500`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-white">Total Revenue (All Time)</span>
                        <span className="text-green-400">{formatCurrency(stats.revenue.totalRevenue)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">From {stats.revenue.totalPayments} successful payments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card className="bg-[#12121a] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    Recent Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {stats.recentPayments.length > 0 ? (
                      stats.recentPayments.map((payment: any) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{payment.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-green-400">
                            +{formatCurrency(payment.amount)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">No payments yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Users */}
            <Card className="bg-[#12121a] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-neon-cyan" />
                  Recently Registered Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Plan</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email Verified</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentUsers.map((user: any) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white text-sm font-medium">
                                {(user.name || user.email[0]).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{user.name || 'Unnamed'}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={getPlanBadgeColor(user.subscriptionPlan)}>
                              {user.subscriptionPlan.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {user.emailVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-400" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-400">
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="bg-[#12121a] border-white/10">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>
                  
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-cyan"
                  >
                    <option value="">All Plans</option>
                    <option value="free">Free</option>
                    <option value="normal">Normal</option>
                    <option value="pro">Pro</option>
                  </select>

                  <Button
                    onClick={fetchUsers}
                    variant="outline"
                    size="icon"
                    className="border-white/10 text-gray-400 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-[#12121a] border-white/10">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Plan</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Chats Today</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Joined</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                {user.avatar ? (
                                  <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-medium">
                                    {(user.name || user.email[0]).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-white">{user.name || 'Unnamed'}</p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                {user.role === 'admin' && (
                                  <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                                    ADMIN
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className={getPlanBadgeColor(user.subscriptionPlan)}>
                                {user.subscriptionPlan.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-white font-mono">{user.chatsToday}/10</span>
                            </td>
                            <td className="py-4 px-4">
                              {user.emailVerified ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                              )}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-400">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                {!user.emailVerified && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUserAction(user.id, 'verify_email')}
                                    disabled={userActionLoading === user.id}
                                    className="text-green-400 hover:bg-green-500/10"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleUserAction(user.id, 'reset_chats')}
                                  disabled={userActionLoading === user.id}
                                  className="text-neon-cyan hover:bg-neon-cyan/10"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-white/10">
                  <p className="text-sm text-gray-500">
                    Showing {users.length} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-white/10 text-gray-400"
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="border-white/10 text-gray-400"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && stats && (
          <div className="space-y-6">
            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[#12121a] border-white/10">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.revenue.totalRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.revenue.totalPayments} payments</p>
                </CardContent>
              </Card>
              
              <Card className="bg-[#12121a] border-white/10">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-400">This Month</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(stats.revenue.monthlyRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.revenue.monthlyPayments} payments</p>
                </CardContent>
              </Card>

              <Card className="bg-[#12121a] border-white/10">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-400">Paying Customers</p>
                  <p className="text-2xl font-bold text-neon-cyan mt-1">
                    {stats.subscriptions.normal + stats.subscriptions.pro}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Normal + Pro plans</p>
                </CardContent>
              </Card>
            </div>

            {/* All Payments Table */}
            <Card className="bg-[#12121a] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentPayments.map((payment: any) => (
                        <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-white">{payment.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{payment.user?.email}</p>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-white">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              payment.status === 'succeeded' ? 'bg-green-500/10 text-green-400' :
                              payment.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                              'bg-yellow-500/10 text-yellow-400'
                            }>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-400">
                            {formatDate(payment.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <Card className="bg-[#12121a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-neon-cyan" />
                Admin Activity Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Activity logs will appear here as admin actions are performed.</p>
                <p className="text-sm mt-2">All user modifications are tracked for security purposes.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
