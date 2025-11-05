'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Booking, Profile, Payment } from '@prisma/client'
import { format } from 'date-fns'
import SafeImage from './SafeImage'
import Link from 'next/link'

interface BookingCardProps {
  booking: Booking & {
    performer: {
      id: string
      name: string | null
      image: string | null
      profile: Profile | null
    }
    client: {
      id: string
      name: string | null
      image: string | null
    }
    payment: Payment | null
  }
  isPerformer: boolean
}

export default function BookingCard({ booking, isPerformer }: BookingCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus} this booking?`)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update booking')
      }
    } catch (error) {
      alert('Failed to update booking')
    } finally {
      setLoading(false)
    }
  }

  const otherUser = isPerformer ? booking.client : booking.performer
  const otherUserProfile = isPerformer ? null : booking.performer.profile
  
  const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
    pending: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    confirmed: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    completed: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    cancelled: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  }

  const status = statusConfig[booking.status] || statusConfig.pending
  const totalAmount = ((booking.duration / 60) * booking.rate).toFixed(2)
  const bookingDate = new Date(booking.date)
  const isPast = bookingDate < new Date()

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all">
      {/* Header */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link href={isPerformer ? `/dashboard/messages/${booking.client.id}` : `/profiles/${booking.performer.id}`}>
              <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600 flex-shrink-0 hover:border-primary transition">
                {otherUser.image ? (
                  <SafeImage
                    src={otherUser.image}
                    alt={otherUser.name || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                    {otherUser.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link 
                href={isPerformer ? `/dashboard/messages/${booking.client.id}` : `/profiles/${booking.performer.id}`}
                className="block hover:text-primary transition"
              >
                <h3 className="text-lg font-bold truncate">{otherUser.name || 'Anonymous'}</h3>
              </Link>
              <p className="text-sm text-gray-400 capitalize">{booking.type} Session</p>
              {otherUserProfile?.location && (
                <p className="text-xs text-gray-500 mt-1">📍 {otherUserProfile.location}</p>
              )}
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex-shrink-0 ${status.bg} ${status.color} ${status.border}`}>
            {booking.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        {/* Date & Time - Compact */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-400">Date & Time</span>
            </div>
            <p className="text-sm font-semibold">{format(bookingDate, 'MMM d, yyyy')}</p>
            <p className="text-xs text-gray-400">{format(bookingDate, 'h:mm a')}</p>
            {isPast && booking.status !== 'completed' && booking.status !== 'cancelled' && (
              <span className="text-xs text-red-400 mt-1 block">Past</span>
            )}
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-gray-400">Duration</span>
            </div>
            <p className="text-sm font-semibold">{booking.duration} minutes</p>
            <p className="text-xs text-gray-400">{Math.floor(booking.duration / 60)}h {booking.duration % 60}m</p>
          </div>
        </div>

        {/* Pricing - Compact */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Rate</p>
              <p className="text-sm font-semibold">${booking.rate}/hr</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-primary">${totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Notes & Location */}
        {(booking.notes || booking.location) && (
          <div className="space-y-2 mb-4">
            {booking.location && (
              <div className="flex items-start gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-300">{booking.location}</span>
              </div>
            )}
            {booking.notes && (
              <div className="flex items-start gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="text-gray-300">{booking.notes}</span>
              </div>
            )}
          </div>
        )}

        {/* Payment Status */}
        {booking.payment && (
          <div className={`mb-4 p-3 rounded-lg border ${
            booking.payment.status === 'completed' 
              ? 'bg-green-500/10 border-green-500/30' 
              : booking.payment.status === 'pending'
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Payment Status</span>
              <span className={`text-xs font-semibold ${
                booking.payment.status === 'completed' ? 'text-green-400' :
                booking.payment.status === 'pending' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {booking.payment.status.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-700">
          {isPerformer && booking.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-sm transition"
              >
                Confirm
              </button>
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold text-sm transition"
              >
                Cancel
              </button>
            </>
          )}

          {isPerformer && booking.status === 'confirmed' && (
            <button
              onClick={() => handleStatusUpdate('completed')}
              disabled={loading}
              className="w-full py-2.5 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-sm transition"
            >
              Mark as Completed
            </button>
          )}

          {!isPerformer && booking.status === 'pending' && (
            <button
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={loading}
              className="w-full py-2.5 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold text-sm transition"
            >
              Cancel Booking
            </button>
          )}

          {!isPerformer && booking.status === 'confirmed' && !booking.payment && (
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/payments/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId: booking.id }),
                  })
                  const data = await res.json()
                  if (data.url) {
                    window.location.href = data.url
                  } else {
                    alert(data.error || 'Failed to initiate payment')
                  }
                } catch (error) {
                  alert('Failed to initiate payment')
                }
              }}
              className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold text-sm transition shadow-lg shadow-green-500/30"
            >
              Pay ${totalAmount}
            </button>
          )}

          {/* Message Link */}
          <Link
            href={`/dashboard/messages/${otherUser.id}`}
            className="py-2.5 px-4 bg-gray-700 rounded-lg hover:bg-gray-600 font-semibold text-sm transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </Link>
        </div>
      </div>
    </div>
  )
}
