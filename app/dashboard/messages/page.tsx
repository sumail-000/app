import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Get all unique conversation partners
  const sentMessages = await prisma.message.findMany({
    where: { senderId: session.user.id },
    select: { receiverId: true },
    distinct: ['receiverId'],
  })

  const receivedMessages = await prisma.message.findMany({
    where: { receiverId: session.user.id },
    select: { senderId: true },
    distinct: ['senderId'],
  })

  const partnerIds = Array.from(new Set([
    ...sentMessages.map((m) => m.receiverId),
    ...receivedMessages.map((m) => m.senderId),
  ]))

  const partners = await prisma.user.findMany({
    where: {
      id: { in: partnerIds },
    },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
    },
  })

  // Get last message for each conversation
  const conversations = await Promise.all(
    partners.map(async (partner) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: partner.id },
            { senderId: partner.id, receiverId: session.user.id },
          ],
        },
        orderBy: { createdAt: 'desc' },
      })

      const unreadCount = await prisma.message.count({
        where: {
          senderId: partner.id,
          receiverId: session.user.id,
          read: false,
        },
      })

      return {
        partner,
        lastMessage,
        unreadCount,
      }
    })
  )

  conversations.sort((a, b) => {
    if (!a.lastMessage) return 1
    if (!b.lastMessage) return -1
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="container mx-auto px-4 py-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {conversations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map(({ partner, lastMessage, unreadCount }) => (
              <Link
                key={partner.id}
                href={`/dashboard/messages/${partner.id}`}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                      {partner.image ? (
                        <Image
                          src={partner.image}
                          alt={partner.name || ''}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

