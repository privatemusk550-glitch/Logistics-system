import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function AdminPackages() {
  const [packages, setPackages] = useState([])
  const [unreadChats, setUnreadChats] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchPackages()
  }, [])

  /* -------- Realtime unread indicator -------- */
  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        payload => {
          if (payload.new.sender === 'customer') {
            setUnreadChats(prev => ({
              ...prev,
              [payload.new.chat_id]: true,
            }))
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchPackages() {
    const { data } = await supabase
      .from('packages')
      .select(`
        id,
        tracking_number,
        receiver_name,
        created_at,
        chats (
          id,
          status
        )
      `)
      .order('created_at', { ascending: false })

    setPackages(data || [])
  }

  async function deletePackage(id) {
    if (!confirm('Delete this package?')) return

    await supabase.from('packages').delete().eq('id', id)
    fetchPackages()
  }

  return (
    <div className="space-y-6">

      <h2 className="text-xl font-semibold">My Packages</h2>

      {packages.length === 0 && (
        <p className="text-gray-500 text-sm">No packages yet.</p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">

          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Tracking</th>
              <th className="px-4 py-3 text-left">Receiver</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id} className="border-b hover:bg-gray-50">

                <td className="px-4 py-3 font-medium">
                  {pkg.tracking_number}
                </td>

                <td className="px-4 py-3">
                  {pkg.receiver_name}
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {new Date(pkg.created_at).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 text-right space-x-2">

                  <button
                    onClick={() => navigate(`/dashboard/packages/${pkg.id}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs"
                  >
                    View
                  </button>

                  {pkg.chats?.length > 0 &&
                    pkg.chats[0].status === 'open' && (
                      <button
                        onClick={() =>
                          navigate(`/dashboard/chat/${pkg.chats[0].id}`)
                        }
                        className="relative px-3 py-1 bg-green-600 text-white rounded-md text-xs"
                      >
                        Chat
                        {unreadChats[pkg.chats[0].id] && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                    )}

                  <button
                    onClick={() => deletePackage(pkg.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-xs"
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}
