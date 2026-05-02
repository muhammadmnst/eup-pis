'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Zap, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react'
import { APP_COMPANY } from '@/lib/constants'

export default function AdminLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      username: fd.get('username'),
      password: fd.get('password'),
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Username atau password salah')
    } else {
      router.replace('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-grid flex items-center justify-center px-4">
      {/* Glow backdrop */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 items-center justify-center shadow-xl shadow-blue-900/40 mb-4">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-slate-400 mt-1">{APP_COMPANY}</p>
        </div>

        {/* Card */}
        <div className="card p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Masuk ke Sistem</h2>
            <p className="text-sm text-slate-400 mt-1">Gunakan akun administrator Anda</p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="label">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="input pl-10"
                  placeholder="admin"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-login"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Masuk...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          EUP Project Information System v1.0
        </p>
      </div>
    </div>
  )
}
