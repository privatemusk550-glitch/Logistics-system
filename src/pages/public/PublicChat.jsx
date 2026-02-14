import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function PublicChat() {
  const { chatId } = useParams()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [chat, setChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adminOnline, setAdminOnline] = useState(false)

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
      navigate('/track')
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
        payload => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [chatId])

  /* ---------------- ADMIN PRESENCE ---------------- */
  useEffect(() => {
    if (!chat?.admin_id) return

    const presenceChannel = supabase.channel(
      `admin-presence-${chat.admin_id}`
    )

    presenceChannel.on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState()
      setAdminOnline(Object.keys(state).length > 0)
    })

    presenceChannel.subscribe()

    return () => {
      supabase.removeChannel(presenceChannel)
    }
  }, [chat])

  /* ---------------- SEND MESSAGE ---------------- */
  async function sendMessage() {
    if (!newMessage.trim()) return

    await supabase.from('chat_messages').insert({
      chat_id: chatId,
      sender: 'customer',
      message: newMessage,
    })

    setNewMessage('')
  }

  async function closeChat() {
    await supabase.from('chat_messages').delete().eq('chat_id', chatId)
    await supabase.from('chats').delete().eq('id', chatId)
    navigate('/track')
  }

  if (loading || !chat) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-gray-500">
        Loading chat...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Customer Care</h2>

        <p className="text-sm text-gray-500">
          You: {chat.customer_name}
        </p>

        <p className="text-sm mt-1">
          Admin status:{' '}
          <span
            className={`font-medium ${
              adminOnline ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {adminOnline ? 'Online' : 'Offline'}
          </span>
        </p>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl shadow p-6 h-[400px] overflow-y-auto space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'customer'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                msg.sender === 'customer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-6 py-2 bg-blue-600 text-white rounded-md"
        >
          Send
        </button>
      </div>

      <button
        onClick={closeChat}
        className="text-lg bg-aramexRed text-white hover:underline"
      >
        Close Chat
      </button>
    </div>
  )
}
