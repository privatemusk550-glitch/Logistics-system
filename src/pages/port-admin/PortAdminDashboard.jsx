/**
 * PortAdminDashboard.jsx
 * -----------------------
 * Dashboard for port administrators to manage sea freight containers.
 *
 * WHAT PORT ADMINS CAN DO:
 * 1. View all their containers with status overview
 * 2. Create a new container record
 * 3. Add port events (customs cleared, arrived at berth, etc.)
 * 4. Upload photos of the container
 * 5. Update the container status
 *
 * This dashboard is only accessible to users with role = 'port_admin'.
 * It's reached via /port-admin/dashboard after logging in.
 *
 * For junior devs:
 * - We use the `usePortAdmin` hook (defined below) to guard this page
 * - All Supabase queries here are scoped to the logged-in admin's ID
 * - The page has three main "views": list, create form, and detail view
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import {
  Plus, LogOut, Ship, Package, AlertCircle,
  CheckCircle, Clock, Search, ChevronRight, Loader
} from 'lucide-react'
import CreateContainerForm from './CreateContainerForm'
import ContainerDetailView from './ContainerDetailView'

export default function PortAdminDashboard() {
  const navigate = useNavigate()

  // The logged in user's Supabase Auth user object
  const [user, setUser] = useState(null)

  // List of this admin's containers
  const [containers, setContainers] = useState([])

  // Loading state
  const [loading, setLoading] = useState(true)

  // 'list' | 'create' | 'detail'
  const [view, setView] = useState('list')

  // The selected container ID when in detail view
  const [selectedContainerId, setSelectedContainerId] = useState(null)

  // Search/filter text
  const [search, setSearch] = useState('')

  // ── On mount: check auth and load containers ───────────────────────────
  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  async function checkAuthAndLoad() {
    // Get the currently logged-in user
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      // Not logged in — redirect to port admin login
      navigate('/port-admin/login')
      return
    }

    // Check they have port_admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', currentUser.id)
      .single()

    if (profile?.role !== 'port_admin' && profile?.role !== 'superadmin') {
      navigate('/port-admin/login')
      return
    }

    setUser({ ...currentUser, username: profile.username, role: profile.role })
    await loadContainers(currentUser.id)
  }

  // ── Fetch all containers created by this admin ─────────────────────────
  async function loadContainers(adminId) {
    setLoading(true)

    const { data, error } = await supabase
      .from('containers')
      .select(`
        id,
        container_number,
        container_type,
        status,
        port_of_loading,
        port_of_discharge,
        eta,
        owner_name,
        vessel_name,
        created_at
      `)
      .eq('admin_id', adminId) // Only this admin's containers
      .order('created_at', { ascending: false })

    if (!error && data) setContainers(data)
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/port-admin/login')
  }

  // ── Filtered containers (by search text) ──────────────────────────────
  const filtered = containers.filter(c =>
    !search ||
    c.container_number?.toLowerCase().includes(search.toLowerCase()) ||
    c.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.status?.toLowerCase().includes(search.toLowerCase())
  )

  // ── Status counts for the stats bar ───────────────────────────────────
  const stats = {
    total: containers.length,
    cleared: containers.filter(c => c.status?.toLowerCase().includes('cleared')).length,
    pending: containers.filter(c => c.status?.toLowerCase().includes('pending') || c.status?.toLowerCase().includes('hold')).length,
    transit: containers.filter(c => c.status?.toLowerCase().includes('transit') || c.status?.toLowerCase().includes('arrived')).length,
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top Navigation Bar ── */}
      <header className="bg-slate-900 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Ship size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-none">Port Admin Portal</h1>
              <p className="text-white/40 text-xs mt-0.5">{user?.username || user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            {view !== 'list' && (
              <button
                onClick={() => { setView('list'); setSelectedContainerId(null) }}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                ← Back to list
              </button>
            )}

            {view === 'list' && (
              <button
                onClick={() => setView('create')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
                           text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
                New Container
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-white/60 hover:text-white
                         text-sm transition-colors px-3 py-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* ── CREATE VIEW ── */}
        {view === 'create' && (
          <CreateContainerForm
            onSuccess={() => {
              setView('list')
              if (user) loadContainers(user.id)
            }}
            onCancel={() => setView('list')}
            adminId={user?.id}
          />
        )}

        {/* ── DETAIL VIEW ── */}
        {view === 'detail' && selectedContainerId && (
          <ContainerDetailView
            containerId={selectedContainerId}
            onBack={() => { setView('list'); setSelectedContainerId(null) }}
          />
        )}

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Containers" value={stats.total} icon={<Package size={18} className="text-blue-500" />} />
              <StatCard label="Cleared" value={stats.cleared} icon={<CheckCircle size={18} className="text-green-500" />} />
              <StatCard label="Pending / On Hold" value={stats.pending} icon={<AlertCircle size={18} className="text-yellow-500" />} />
              <StatCard label="In Transit" value={stats.transit} icon={<Ship size={18} className="text-blue-400" />} />
            </div>

            {/* Search bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6
                            flex items-center gap-3 shadow-sm">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by container number, owner, or status..."
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Container list */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader size={24} className="text-blue-500 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Ship size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">{search ? 'No containers match your search' : 'No containers yet'}</p>
                {!search && (
                  <p className="text-sm mt-1">
                    Click <strong>New Container</strong> to add one
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Container #
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Owner
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Route
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        ETA
                      </th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                        onClick={() => { setSelectedContainerId(c.id); setView('detail') }}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-gray-800">
                            {c.container_number}
                          </span>
                          <p className="text-xs text-gray-400 mt-0.5">{c.container_type}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                          {c.owner_name || '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs hidden lg:table-cell">
                          {c.port_of_loading} → {c.port_of_discharge}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs hidden md:table-cell">
                          {c.eta ? new Date(c.eta).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td className="pr-4">
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// ── Small helper components ─────────────────────────────────────────────────

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase() || ''
  let cls = 'bg-gray-100 text-gray-600'
  if (s.includes('cleared') || s.includes('delivered')) cls = 'bg-green-100 text-green-700'
  else if (s.includes('hold') || s.includes('pending')) cls = 'bg-yellow-100 text-yellow-700'
  else if (s.includes('transit') || s.includes('arrived')) cls = 'bg-blue-100 text-blue-700'

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {status || 'Unknown'}
    </span>
  )
}
