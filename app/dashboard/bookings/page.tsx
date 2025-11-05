import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import BookingCard from '@/components/BookingCard'
import Navbar from '@/components/Navbar'

export default async function BookingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const bookings = await prisma.booking.findMany({
    where: session.user.role === 'PERFORMER'
      ? { performerId: session.user.id }
      : { clientId: session.user.id },
    include: {
      performer: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            select: {
              location: true,
            },
          },
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      payment: true,
    },
    orderBy: {
      date: 'desc',
    },
  })

  const isPerformer = session.user.role === 'PERFORMER'

  // Organize bookings by status
  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')

  // Get upcoming bookings
  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate >= new Date() && (b.status === 'pending' || b.status === 'confirmed')
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-gray-400">
              {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          {!isPerformer && (
            <Link
              href="/profiles"
              className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 rounded-lg hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-lg shadow-primary/30 font-semibold"
            >
              Browse Performers
            </Link>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-gray-700">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl text-gray-400 mb-4">No bookings yet.</p>
            {!isPerformer && (
              <Link
                href="/profiles"
                className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 rounded-lg hover:from-primary/90 hover:to-purple-600/90 inline-block transition-all shadow-lg shadow-primary/30 font-semibold"
              >
                Browse Performers
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Upcoming ({upcomingBookings.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking as any} 
                      isPerformer={isPerformer} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Bookings */}
            {pendingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                  Pending ({pendingBookings.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {pendingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking as any} isPerformer={isPerformer} />
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed Bookings */}
            {confirmedBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                  Confirmed ({confirmedBookings.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {confirmedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking as any} isPerformer={isPerformer} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Bookings */}
            {completedBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                  Completed ({completedBookings.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking as any} isPerformer={isPerformer} />
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Bookings */}
            {cancelledBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                  Cancelled ({cancelledBookings.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {cancelledBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking as any} isPerformer={isPerformer} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

