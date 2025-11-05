import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format } from 'date-fns'
import DashboardStats from '@/components/DashboardStats'
import DashboardCard from '@/components/DashboardCard'
import SafeImage from '@/components/SafeImage'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: {
          content: {
            select: { id: true },
          },
        },
      },
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const isPerformer = user.role === 'PERFORMER'

  // Fetch stats for performers
  let stats = []
  let recentBookings: any[] = []
  let unreadMessages = 0

  if (isPerformer) {
    const bookings = await prisma.booking.findMany({
      where: { performerId: user.id },
      include: {
        client: { select: { name: true, image: true } },
        payment: true,
      },
      orderBy: { date: 'desc' },
      take: 5,
    })

    const totalBookings = await prisma.booking.count({
      where: { performerId: user.id },
    })

    const pendingBookings = await prisma.booking.count({
      where: { performerId: user.id, status: 'pending' },
    })

    const completedBookings = await prisma.booking.count({
      where: { performerId: user.id, status: 'completed' },
    })

    const totalEarnings = await prisma.payment.aggregate({
      where: {
        userId: user.id,
        status: 'completed',
      },
      _sum: { amount: true },
    })

    unreadMessages = await prisma.message.count({
      where: {
        receiverId: user.id,
        read: false,
      },
    })

    stats = [
      {
        title: 'Total Earnings',
        value: `$${(totalEarnings._sum.amount || 0).toFixed(0)}`,
        icon: (
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        href: '/dashboard/earnings',
        color: 'green' as const,
      },
      {
        title: 'Pending Bookings',
        value: pendingBookings,
        icon: (
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        href: '/dashboard/bookings',
        color: 'yellow' as const,
      },
      {
        title: 'Total Bookings',
        value: totalBookings,
        icon: (
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        href: '/dashboard/bookings',
        color: 'blue' as const,
      },
      {
        title: 'Unread Messages',
        value: unreadMessages,
        icon: (
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        href: '/dashboard/messages',
        color: 'purple' as const,
      },
    ]

    recentBookings = bookings
  } else {
    const bookings = await prisma.booking.findMany({
      where: { clientId: user.id },
      include: {
        performer: { 
          select: { 
            name: true, 
            image: true,
            profile: { select: { location: true } },
          },
        },
        payment: true,
      },
      orderBy: { date: 'desc' },
      take: 5,
    })

    const totalBookings = await prisma.booking.count({
      where: { clientId: user.id },
    })

    const upcomingBookings = await prisma.booking.count({
      where: {
        clientId: user.id,
        status: { in: ['pending', 'confirmed'] },
        date: { gte: new Date() },
      },
    })

    const favoritesCount = await prisma.favorite.count({
      where: { userId: user.id },
    })

    unreadMessages = await prisma.message.count({
      where: {
        receiverId: user.id,
        read: false,
      },
    })

    stats = [
      {
        title: 'Upcoming Bookings',
        value: upcomingBookings,
        icon: (
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        href: '/dashboard/bookings',
        color: 'blue' as const,
      },
      {
        title: 'Total Bookings',
        value: totalBookings,
        icon: (
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        href: '/dashboard/bookings',
        color: 'green' as const,
      },
      {
        title: 'Favorites',
        value: favoritesCount,
        icon: (
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
        href: '/dashboard/favorites',
        color: 'red' as const,
      },
      {
        title: 'Unread Messages',
        value: unreadMessages,
        icon: (
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        href: '/dashboard/messages',
        color: 'purple' as const,
      },
    ]

    recentBookings = bookings
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border-2 border-primary/30">
                {user.image ? (
                  <SafeImage src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-xl font-bold">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user.name?.split(' ')[0] || 'User'}</h1>
                <p className="text-gray-400 text-sm capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm font-semibold">
                Home
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <DashboardStats stats={stats} />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {isPerformer ? (
                <>
                  <DashboardCard
                    title="My Profile"
                    description="Manage your performer profile and settings"
                    href="/dashboard/profile"
                    icon={
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  />
                  <DashboardCard
                    title="My Content"
                    description="Upload and manage photos and videos"
                    href="/dashboard/content"
                    icon={
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    badge={user.profile?.content.length || 0}
                  />
                  <DashboardCard
                    title="Bookings"
                    description="View and manage your bookings"
                    href="/dashboard/bookings"
                    icon={
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    color="secondary"
                  />
                  <DashboardCard
                    title="Messages"
                    description="Chat with clients"
                    href="/dashboard/messages"
                    icon={
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    }
                    badge={unreadMessages > 0 ? unreadMessages : undefined}
                    color="accent"
                  />
                  <DashboardCard
                    title="Earnings"
                    description="View your payment history"
                    href="/dashboard/earnings"
                    icon={
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    color="secondary"
                  />
                </>
              ) : (
                <>
                  <DashboardCard
                    title="Browse Performers"
                    description="Find and connect with performers"
                    href="/profiles"
                    icon={
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                  />
                  <DashboardCard
                    title="My Bookings"
                    description="View your scheduled sessions"
                    href="/dashboard/bookings"
                    icon={
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    color="secondary"
                  />
                  <DashboardCard
                    title="Messages"
                    description="Chat with performers"
                    href="/dashboard/messages"
                    icon={
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    }
                    badge={unreadMessages > 0 ? unreadMessages : undefined}
                    color="accent"
                  />
                  <DashboardCard
                    title="Favorites"
                    description="Your saved performers"
                    href="/dashboard/favorites"
                    icon={
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    }
                    color="secondary"
                  />
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Bookings</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => {
                    const otherUser = isPerformer ? booking.client : booking.performer
                    return (
                      <Link
                        key={booking.id}
                        href="/dashboard/bookings"
                        className="block p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden">
                            {otherUser.image ? (
                              <SafeImage src={otherUser.image} alt={otherUser.name || ''} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                {otherUser.name?.[0] || '?'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{otherUser.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-400">{format(new Date(booking.date), 'MMM d, h:mm a')}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">${booking.rate}/hr • {booking.duration} min</p>
                      </Link>
                    )
                  })}
                  <Link
                    href="/dashboard/bookings"
                    className="block text-center py-2 text-primary hover:text-primary/80 text-sm font-semibold"
                  >
                    View All →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

