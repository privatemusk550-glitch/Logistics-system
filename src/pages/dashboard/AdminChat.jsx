import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AdminChat() {
  const { chatId } = useParams()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [chat, setChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adminOnline, setAdminOnline] = useState(false)


  const bottomRef = useRef(null)

  /* ---------------- LOAD CHAT ---------------- */
  useEffect(() => {
    if (!chatId) return
    loadChat()
    loadMessages()
  }, [chatId])

  async function loadChat() {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single()

    if (error) {
      navigate('/dashboard/packages')
      return
    }

    setChat(data)
    setLoading(false)
  }

  async function loadMessages() {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    setMessages(data || [])
  }

  /* ---------------- REALTIME ---------------- */
/* ---------------- REALTIME MESSAGES ---------------- */
useEffect(() => {
  if (!chatId) return

  const channel = supabase
    .channel(`chat-${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        setMessages((prev) => [...prev, payload.new])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [chatId])
  /* ---------------- ADMIN PRESENCE ---------------- */
  useEffect(() => {
  if (!chat?.admin_id) return

  const channel = supabase.channel(
    `admin-presence-${chat.admin_id}`,
    {
      config: {
        presence: { key: chat.admin_id },
      },
    }
  )

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState() || {}
    setAdminOnline(Object.keys(state).length > 0)
  })

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        online_at: new Date().toISOString(),
      })
    }
  })

  return () => {
    channel.unsubscribe()
  }
}, [chat])





  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ---------------- SEND MESSAGE ---------------- */
  async function sendMessage() {
    if (!newMessage.trim()) return

    await supabase.from('chat_messages').insert({
      chat_id: chatId,
      sender: 'admin',
      message: newMessage,
    })

    setNewMessage('')
  }

  /* ---------------- CLOSE CHAT ---------------- */
  async function closeChat() {
    await supabase.from('chat_messages').delete().eq('chat_id', chatId)
    await supabase.from('chats').delete().eq('id', chatId)
    navigate('/dashboard/packages')
  }

  if (loading || !chat) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-gray-500">
        Loading chat...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        
        <div>
          <h2 className="text-xl font-semibold">Customer Support Chat</h2>
          <p className="text-sm text-gray-500">
            Customer: {chat.customer_name}
          </p>
        </div>

        {chat.status === 'open' && (
          <button
            onClick={closeChat}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Close Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-2xl shadow border h-[500px] overflow-y-auto p-4 space-y-3">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex ${
              m.sender === 'admin' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                m.sender === 'admin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {m.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      {chat.status === 'open' && (
        <div className="flex gap-3">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}
