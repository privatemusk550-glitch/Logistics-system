/**
 * PortAdminLogin.jsx
 * -------------------
 * Dedicated login page for Port Admin users.
 * This is separate from the main logistics admin login.
 *
 * SECURITY NOTE:
 * Port admins are stored in the `profiles` table with role = 'port_admin'.
 * After login, Supabase RLS (Row Level Security) policies ensure they can
 * only see and edit containers they created (admin_id = their user ID).
 *
 * For junior devs:
 * - This is just a Supabase auth.signInWithPassword call
 * - After login, we check the user's profile role
 * - If role is not 'port_admin', we deny access
 */

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Anchor, Eye, EyeOff, Shield } from 'lucide-react'

export default function PortAdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Step 1: Sign in with Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Step 2: Check the user's role in the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      setError('Profile not found. Contact your administrator.')
      await supabase.auth.signOut() // sign out if no profile
      setLoading(false)
      return
    }

    // Step 3: Only allow port_admin and superadmin roles
    if (profile.role !== 'port_admin' && profile.role !== 'superadmin') {
      setError('Access denied. This portal is for port administrators only.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Success — redirect to the port admin dashboard
    navigate('/port-admin/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950
                    flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center
                          mx-auto mb-4 border border-blue-500/30">
            <Anchor size={30} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Port Admin Portal</h1>
          <p className="text-white/50 text-sm mt-1">Sea Freight Container Management</p>
        </div>

        {/* Security notice */}
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20
                        rounded-lg px-4 py-3 mb-6">
          <Shield size={14} className="text-blue-400 flex-shrink-0" />
          <p className="text-blue-300 text-xs">
            Restricted access. Authorised port administrators only.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl
                           text-white placeholder-white/30 text-sm outline-none
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@portcompany.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 bg-white/10 border border-white/20 rounded-xl
                             text-white placeholder-white/30 text-sm outline-none
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40
                             hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                         rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In to Port Portal'}
            </button>
          </form>
        </div>

        {/* Back link */}
        <p className="text-center mt-6">
          <Link to="/track" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            ← Back to public tracking
          </Link>
        </p>
      </div>
    </div>
  )
}
