import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import CreateAdmin from './CreateAdmin';
import { useAuth } from '../../lib/auth-context'


export default function SuperAdminView() {
  const [admins, setAdmins] = useState([])
  const { session } = useAuth() // ✅ hook at top-level

  useEffect(() => {
    fetchAdmins()
  }, [])

  async function fetchAdmins() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, username')
      .eq('role', 'admin')

    if (!error) setAdmins(data)
  }

  async function deleteAdmin(id) {
  if (!session) {
    alert('No active session');
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke('delete-admin', {
      body: { userId: id },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error details:', error);
      // Try to extract error message from response
      if (error.context && error.context.body) {
        try {
          const errorData = JSON.parse(error.context.body);
          alert(errorData.error || error.message);
        } catch {
          alert(error.message);
        }
      } else {
        alert(error.message);
      }
      return;
    }

    alert('Admin deleted successfully');
    fetchAdmins(); // Refresh the list
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('An unexpected error occurred');
  }
}



  return (
  <div className="space-y-8">

    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Super Admin Panel
      </h2>

      <div className="bg-white p-6 rounded-xl shadow">
        <CreateAdmin />
      </div>
    </div>

    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Admin Accounts
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-gray-500">
              <th className="py-3">Username</th>
              <th>Email</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-medium">
                  {admin.username}
                </td>
                <td>{admin.email}</td>
                <td className="text-right">
                  {admin.id !== session.user.id && (
                    <button
                      onClick={() => deleteAdmin(admin.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>

  </div>
)

}

