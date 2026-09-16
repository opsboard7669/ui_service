import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../lib/api'
import { Mail, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email')
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authApi.requestPasswordReset(formData.email)
      setMessage('OTP has been sent to your email')
      setStep('otp')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await authApi.verifyOTPAndResetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      })
      setStep('success')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell h-screen flex items-center justify-center p-3 md:p-4 animate-fade-in overflow-hidden">
      <div className="glass-card card-hover w-full max-w-sm md:max-w-md">
        <div className="mb-3 md:mb-6">
          <Link to="/login" className="inline-flex items-center text-secondary hover:text-white transition-all duration-300 text-xs md:text-sm">
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Link>
        </div>

        {step === 'email' && (
          <>
            <div className="text-center mb-4 md:mb-8">
              <h1 className="heading-lg md:heading-xl gradient-text mb-1 md:mb-2">Forgot Password</h1>
              <p className="text-secondary text-xs md:text-sm">Enter your email to receive an OTP</p>
            </div>

            {error && (
              <div className="mb-3 md:mb-6 p-2 md:p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2 text-red-400 text-xs md:text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestOTP} className="space-y-3 md:space-y-6">
              <div>
                <label className="label-field text-xs md:text-sm">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 text-xs md:text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 py-2 md:py-2.5 text-xs md:text-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="text-center mb-4 md:mb-8">
              <h1 className="heading-lg md:heading-xl gradient-text mb-1 md:mb-2">Enter OTP</h1>
              <p className="text-secondary text-xs md:text-sm">Enter the 6-digit OTP sent to {formData.email}</p>
            </div>

            {message && (
              <div className="mb-3 md:mb-6 p-2 md:p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center space-x-2 text-green-400 text-xs md:text-sm">
                <CheckCircle size={16} />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="mb-3 md:mb-6 p-2 md:p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2 text-red-400 text-xs md:text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-3 md:space-y-5">
              <div>
                <label className="label-field text-xs md:text-sm">OTP</label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  className="input-field px-3 md:px-4 py-2 md:py-3 text-center text-xl md:text-2xl tracking-widest text-xs md:text-sm"
                  placeholder="000000"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>

              <div>
                <label className="label-field text-xs md:text-sm">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="input-field pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 text-xs md:text-sm"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label className="label-field text-xs md:text-sm">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                  <input
                    type="password"
                    value={formData.confirmNewPassword}
                    onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                    className="input-field pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 text-xs md:text-sm"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 py-2 md:py-2.5 text-xs md:text-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>

            <button
              onClick={() => setStep('email')}
              className="mt-2 md:mt-4 w-full text-xs md:text-sm text-secondary hover:text-white transition-all duration-300"
            >
              Change Email
            </button>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-4 md:py-8 animate-fade-in">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h1 className="heading-lg md:heading-xl gradient-text mb-1 md:mb-2">Password Reset Successful</h1>
            <p className="text-secondary mb-4 md:mb-8 text-xs md:text-sm">Your password has been reset successfully</p>
            <Link to="/login" className="gradient-btn inline-flex items-center space-x-2 text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5">
              <span>Back to Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
