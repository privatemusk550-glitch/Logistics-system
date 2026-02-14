import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'



export default function TrackResultModal({ pkg, onClose }) {
  const navigate = useNavigate()
  const [signedUrl, setSignedUrl] = useState(null)

const [images, setImages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')

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
  setChatError('')
  setChatLoading(true)
  // Check if open chat exists
  const { data: existing } = await supabase
    .from('chats')
    .select('id')
    .eq('package_id', pkg.id)
    .eq('status', 'open')
    .limit(1)

  if (existing?.length > 0) {
  navigate(`/chat/${existing[0].id}`)
  setChatLoading(false)
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
  setChatError(error.message || 'Failed to create chat')
  setChatLoading(false)
  return
  }

  // Insert a system message so the user sees an automatic welcome from the system
  try {
    // Insert the admin/bot message first so the chat contains the welcome immediately
    await supabase.from('chat_messages').insert({
      chat_id: newChat.id,
      sender: 'admin',
      message: 'Thanks for reaching out. Please wait while we connect you to customer care. 👋'
    })
  // inserted admin message
  } catch (err) {
    console.warn('[TrackResultModal] failed to insert system message', err)
  }

  // Fetch admin email from admin_public_emails (if available) and notify via EmailJS
  try {
    const { data: admin, error: adminErr } = await supabase
      .from('admin_public_emails')
      .select('email')
      .eq('id', pkg.admin_id)
      .single()

    if (admin?.email) {
      // sending email to admin
      try {
        const result = await emailjs.send(
          'service_hp7tcgb',
          'template_5ykzgam',
          {
            to_email: admin.email,
            customer_name: pkg?.sender_name || pkg?.receiver_name || 'Guest User',
            tracking_number: pkg?.tracking_number,
            chat_link: `${window.location.origin}/admin/chat/${newChat.id}`,
          },
          'yRmDqe6CPNJQOzgti'
        )
        // email sent
      } catch (err) {
        console.error('[TrackResultModal] email failed:', err)
      }
    } else {
      // no admin email found
    }
  } catch (err) {
    console.warn('[TrackResultModal] failed to fetch admin email', err)
  }

  // finalize and navigate to chat
  try {
    navigate(`/chat/${newChat.id}`)
    setChatLoading(false)
  } catch (err) {
    setChatLoading(false)
    setChatError('Failed to open chat')
    console.warn('[TrackResultModal] navigation failed', err)
  }
}

// Sends an email to admin using EmailJS. Replace placeholders with your service/template/public key.
async function sendAdminEmail(chat, pkg) {
  try {
    // use package sender email as user email if available
    const userEmail = pkg?.sender_email || pkg?.receiver_email || 'unknown@example.com'
    const userName = pkg?.sender_name || pkg?.receiver_name || 'Guest User'

    // Replace the following IDs with your EmailJS values
    const SERVICE_ID = 'service_hp7tcgb'
    const TEMPLATE_ID = 'template_5ykzgam'
    const PUBLIC_KEY = 'yRmDqe6CPNJQOzgti'

    console.log('[TrackResultModal] sending admin email for chat', chat.id)

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      user_name: userName,
      user_email: userEmail,
      chat_id: chat.id,
    }, PUBLIC_KEY)

    console.log('[TrackResultModal] Admin notified 📩')
  } catch (err) {
    console.error('[TrackResultModal] Email failed:', err)
    throw err
  }
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
        className="block bg-white text-black items-center px-4 py-2 rounded-md"
      >
        View Package Content {i + 1}
      </a>
    ))}
  </div>
)}


</div>


        {/* Timeline here */}

        <div className="mt-10">
          <button
            onClick={goToChat}
            disabled={chatLoading}
            className="w-full bg-white text-black py-3 rounded-xl disabled:opacity-60"
          >
            {chatLoading ? 'Opening chat...' : 'Contact Customer Care'}
          </button>
          {chatError && (
            <div className="mt-3 text-red-600 text-sm">
              {chatError}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
