import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

import SuperAdminView from './SuperAdminView'
import AdminView from './AdminView'
import UserView from './UserView'
import { Menu, X } from 'lucide-react'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  
const roleLinks = {
  superadmin: [
    { label: "Manage Admins", path: "#" },
  ],
  admin: [
    { label: "My Packages", path: "packages" },
    { label: "Create Package", path: "packages/new" },
  ],
  user: [
    { label: "My Shipments", path: "#" },
  ],
}

  useEffect(() => {
    if (user) {
      loadProfile()
    } else {
      setProfileLoading(false)
    }
  }, [user])

  async function loadProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, role')
      .eq('id', user.id)
      .single()

    setProfile(data)
    setProfileLoading(false)
  }

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" />
  if (!profile) return <p>No profile found</p>

  return (
  <div className=" h-screen bg-gray-100 flex">

    {/* Mobile Overlay */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    {/* Sidebar */}
    <aside className={`
      fixed md:static z-50 top-0 left-0 h-full w-64 bg-white shadow-lg
      transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0 transition-transform duration-300
    `}>

      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-bold text-red-600">
          Logistics Panel
        </h2>

        <button
          className="md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-500 capitalize">
          {profile.role}
        </p>

        {roleLinks[profile.role]?.map(link => (
          <div
            key={link.label}
            className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer transition"
          >
            {link.label}
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
        >
          Sign Out
        </button>
      </div>
    </aside>

    {/* Main */}
    <div className="flex-1 flex flex-col">

      {/* Topbar */}
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-4">
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <h1 className="text-lg font-semibold">
            Welcome {profile.username || user.email}
          </h1>
        </div>

      </header>

      <main className="p-6 flex-1">
        {profile.role === 'superadmin' && <SuperAdminView />}
        {profile.role === 'admin' && <AdminView />}
        {profile.role === 'user' && <UserView />}
      </main>

    </div>
  </div>
)

}
