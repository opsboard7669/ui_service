import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, Lock, AlertCircle, UserCircle, Check, Layout, BarChart3, KanbanSquare, Zap, Shield, Cloud, Clock, Award } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [typingWord, setTypingWord] = useState('Build')
  const [marketingIndex, setMarketingIndex] = useState(0)
  const [activityIndex, setActivityIndex] = useState(0)

  const typingWords = ['Build', 'Organize', 'Collaborate', 'Deliver']
  const marketingMessages = [
    'Plan projects with confidence.',
    'Collaborate in real time.',
    'Track every task.',
    'Deliver work faster.',
    'One workspace for every team.'
  ]
  const activityMessages = [
    '🟢 Rahul completed Deploy Production',
    '🟢 Vedant invited Akash',
    '🟢 Testing Workspace created',
    '🟢 Backend API deployed',
    '🟢 Security Scan Passed',
    '🟢 3 Tasks completed today'
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Typing animation - rotate every 3 seconds
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setTypingWord(prev => {
        const currentIndex = typingWords.indexOf(prev)
        const nextIndex = (currentIndex + 1) % typingWords.length
        return typingWords[nextIndex]
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [mounted])

  // Marketing subtitle rotation - every 5 seconds
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setMarketingIndex(prev => (prev + 1) % marketingMessages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [mounted])

  // Activity feed rotation - every 4 seconds
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setActivityIndex(prev => (prev + 1) % activityMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData)
      
      // Check if user was redirected from invitation page
      const invitationToken = localStorage.getItem('invitationToken')
      if (invitationToken) {
        // Redirect to invitation acceptance page
        navigate(`/invitations/${invitationToken}`)
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-black via-[#080c14] to-[#0a1612] animate-gradient">
      {/* Subtle Background Decorations with animations */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl animate-float" style={{ background: 'rgba(34, 197, 94, 0.03)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s', background: 'rgba(34, 197, 94, 0.02)' }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] animate-grid" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-4">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-4 lg:gap-10 items-center">
          {/* Login Form Section */}
          <div className={`w-full max-w-md mx-auto lg:mx-0 lg:-mt-4 opacity-0 ${mounted ? 'fade-in-up' : ''}`}>
            <div className="premium-glass-card">
              <div className="mb-5">
                <h1 className="text-2xl font-bold text-white mb-1">Welcome back 👋</h1>
                <p className="text-sm text-gray-400">Your workspace is ready.</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username or Email</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={formData.emailOrUsername}
                      onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/8 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]/40 focus:ring-1 focus:ring-[#22c55e]/15 transition-all text-sm cursor-pointer"
                      placeholder="username or email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/8 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]/40 focus:ring-1 focus:ring-[#22c55e]/15 transition-all text-sm cursor-pointer"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm hover:shadow-lg hover:shadow-[#22c55e]/20 hover:-translate-y-0.5 breathe-animation cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Sign in</span>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors cursor-pointer">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Hero Section - Dashboard Preview */}
          <div className={`hidden lg:block opacity-0 ${mounted ? 'fade-in-up delay-200' : ''}`}>
            <div className="space-y-4">
              {/* Heading */}
              <div className="opacity-0 fade-in">
                <h1 className={`text-5xl font-bold text-white mb-1.5 shimmer-slow ${mounted ? 'heading-animate-in' : ''}`}>
                  OpsBoard
                </h1>
                <p className="text-sm text-gray-400 mb-1">Where Teams <span className="text-[#22c55e] font-medium">{typingWord}</span>, Track and Deliver.</p>
                <p className="text-xs text-gray-500 opacity-0 fade-in delay-100">{marketingMessages[marketingIndex]}</p>
              </div>

              {/* Realistic Dashboard Preview Mock */}
              <div className="premium-dashboard-mock opacity-0 fade-in delay-300">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Workspace</span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>DevOps</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {/* Today's Tasks Section */}
                  <div className="bg-white/4 rounded-lg p-1.5 border border-white/4">
                    <div className="text-xs font-medium text-gray-300 mb-1">Today's Tasks</div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-3 h-3 rounded border border-gray-600 flex-shrink-0" />
                        <span>Deploy Production</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-3 h-3 rounded border border-gray-600 flex-shrink-0" />
                        <span>Review Security</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-3 h-3 rounded border border-gray-600 flex-shrink-0" />
                        <span>Fix API</span>
                      </div>
                    </div>
                  </div>

                  {/* Projects Section */}
                  <div className="bg-white/4 rounded-lg p-1.5 border border-white/4">
                    <div className="text-xs font-medium text-gray-300 mb-1">Projects</div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#22c55e]/10 rounded px-2 py-0.5 text-xs text-[#22c55e] border border-[#22c55e]/20">Backend</div>
                      <div className="flex-1 bg-white/5 rounded px-2 py-0.5 text-xs text-gray-400 border border-white/5">Frontend</div>
                      <div className="flex-1 bg-white/5 rounded px-2 py-0.5 text-xs text-gray-400 border border-white/5">Testing</div>
                    </div>
                  </div>

                  {/* Members Section */}
                  <div className="bg-white/4 rounded-lg p-1.5 border border-white/4">
                    <div className="text-xs font-medium text-gray-300 mb-1">Members</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">V</div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">R</div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-[10px] font-bold text-white">A</div>
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-gray-400">+5</div>
                    </div>
                  </div>

                  {/* Recent Activity with live feed */}
                  <div className="bg-white/4 rounded-lg p-1.5 border border-white/4">
                    <div className="text-xs font-medium text-gray-300 mb-1">Recent Activity</div>
                    <div className="space-y-0.5">
                      <div key={activityIndex} className="flex items-center gap-2 text-xs text-gray-400 fade-in">
                        <Check size={10} className="text-[#22c55e]" />
                        <span className="truncate">{activityMessages[activityIndex]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Check size={10} className="text-[#22c55e]" />
                        <span>Invitation Sent</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Check size={10} className="text-[#22c55e]" />
                        <span>Workspace Updated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-2 opacity-0 fade-in delay-400">
                <div className="premium-feature-card-compact cursor-pointer hover:shadow-lg hover:shadow-[#22c55e]/10">
                  <Layout size={16} className="text-[#22c55e] mb-0.5" />
                  <div className="text-xs font-medium text-white">Workspace</div>
                  <div className="text-[10px] text-gray-500">Collaboration</div>
                </div>
                <div className="premium-feature-card-compact cursor-pointer hover:shadow-lg hover:shadow-[#22c55e]/10">
                  <Zap size={16} className="text-[#22c55e] mb-0.5" />
                  <div className="text-xs font-medium text-white">Smart Tracking</div>
                  <div className="text-[10px] text-gray-500">Task Management</div>
                </div>
                <div className="premium-feature-card-compact cursor-pointer hover:shadow-lg hover:shadow-[#22c55e]/10">
                  <KanbanSquare size={16} className="text-[#22c55e] mb-0.5" />
                  <div className="text-xs font-medium text-white">Kanban Boards</div>
                  <div className="text-[10px] text-gray-500">Visual Workflow</div>
                </div>
                <div className="premium-feature-card-compact cursor-pointer hover:shadow-lg hover:shadow-[#22c55e]/10">
                  <BarChart3 size={16} className="text-[#22c55e] mb-0.5" />
                  <div className="text-xs font-medium text-white">Analytics</div>
                  <div className="text-[10px] text-gray-500">Reports & Insights</div>
                </div>
              </div>

              {/* Trust Section */}
              <div className="flex items-center justify-center gap-3 pt-0 opacity-0 fade-in delay-500">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Shield size={11} className="text-[#22c55e]/60" />
                  <span>Secure Authentication</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock size={11} className="text-[#22c55e]/60" />
                  <span>Real-time Collaboration</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Cloud size={11} className="text-[#22c55e]/60" />
                  <span>Cloud Hosted</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Award size={11} className="text-[#22c55e]/60" />
                  <span>Enterprise Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
