import { useEffect, useState } from 'react'
import { supabase } from "@/lib/supabase";
import { useParams, useNavigate } from 'react-router-dom'

export default function PackageDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pkg, setPkg] = useState(null)
  const [newEvent, setNewEvent] = useState({
    status: '',
    location: '',
  })

  
  useEffect(() => {
    if (id !== 'new') {
      fetchPackage()
    }
  }, [id])

  if (id === 'new') return null

async function addShipmentEvent() {
  const { error } = await supabase
    .from('shipment_events')
    .insert([
      {
        package_id: pkg.id,
        status: newEvent.status,
        location: newEvent.location,
        event_time: new Date().toISOString(),
      },
    ])

  if (!error) {
    setNewEvent({ status: '', location: '' })
    fetchPackage()
  }
}

if (id === 'new') return null


  

  useEffect(() => {
    fetchPackage()
  }, [id])

 async function fetchPackage() {
  const { data, error } = await supabase
    .from('packages')
    .select(`
      *,
      shipment_events (
        id,
        status,
        location,
        event_time
      )
    `)
    .eq('id', id)
    .single()

  if (!error) setPkg(data)
}


  async function updatePackage() {
    const { error } = await supabase
      .from('packages')
      .update({
        sender_name: pkg.sender_name,
        sender_email: pkg.sender_email,
        sender_address: pkg.sender_address,
        receiver_name: pkg.receiver_name,
        receiver_email: pkg.receiver_email,
        receiver_address: pkg.receiver_address,
        status: pkg.status
      })
      .eq('id', id)

    if (!error) alert('Package updated')
  }

  if (!pkg) {
  return (
    <div className="min-h-[300px] flex items-center justify-center text-gray-500">
      Loading package...
    </div>
  )
}

return (
  <div className="space-y-8">

    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-semibold">
          Package {pkg.tracking_number}
        </h2>
        <p className="text-gray-500 text-sm">
          Created {new Date(pkg.created_at).toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 transition"
      >
        Back
      </button>
    </div>

    {/* Sender + Receiver Cards */}
    <div className="grid md:grid-cols-2 gap-6">

      {/* Sender */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="font-semibold text-lg">Sender</h3>

        <input
          className="w-full border rounded-md px-3 py-2"
          value={pkg.sender_name}
          onChange={e => setPkg({ ...pkg, sender_name: e.target.value })}
        />

        <input
          className="w-full border rounded-md px-3 py-2"
          value={pkg.sender_email}
          onChange={e => setPkg({ ...pkg, sender_email: e.target.value })}
        />

        <textarea
          className="w-full border rounded-md px-3 py-2"
          value={pkg.sender_address}
          onChange={e => setPkg({ ...pkg, sender_address: e.target.value })}
        />
      </div>

      {/* Receiver */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="font-semibold text-lg">Receiver</h3>

        <input
          className="w-full border rounded-md px-3 py-2"
          value={pkg.receiver_name}
          onChange={e => setPkg({ ...pkg, receiver_name: e.target.value })}
        />

        <input
          className="w-full border rounded-md px-3 py-2"
          value={pkg.receiver_email}
          onChange={e => setPkg({ ...pkg, receiver_email: e.target.value })}
        />

        <textarea
          className="w-full border rounded-md px-3 py-2"
          value={pkg.receiver_address}
          onChange={e => setPkg({ ...pkg, receiver_address: e.target.value })}
        />
      </div>
      <div>
        <select
          value={pkg.status}
          onChange={(e) =>
            setPkg({ ...pkg, status: e.target.value })
          }
          className="border rounded-md px-3 py-2"
        >
          <option value="Awaiting Parcel">Awaiting Parcel</option>
          <option value="Delivered">Delivered</option>
        </select>

      </div>

    </div>

    {/* Save Button */}
    <div>
      <button
        onClick={updatePackage}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Save Changes
      </button>
    </div>

    {/* Add Shipment Update */}
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h3 className="font-semibold text-lg">
        Add Shipment Update
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          placeholder="Status (Arrived at Facility)"
          value={newEvent.status}
          onChange={e => setNewEvent({ ...newEvent, status: e.target.value })}
          className="border rounded-md px-3 py-2"
        />

        <input
          placeholder="Location"
          value={newEvent.location}
          onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
          className="border rounded-md px-3 py-2"
        />
      </div>

      <button
        onClick={addShipmentEvent}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Add Update
      </button>
    </div>

    {/* Timeline */}
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-semibold text-lg mb-6">
        Shipment Timeline
      </h3>

      <div className="space-y-6 relative">

        {pkg.shipment_events
          .sort((a, b) => new Date(b.event_time) - new Date(a.event_time))
          .map((event, index) => (
            <div key={event.id} className="flex gap-4">

              {/* Timeline Dot */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                {index !== pkg.shipment_events.length - 1 && (
                  <div className="flex-1 w-px bg-gray-300"></div>
                )}
              </div>

              {/* Event Content */}
              <div>
                <p className="font-medium">
                  {event.status}
                </p>
                <p className="text-sm text-gray-500">
                  {event.location}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(event.event_time).toLocaleString()}
                </p>
              </div>

            </div>
          ))}

      </div>
    </div>

  </div>
)

}
