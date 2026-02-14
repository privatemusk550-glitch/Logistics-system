import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'

export default function CreateAdmin() {
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (!session) {
      setError('No active session. Please log in again.')
      setLoading(false)
      return
    }

  // session info

    try {
      const response = await supabase.functions.invoke('create-admin', {
        body: {
          email,
          password,
          username,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

  // full response

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create admin')
      }

      setMessage(`Admin ${email} created successfully!`)
      
      // Clear form
      setEmail('')
      setPassword('')
      setUsername('')

    } catch (err) {
      console.error('Create admin error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
  <form
    onSubmit={handleCreate}
    className="space-y-5"
  >
    <h3 className="text-lg font-semibold">
      Create New Admin
    </h3>

    <div>
      <label className="block text-sm text-gray-600 mb-1">
        Email
      </label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        placeholder="admin@email.com"
      />
    </div>

    <div>
      <label className="block text-sm text-gray-600 mb-1">
        Username
      </label>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        placeholder="john_admin"
      />
    </div>

    <div>
      <label className="block text-sm text-gray-600 mb-1">
        Password
      </label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        placeholder="Minimum 6 characters"
      />
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition disabled:opacity-60"
    >
      {loading ? "Creating..." : "Create Admin"}
    </button>

    {error && (
      <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
        {error}
      </div>
    )}

    {message && (
      <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm">
        {message}
      </div>
    )}
  </form>
)

}