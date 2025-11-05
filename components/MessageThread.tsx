'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Message } from '@prisma/client'
import { format } from 'date-fns'

interface MessageThreadProps {
  partner: User
  lastMessage: Message | null
  unreadCount: number
  currentUserId: string
}

export default function MessageThread({ partner, lastMessage, unreadCount }: MessageThreadProps) {
  const router = useRouter()
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const loadMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/messages?userId=${partner.id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChat = () => {
    setShowChat(true)
    loadMessages()
    // Mark as read
    fetch(`/api/messages/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: partner.id }),
    })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: partner.id,
          content: newMessage,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages([...messages, data.message])
        setNewMessage('')
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        onClick={handleOpenChat}
        className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              {partner.image ? (
                <img src={partner.image} alt={partner.name || ''} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xl">{partner.name?.[0] || '?'}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{partner.name || 'Anonymous'}</h3>
                {unreadCount > 0 && (
                  <span className="bg-primary px-2 py-1 rounded-full text-xs font-semibold">
                    {unreadCount}
                  </span>
                )}
              </div>
              {lastMessage && (
                <p className="text-gray-400 text-sm truncate">
                  {lastMessage.content}
                </p>
              )}
            </div>
          </div>
          {lastMessage && (
            <span className="text-gray-500 text-sm">
              {format(new Date(lastMessage.createdAt), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{partner.name || 'Anonymous'}</h2>
              <button
                onClick={() => {
                  setShowChat(false)
                  router.refresh()
                }}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && messages.length === 0 ? (
                <div className="text-center text-gray-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400">No messages yet.</div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === partner.id ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === partner.id
                          ? 'bg-gray-700'
                          : 'bg-primary'
                      }`}
                    >
                      <p className="text-white">{message.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(message.createdAt), 'p')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="px-6 py-2 bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

