import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'



export default function TrackResultModal({ pkg, onClose }) {
  const navigate = useNavigate()
  const [signedUrl, setSignedUrl] = useState(null)

const [images, setImages] = useState([])

useEffect(() => {
  if (!pkg?.id) return

  async function loadImages() {
    const { data } = await supabase
      .from('package_images')
      .select('*')
      .eq('package_id', pkg.id)

    if (!data) return

    const signed = []

    for (let img of data) {
      const { data: signedData } = await supabase.storage
        .from('package-images')
        .createSignedUrl(img.image_path, 60)

      if (signedData?.signedUrl) {
        signed.push(signedData.signedUrl)
      }
    }

    setImages(signed)
  }

  loadImages()
}, [pkg])



  async function goToChat() {
    
  // Check if open chat exists
  const { data: existing } = await supabase
    .from('chats')
    .select('id')
    .eq('package_id', pkg.id)
    .eq('status', 'open')
    .limit(1)

  if (existing?.length > 0) {
    navigate(`/chat/${existing[0].id}`)
    return
  }

  // Create new chat
  const { data: newChat, error } = await supabase
    .from('chats')
    .insert({
      package_id: pkg.id,
      admin_id: pkg.admin_id,
      customer_name: 'Guest User'
    })
    .select()
    .single()

  if (error) {
    alert(error.message)
    return
  }

  navigate(`/chat/${newChat.id}`)
}



  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-[95%] max-w-3xl max-h-[90vh] overflow-y-auto 
                      bg-white/20 backdrop-blur-xl 
                      border border-white/30 
                      shadow-2xl rounded-2xl p-8">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl"
        >
          ✕
        </button>

        <div className="space-y-8 text-white">

  {/* Header */}
  <div>
    <p className="text-sm opacity-70">Tracking Number</p>
    <h2 className="text-2xl font-bold">
      {pkg.tracking_number}
    </h2>
  </div>

  {/* Sender / Receiver */}
  <div className="grid md:grid-cols-2 gap-6">
    <div>
      <p className="text-sm opacity-70">Sender's name</p>
      <p className="font-medium">{pkg.sender_name}</p>
      <p className="text-sm opacity-70">Sender's E-mail</p>
      <p className="font-medium">{pkg.sender_email}</p>
    </div>

    <div>
      <p className="text-sm opacity-70">Receiver's Name</p>
      <p className="font-medium">{pkg.receiver_name}</p>
      <p className="text-sm opacity-70">Receiver's E-mail</p>
      <p className="font-medium">{pkg.receiver_email}</p>
      <p className="text-sm opacity-70">Receiver's Address</p>
      <p className="font-medium">{pkg.receiver_address}</p>
    </div>
  </div>

  {/* Timeline */}
  <div>
    <h3 className="font-semibold mb-6">
      Shipment Timeline
    </h3>

    <div className="space-y-6">
      {pkg.shipment_events
        ?.sort(
          (a, b) =>
            new Date(b.event_time) -
            new Date(a.event_time)
        )
        .map((event, index) => (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
              {index !== pkg.shipment_events.length - 1 && (
                <div className="flex-1 w-px bg-white/30"></div>
              )}
            </div>

            <div>
              <p className="font-medium">
                {event.status}
              </p>
              <p className="text-sm opacity-70">
                {event.location}
              </p>
              <p className="text-xs opacity-50 mt-1">
                {new Date(event.event_time).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
    </div>
  </div>
        {images.length > 0 && (
  <div className="mt-6 space-y-3">
    {images.map((url, i) => (
      <a
        key={i}
        href={url}
        download
        className="block bg-white text-black px-4 py-2 rounded-md"
      >
        Download Image {i + 1}
      </a>
    ))}
  </div>
)}


</div>


        {/* Timeline here */}

        <button
          onClick={goToChat}
          className="mt-10 w-full bg-white text-black py-3 rounded-xl"
        >
          Contact Customer Care
        </button>

      </div>
    </div>
  )
}
